import { createSessionCookie } from "../_auth";
import { json, readJson, type Env, type PageFunction } from "../_shared";

export const onRequestPost: PageFunction = async ({ request, env }) => {
  if (!env.ADMIN_PASSWORD) return json({ error: "ADMIN_PASSWORD is not configured." }, 500);
  const body = await readJson(request);
  if (!body) return json({ error: "Invalid login request." }, 400);
  if (body.password !== env.ADMIN_PASSWORD) return json({ error: "Invalid password." }, 401);

  const sessionCookie = await createSessionCookie(env);
  if (!sessionCookie) return json({ error: "ADMIN_SESSION_SECRET is not configured." }, 500);
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie });
};
