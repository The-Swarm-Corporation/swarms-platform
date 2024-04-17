import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
const mailer = () => {
  const config: SMTPTransport.Options = {
    host: 'smtp.ethereal.email',
    port: Number(process.env?.SMTP_PORT) || 587,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: 'alec.strosin@ethereal.email',
      pass: 'uMvW3Y4TqjjhgHHYfy'
    },
  };
  return nodemailer.createTransport(config);
};

export default mailer;
