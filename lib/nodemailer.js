import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const testAccount = await nodemailer.createTestAccount();
// Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: env.ETHEREAL_USERNAME,
    pass: env.ETHEREAL_PASSWORD,
  },
});

// Send an email using async/await
export const sendEmail = async ({ to, subject, html }) => {
  const info = await transporter.sendMail({
    from: `URL_SHORTENER ${testAccount.user}`,
    to,
    subject,
    html,
  });
  const testEmailURL = nodemailer.getTestMessageUrl(info);
  console.log("Verification Email: ", testEmailURL);
};
