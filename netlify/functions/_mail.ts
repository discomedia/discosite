import { Resend } from "resend";

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function sendFormEmail(subject: string, payload: Record<string, unknown>) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    throw new Error("Email delivery is not configured.");
  }

  const resend = new Resend(apiKey);
  const rows = Object.entries(payload)
    .map(
      ([key, value]) =>
        `<tr><th align="left" style="padding:8px;border-bottom:1px solid #e2e8f0">${escapeHtml(key)}</th><td style="padding:8px;border-bottom:1px solid #e2e8f0">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  await resend.emails.send({
    from,
    to,
    subject,
    replyTo: typeof payload.email === "string" ? payload.email : undefined,
    html: `<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${rows}</table>`,
  });
}
