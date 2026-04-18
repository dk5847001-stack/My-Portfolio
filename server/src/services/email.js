import nodemailer from "nodemailer";

let cachedTransporter;

const getTransporter = async () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  return cachedTransporter;
};

export const sendEmailNotification = async ({ to, subject, text, html }) => {
  const transporter = await getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!transporter || !to || !from) {
    return { delivered: false, reason: "email-not-configured" };
  }

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  return { delivered: true };
};
