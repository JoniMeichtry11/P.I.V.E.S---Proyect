const nodemailer = require("nodemailer");
const dns = require("dns");
const net = require("net");

// Fuerza IPv4 globalmente en el lookup de DNS - CRÍTICO para Render
dns.setDefaultResultOrder("ipv4first");

/**
 * Resuelve un hostname a su dirección IPv4 de forma explícita.
 * Esto evita que Render intente conectarse por IPv6 (lo cual falla con ENETUNREACH).
 */
const resolveIPv4 = (host) => {
  return new Promise((resolve, reject) => {
    // Si ya es una IP, la devolvemos directo
    if (net.isIPv4(host)) return resolve(host);
    
    dns.resolve4(host, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        // Fallback: intentar con lookup forzando IPv4
        dns.lookup(host, { family: 4 }, (err2, address) => {
          if (err2) return reject(err2);
          resolve(address);
        });
      } else {
        resolve(addresses[0]);
      }
    });
  });
};

// Configuración del transportador de nodemailer
// Se recomienda usar variables de entorno para las credenciales.
const createTransport = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    let smtpHost = process.env.SMTP_HOST;
    
    // Resolvemos el hostname a IPv4 antes de conectar para evitar el error
    // ENETUNREACH en Render (que no soporta IPv6 saliente)
    try {
      const resolvedIP = await resolveIPv4(smtpHost);
      console.log(`[SMTP] Host '${smtpHost}' resuelto a IPv4: ${resolvedIP}`);
      smtpHost = resolvedIP;
    } catch (resolveErr) {
      console.warn(`[SMTP] No se pudo resolver '${smtpHost}' a IPv4, usando hostname original. Error: ${resolveErr.message}`);
    }

    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    // Puerto 465 = SSL directo (secure: true)
    // Puerto 587 = STARTTLS (secure: false, el cifrado se negocia después)
    // Render suele bloquear el 465, por eso se recomienda usar el 587
    const isSecure = smtpPort === 465;

    console.log(`[SMTP] Configurando transporte: host=${smtpHost}, port=${smtpPort}, secure=${isSecure}`);

    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Doble protección IPv4: forzamos también a nivel de socket
      family: 4,
      connectionTimeout: 30000,
      socketTimeout: 30000,
      greetingTimeout: 15000,
      tls: {
        rejectUnauthorized: false,
        servername: process.env.SMTP_HOST, // Hostname original para TLS (no la IP resuelta)
      }
    });
  } else {
    // Si no hay configuración, logueamos pero no fallamos (para no romper el server)
    console.warn("ADVERTENCIA: No se han configurado las variables SMTP. Los correos no se enviarán.");
    return null;
  }
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = await createTransport(); // ahora es async
  if (!transporter) return false;

  try {
    console.log(`[SMTP] Intentando conectar a ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}...`);
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
    console.error("Código de error:", error.code);
    if (error.code === 'EAUTH') console.error("❌ Error de Autenticación: Usuario o contraseña incorrectos.");
    if (error.code === 'ESOCKET') console.error("❌ Error de Socket: Problemas de red en la conexión.");
    if (error.code === 'ECONNECTION' || error.message.includes('ENETUNREACH')) {
      console.error("❌ Error de Conexión: No se pudo conectar al servidor SMTP (Revisa host/puerto).");
      console.error("   SUGERENCIA: Cambia SMTP_HOST a 'c2731777.ferozo.com' en las variables de entorno de Render.");
    }
    if (error.code === 'ETIMEDOUT') console.error("❌ Error de Timeout: El servidor SMTP no responde.");
    if (error.message.includes('timeout')) console.error("❌ Connection Timeout: No hay conectividad con el servidor SMTP.");
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
