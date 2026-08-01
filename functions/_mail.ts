import { disco } from "@discomedia/utils";
import { escapeHtml, type Env } from "./_shared";

export async function sendFormEmail(env: Env, subject: string, payload: Record<string, unknown>): Promise<void> {
  if (!env.DISCO_MAIL_API_KEY || !env.CONTACT_TO_EMAIL || !env.CONTACT_FROM_EMAIL) {
    throw new Error("Email delivery is not configured.");
  }
  const rows = Object.entries(payload)
    .map(
      ([key, value]) =>
        `<tr><th align="left" style="padding:8px;border-bottom:1px solid #e2e8f0">${escapeHtml(key)}</th><td style="padding:8px;border-bottom:1px solid #e2e8f0">${escapeHtml(value)}</td></tr>`,
    )
    .join("");
  await disco.mail.send(
    {
      from: env.CONTACT_FROM_EMAIL,
      to: env.CONTACT_TO_EMAIL,
      subject,
      replyTo: typeof payload.email === "string" ? payload.email : undefined,
      html: `<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${rows}</table>`,
    },
    { apiKey: env.DISCO_MAIL_API_KEY },
  );
}
