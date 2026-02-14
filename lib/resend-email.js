import { Resend } from "resend";
import { env } from "../config/env.js";

const resend = new Resend(env.RESEND_API_KEY);

export const resendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "URL_Shortener <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });
    if (error) {
      return console.error({ error });
    }
    console.log("Email sent successfully.");
    console.log(data);
  } catch (error) {
    console.error(error);
  }
};
