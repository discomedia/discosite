import type { Handler } from "@netlify/functions";
import { json } from "./_auth";
import { sendFormEmail, validateEmail } from "./_mail";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed." });
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(event.body || "{}") as Record<string, unknown>;
  } catch {
    return json(400, { error: "Invalid support request." });
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const product = String(body.product || "").trim();
  const message = String(body.message || "").trim();

  if (!name || !validateEmail(email) || !product || message.length < 5) {
    return json(400, { error: "Please provide your name, email, product or site, and message." });
  }

  try {
    await sendFormEmail("Disco Media support form", { name, email, product, message });
    return json(200, { ok: true });
  } catch (error) {
    return json(500, { error: error instanceof Error ? error.message : "Unable to send message." });
  }
};
