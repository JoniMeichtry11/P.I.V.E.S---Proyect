require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MercadoPagoConfig, Preference } = require("mercadopago");
const admin = require("firebase-admin");

// Inicialización de Firebase Admin
let serviceAccount;
try {
  // Intentar cargar desde el archivo local (para desarrollo)
  serviceAccount = require("./serviceAccountKey.json");
} catch (e) {
  // Si no está el archivo (producción/Render), intentar cargarlo desde variable de entorno
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (parseError) {
      console.error(
        "Error al parsear FIREBASE_SERVICE_ACCOUNT:",
        parseError.message,
      );
    }
  }
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("Firebase Admin inicializado correctamente");
} else {
  console.warn(
    "ADVERTENCIA: No se pudo inicializar Firebase Admin. La eliminación de usuarios no funcionará.",
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

    // 1. Verificar el token del administrador
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

app.get("/health", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
