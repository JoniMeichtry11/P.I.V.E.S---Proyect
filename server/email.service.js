const nodemailer = require("nodemailer");

// Configuración del transportador de nodemailer
// Se recomienda usar variables de entorno para las credenciales.
const createTransport = () => {
  // Para pruebas/desarrollo, si no hay credenciales, usamos Ethereal (ficticio)
  const isProd = process.env.NODE_ENV === "production";
  
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: process.env.SMTP_PORT === "465", // true para 465, false para otros
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // FUERZA IPv4: Render a veces tiene problemas conectando por IPv6
      // Esto soluciona el error ENETUNREACH
      family: 4, 
      connectionTimeout: 10000, // 10 segundos
      socketTimeout: 10000,
      tls: {
        // No fallar si el certificado tiene discrepancias de nombre (común en servers compartidos)
        rejectUnauthorized: false 
      }
    });
  } else {
    // Si no hay configuración, logueamos pero no fallamos (para no romper el server)
    console.warn("ADVERTENCIA: No se han configurado las variables SMTP. Los correos no se enviarán.");
    return null;
  }
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = createTransport();
  if (!transporter) return false;

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Programa P.I.V.E.S" <noreply@pives.com.ar>',
      to,
      subject,
      text,
      html,
    });
    console.log("Email enviado satisfactoriamente: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("ERROR CRÍTICO SMTP:", error.message);
    if (error.code === 'EAUTH') console.error("Error de Autenticación: Usuario o contraseña incorrectos.");
    if (error.code === 'ESOCKET') console.error("Error de Conexión: No se pudo conectar al servidor SMTP (Revisa host/puerto).");
    return false;
  }
};

const sendConfirmationEmail = async (email, childName, booking) => {
  const dateFormatted = new Date(booking.date + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const subject = `🚗 Reserva Confirmada - ${childName}`;
  const text = `Hola! Tu reserva ha sido confirmada.\n\nHijo/a: ${childName}\nCoche: ${booking.car.name}\nFecha: ${dateFormatted}\nHora: ${booking.time}\n\n¡Te esperamos!`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h2 style="color: #2c3e50; text-align: center;">¡Reserva Confirmada! 🚗</h2>
      <p>Hola, <strong>${childName}</strong> tiene una nueva aventura programada.</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Coche:</strong> ${booking.car.name}</p>
        <p><strong>Fecha:</strong> ${dateFormatted}</p>
        <p><strong>Hora:</strong> ${booking.time}</p>
        <p><strong>Combustible:</strong> ${booking.car.pricePerSlot} Lts</p>
      </div>
      <p style="text-align: center; color: #7f8c8d; font-size: 0.9em;">Nos vemos en la pista de P.I.V.E.S</p>
    </div>
  `;

  return await sendEmail({ to: email, subject, text, html });
};

const sendReminderEmail = async (email, childName, booking, isSameDay = false) => {
  const subject = isSameDay 
    ? `🔔 ¡Hoy es tu aventura, ${childName}!` 
    : `📅 Recordatorio de Reserva - Mañana`;
    
  const text = isSameDay
    ? `¡Hola! Te recordamos que hoy tienes una reserva a las ${booking.time} con el ${booking.car.name}.`
    : `¡Hola! Mañana tienes una reserva a las ${booking.time} con el ${booking.car.name}.`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h2 style="color: #e67e22; text-align: center;">${isSameDay ? '¡Es hoy! 🏁' : 'Recordatorio de Reserva 📅'}</h2>
      <p>Hola! Falta muy poco para que <strong>${childName}</strong> empiece a conducir.</p>
      <div style="background-color: #fff4e5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Coche:</strong> ${booking.car.name}</p>
        <p><strong>Hora:</strong> ${booking.time}</p>
        <p><strong>Cuando:</strong> ${isSameDay ? 'Hoy mismo' : 'Mañana'}</p>
      </div>
      <p style="text-align: center; color: #7f8c8d; font-size: 0.9em;">¡No olvides llegar puntual!</p>
    </div>
  `;

  return await sendEmail({ to: email, subject, text, html });
};

module.exports = {
  sendConfirmationEmail,
  sendReminderEmail
};
