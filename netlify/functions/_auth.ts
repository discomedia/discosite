import crypto from "node:crypto";
import type { HandlerEvent, HandlerResponse } from "@netlify/functions";

const cookieName = "dm_admin";
const maxAgeSeconds = 60 * 60 * 8;

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "local-development-secret";
}

function sign(value: string): string {
  return crypto.createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createSessionCookie(): string {
  const expires = Date.now() + maxAgeSeconds * 1000;
  const value = `${expires}.${sign(String(expires))}`;
  return `${cookieName}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}; Secure`;
}

export function isAuthenticated(event: HandlerEvent): boolean {
  const cookie = event.headers.cookie || event.headers.Cookie || "";
  const match = cookie.match(new RegExp(`${cookieName}=([^;]+)`));
  if (!match) return false;

  const [expires, signature] = decodeURIComponent(match[1]).split(".");
  if (!expires || !signature) return false;
  if (Number(expires) < Date.now()) return false;

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(sign(expires)));
}

export function json(statusCode: number, body: unknown, headers: Record<string, string> = {}): HandlerResponse {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  };
}

export function requireAdmin(event: HandlerEvent): HandlerResponse | null {
  if (isAuthenticated(event)) return null;
  return json(401, { error: "Authentication required." });
}
