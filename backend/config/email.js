// backend/config/email.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // .env
    pass: process.env.EMAIL_PASS,
  },
});

export const enviarCorreoGenerico = async (to, subject, html) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};

export const enviarCorreoConfirmacion = async (destinatario, nombre) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: destinatario,
    subject: 'Confirmación de registro - Precolombinos',
    html: `<h3>Hola ${nombre},</h3><p>Gracias por registrarte en Precolombinos. Tu cuenta ha sido creada con éxito.</p>`
  };

  await transporter.sendMail(mailOptions);
};
export const enviarCorreoRecuperacion = async (destinatario, nombre, enlace) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: destinatario,
    subject: 'Recuperación de contraseña - Precolombinos',
    html: `<p>Hola ${nombre},</p>
           <p>Recibimos una solicitud para restablecer tu contraseña.</p>
           <p>Puedes restablecerla haciendo clic en el siguiente enlace:</p>
           <a href="${enlace}">${enlace}</a>
           <p>Este enlace expirará en 15 minutos.</p>`
  };

  await transporter.sendMail(mailOptions);
};