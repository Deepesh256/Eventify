// utils/sendEmail.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT || 587),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// optional: verify transporter on startup will show in console when module is required
transporter.verify().then(() => {
  console.log('Mailer is ready');
}).catch(err => {
  console.warn('Mailer verify failed:', err.message || err);
});

module.exports = async function sendEmail(to, subject, html, text) {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text: text || '',
    html: html || ''
  });
  return info;
};
