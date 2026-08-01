import { sendFormEmail } from "../_mail";
import { json, readJson, validateEmail, type Env, type PageFunction } from "../_shared";

export const onRequestPost: PageFunction = async ({ request, env }) => {
  const body = await readJson(request);
  if (!body) return json({ error: "Invalid contact request." }, 400);
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();
  if (!name || !validateEmail(email) || message.length < 5) {
    return json({ error: "Please provide your name, a valid email, and a message." }, 400);
  }
  try {
    await sendFormEmail(env, "Disco Media contact form", { name, email, message });
    return json({ ok: true });
  } catch (error) {
    console.error("Unable to deliver contact form", error);
    return json({ error: error instanceof Error ? error.message : "Unable to send message." }, 500);
  }
};
