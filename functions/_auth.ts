import { json, type Env } from "./_shared";

const cookieName = "dm_admin";
const maxAgeSeconds = 60 * 60 * 8;

function toBase64Url(bytes: ArrayBuffer): string {
  const value = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toBase64Url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

function getCookie(request: Request, name: string): string | null {
  const encodedName = `${name}=`;
  for (const part of (request.headers.get("Cookie") ?? "").split(";")) {
    const value = part.trim();
    if (value.startsWith(encodedName)) return decodeURIComponent(value.slice(encodedName.length));
  }
  return null;
}

export async function createSessionCookie(env: Env): Promise<string | null> {
  if (!env.ADMIN_SESSION_SECRET) return null;
  const expires = Date.now() + maxAgeSeconds * 1000;
  const signature = await sign(String(expires), env.ADMIN_SESSION_SECRET);
  return `${cookieName}=${encodeURIComponent(`${expires}.${signature}`)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}; Secure`;
}

export async function isAuthenticated(request: Request, env: Env): Promise<boolean> {
  if (!env.ADMIN_SESSION_SECRET) return false;
  const value = getCookie(request, cookieName);
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  const expected = await sign(expires, env.ADMIN_SESSION_SECRET);
  if (signature.length !== expected.length) return false;
  let matches = 0;
  for (let index = 0; index < signature.length; index += 1) matches |= signature.charCodeAt(index) ^ expected.charCodeAt(index);
  return matches === 0;
}

export async function requireAdmin(request: Request, env: Env): Promise<Response | null> {
  if (!env.ADMIN_SESSION_SECRET) {
    return json({ error: "ADMIN_SESSION_SECRET is not configured." }, 500);
  }
  return (await isAuthenticated(request, env)) ? null : json({ error: "Authentication required." }, 401);
}
