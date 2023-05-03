const senderEmail = process.env.SENDER_EMAIL;
const senderPassword = process.env.SENDER_PASSWORD;

const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, html }) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    auth: {
      user: senderEmail,
      pass: senderPassword,
    },
    secure: false, // используйте STARTTLS, а не SSL/TLS
    port: 587,
    tls: {
      rejectUnauthorized: true,
    },
  });

  const mailOptions = {
    from: 'support@everyfin.fi',
    to,
    subject,
    html,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error while sending email:', error);
  }
}

module.exports = sendEmail;
