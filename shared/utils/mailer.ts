import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
const mailer = () => {
  const config: SMTPTransport.Options = {
    host: process.env?.SMTP_HOST || '',
    port: Number(process.env?.SMTP_PORT) || 587,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    service: 'aws',
  };
  return nodemailer.createTransport(config);
};

export default mailer;
