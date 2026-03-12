require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MercadoPagoConfig, Preference } = require("mercadopago");
const admin = require("firebase-admin");
const { sendConfirmationEmail, sendReminderEmail } = require("./email.service");

// Inicialización de Firebase Admin
let serviceAccount;

try {
  // Intentar cargar desde el archivo local (para desarrollo)
  serviceAccount = require("./serviceAccountKey.json");
  console.log("Firebase Admin: Cargado desde serviceAccountKey.json");
} catch (e) {
  // Si no está el archivo (producción/Render), intentar cargarlo desde variables de entorno
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      console.log("Firebase Admin: Cargado desde FIREBASE_SERVICE_ACCOUNT");
    } catch (parseError) {
      console.error(
        "Error al parsear FIREBASE_SERVICE_ACCOUNT:",
        parseError.message
      );
    }
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    // Alternativa: Variables individuales (más fácil de configurar en Render)
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };
    console.log("Firebase Admin: Cargado desde variables de entorno individuales");
  }
}

if (serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin inicializado correctamente");
  } catch (initError) {
    console.error("Error al inicializar Firebase Admin:", initError.message);
  }
} else {
  console.error(
    "ERROR CRÍTICO: No se pudo inicializar Firebase Admin. Las rutas que usan Auth fallarán en Render.",
    "\nPara solucionar esto: Agrega la variable de entorno FIREBASE_SERVICE_ACCOUNT con el contenido de tu JSON o configura FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY y FIREBASE_CLIENT_EMAIL."
  );
}

const app = express();
const port = process.env.PORT || 3000;

// Configuración de CORS para permitir peticiones desde tu app de Angular
app.use(cors());
app.use(express.json());

// Configuración de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 5000 },
});

// Endpoint para crear una preferencia
app.post("/api/create-preference", async (req, res) => {
  try {
    const preference = new Preference(client);
    const body = {
      items: req.body.items,
      back_urls: req.body.back_urls,
      auto_return: req.body.auto_return,
      metadata: req.body.metadata,
      external_reference: req.body.external_reference,
    };

    const response = await preference.create({ body });

    res.json({
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
    });
  } catch (error) {
    console.error("Error creando preferencia:", error);
    res.status(500).json({ error: "Error al crear la preferencia de pago" });
  }
});

// Endpoint para verificar estado de un pago
app.get("/api/payment-status/:id", async (req, res) => {
  try {
    const paymentId = req.params.id;
    const axios = require("axios");
    const response = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      },
    );

    res.json({
      status: response.data.status,
      status_detail: response.data.status_detail,
    });
  } catch (error) {
    console.error(
      "Error obteniendo estado del pago:",
      error.response?.data || error.message,
    );
    res.status(500).json({ error: "Error al obtener el estado del pago" });
  }
});

// Endpoint para eliminar un usuario de Firebase Authentication
app.post("/api/delete-user/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "No autorizado: Falta token de administrador" });
    }

    const idToken = authHeader.split("Bearer ")[1];

    // 1. Verificar que Firebase esté inicializado
    if (admin.apps.length === 0) {
      console.error("Error: Intentando usar Firebase Auth sin inicializar la App.");
      return res.status(500).json({ 
        error: "El servidor no está configurado correctamente para usar Firebase. Contacta al administrador." 
      });
    }

    // 2. Verificar el token del administrador
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Opcional: Validar si el usuario es realmente administrador
    // if (decodedToken.email !== 'testahermanos@gmail.com') { // Puedes usar una variable de entorno
    //   return res.status(403).json({ error: 'Prohibido: No tienes permisos de administrador' });
    // }

    // 2. Eliminar al usuario de Authentication
    await admin.auth().deleteUser(uid);
    console.log(
      `[AUTH] Usuario ${uid} eliminado de Authentication por ${decodedToken.email}`,
    );

    res.json({ success: true, message: "Usuario eliminado de Authentication" });
  } catch (error) {
    console.error("Error al eliminar usuario de Authentication:", error);
    res.status(500).json({
      error:
        "No se pudo eliminar el usuario de Authentication. Verifica que el servidor tenga permisos.",
    });
  }
});

// Endpoint para enviar email de confirmación (llamado desde el frontend)
app.post("/api/send-confirmation", async (req, res) => {
  try {
    const { userAccount, childName, booking } = req.body;
    console.log(`[EMAIL] Solicitando confirmación para: ${userAccount?.parent?.email}, Niño: ${childName}`);
    
    if (!userAccount || !userAccount.parent || !userAccount.parent.email) {
      console.warn("[EMAIL] Error: Faltan datos del usuario o email");
      return res.status(400).json({ error: "Datos del usuario o email faltantes" });
    }

    const success = await sendConfirmationEmail(userAccount.parent.email, childName, booking);
    
    if (success) {
      console.log("[EMAIL] Confirmación enviada con éxito");
      res.json({ success: true, message: "Email de confirmación enviado" });
    } else {
      console.error("[EMAIL] Falló el envío del email (revisar configuración SMTP)");
      res.status(500).json({ error: "No se pudo enviar el email de confirmación. Revisa los logs del servidor." });
    }
  } catch (error) {
    console.error("Error en /api/send-confirmation:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Endpoint para revisar y enviar recordatorios (llamado por cron externo)
app.get("/api/check-reminders", async (req, res) => {
  try {
    console.log("[CRON] Iniciando revisión de recordatorios...");
    
    if (admin.apps.length === 0) {
      return res.status(500).json({ error: "Firebase no inicializado" });
    }

    const db = admin.firestore();
    const usersSnapshot = await db.collection("users").get();
    
    const now = new Date();
    // Ajustar a zona horaria local (Argentina -03:00) si es necesario
    // Para simplificar, comparamos fechas en formato YYYY-MM-DD
    const todayStr = now.toISOString().split('T')[0];
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    let remindersCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      let userUpdated = false;

      if (!userData.children) continue;

      for (const child of userData.children) {
        if (!child.bookings) continue;

        for (const booking of child.bookings) {
          if (booking.status !== "active") continue;

          let shouldSendDayBefore = booking.date === tomorrowStr && !booking.remindersSent?.dayBefore;
          let shouldSendSameDay = booking.date === todayStr && !booking.remindersSent?.sameDay;

          if (shouldSendDayBefore || shouldSendSameDay) {
            const emailSuccess = await sendReminderEmail(
              userData.parent.email,
              child.name,
              booking,
              shouldSendSameDay
            );

            if (emailSuccess) {
              if (!booking.remindersSent) {
                booking.remindersSent = { dayBefore: false, sameDay: false };
              }
              
              if (shouldSendDayBefore) booking.remindersSent.dayBefore = true;
              if (shouldSendSameDay) booking.remindersSent.sameDay = true;
              
              userUpdated = true;
              remindersCount++;
            }
          }
        }
      }

      if (userUpdated) {
        await db.collection("users").doc(userDoc.id).update({
          children: userData.children
        });
      }
    }

    console.log(`[CRON] Revisión finalizada. Recordatorios enviados: ${remindersCount}`);
    res.json({ success: true, remindersSent: remindersCount });
  } catch (error) {
    console.error("Error en /api/check-reminders:", error);
    res.status(500).json({ error: "Error procesando recordatorios" });
  }
});

app.get("/health", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
