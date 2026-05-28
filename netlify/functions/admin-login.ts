import type { Handler } from "@netlify/functions";
import { createSessionCookie, json, missingSessionSecretError } from "./_auth";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed." });

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return json(500, { error: "ADMIN_PASSWORD is not configured." });

  let body: { password?: string };
  try {
    body = JSON.parse(event.body || "{}") as { password?: string };
  } catch {
    return json(400, { error: "Invalid login request." });
  }

  if (body.password !== expected) {
    return json(401, { error: "Invalid password. In Netlify, set ADMIN_PASSWORD to the raw value without wrapping quotes." });
  }

  const sessionCookie = createSessionCookie();
  if (!sessionCookie) return json(500, { error: missingSessionSecretError() });

  return json(200, { ok: true }, { "Set-Cookie": sessionCookie });
};
