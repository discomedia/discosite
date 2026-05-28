import type { Handler } from "@netlify/functions";
import { json } from "./_auth";
import { sendFormEmail, validateEmail } from "./_mail";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed." });
  const body = JSON.parse(event.body || "{}");
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const message = String(body.message || "").trim();

  if (!name || !validateEmail(email) || message.length < 5) {
    return json(400, { error: "Please provide your name, a valid email, and a message." });
  }

  try {
    await sendFormEmail("Disco Media contact form", { name, email, message });
    return json(200, { ok: true });
  } catch (error) {
    return json(500, { error: error instanceof Error ? error.message : "Unable to send message." });
  }
};
