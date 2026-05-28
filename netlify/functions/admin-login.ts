import type { Handler } from "@netlify/functions";
import { createSessionCookie, json } from "./_auth";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed." });

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return json(500, { error: "ADMIN_PASSWORD is not configured." });

  const body = JSON.parse(event.body || "{}") as { password?: string };
  if (body.password !== expected) return json(401, { error: "Invalid password." });

  const sessionCookie = createSessionCookie();
  if (!sessionCookie) return json(500, { error: "ADMIN_SESSION_SECRET is not configured." });

  return json(200, { ok: true }, { "Set-Cookie": sessionCookie });
};
