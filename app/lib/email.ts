import { Resend } from "resend";
import type { ReactElement } from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

export type SendEmailOptions = {
  to: string;
  subject: string;
  react?: ReactElement;
  html?: string;
  text?: string;
  from?: string;
};

export async function sendEmail({
  to,
  subject,
  react,
  html,
  text,
  from,
}: SendEmailOptions) {
  await resend.emails.send({
    from: from || (process.env.EMAIL_FROM as string),
    to,
    subject,
    react,
    html,
    text,
  });
}
