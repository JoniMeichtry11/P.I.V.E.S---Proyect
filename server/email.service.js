const { Resend } = require("resend");

// Resend usa HTTP/HTTPS (puerto 443) en lugar de SMTP directo.
// Esto evita el bloqueo de puertos 465/587 en Render.
const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    console.warn("ADVERTENCIA: No se ha configurado RESEND_API_KEY. Los correos no se enviarán.");
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
};

const FROM_ADDRESS = process.env.SMTP_FROM || '"P.I.V.E.S" <no-reply@pives.com.ar>';

const sendEmail = async ({ to, subject, text, html }) => {
  const resend = getResendClient();
  if (!resend) return false;

  try {
    console.log(`[EMAIL] Enviando a: ${to} | Asunto: ${subject}`);
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      text,
      html,
    });

    if (error) {
      console.error("ERROR al enviar email via Resend:", error);
      return false;
    }

    console.log(`[EMAIL] ✅ Email enviado correctamente. ID: ${data.id}`);
    return true;
  } catch (err) {
    console.error("ERROR CRÍTICO al enviar email:", err.message);
    return false;
  }
};

const sendConfirmationEmail = async (email, childName, booking) => {
  const dateFormatted = new Date(booking.date + "T00:00:00").toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const subject = `🚗 Reserva Confirmada - ${childName}`;
  const text = `¡Hola! Tu reserva ha sido confirmada.\n\nHijo/a: ${childName}\nCoche: ${booking.car.name}\nFecha: ${dateFormatted}\nHora: ${booking.time}\n\n¡Te esperamos en P.I.V.E.S!`;
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
      <h2 style="color: #e67e22; text-align: center;">${isSameDay ? "¡Es hoy! 🏁" : "Recordatorio de Reserva 📅"}</h2>
      <p>¡Hola! Falta muy poco para que <strong>${childName}</strong> empiece a conducir.</p>
      <div style="background-color: #fff4e5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Coche:</strong> ${booking.car.name}</p>
        <p><strong>Hora:</strong> ${booking.time}</p>
        <p><strong>Cuándo:</strong> ${isSameDay ? "Hoy mismo" : "Mañana"}</p>
      </div>
      <p style="text-align: center; color: #7f8c8d; font-size: 0.9em;">¡No olvides llegar puntual!</p>
    </div>
  `;

  return await sendEmail({ to: email, subject, text, html });
};

module.exports = {
  sendConfirmationEmail,
  sendReminderEmail,
};
