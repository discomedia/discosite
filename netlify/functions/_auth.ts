import crypto from "node:crypto";
import type { HandlerEvent, HandlerResponse } from "@netlify/functions";

const cookieName = "dm_admin";
const maxAgeSeconds = 60 * 60 * 8;

function isLocalDevelopment(): boolean {
  return process.env.NETLIFY_DEV === "true" || process.env.CONTEXT === "dev" || process.env.NODE_ENV === "development";
}

function secret(): string | null {
  if (process.env.ADMIN_SESSION_SECRET) return process.env.ADMIN_SESSION_SECRET;
  if (isLocalDevelopment()) return process.env.ADMIN_PASSWORD || "local-development-secret";
  return null;
}

function sign(value: string): string | null {
  const signingSecret = secret();
  if (!signingSecret) return null;
  return crypto.createHmac("sha256", signingSecret).update(value).digest("base64url");
}

export function createSessionCookie(): string | null {
  const expires = Date.now() + maxAgeSeconds * 1000;
  const signature = sign(String(expires));
  if (!signature) return null;
  const value = `${expires}.${signature}`;
  return `${cookieName}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}; Secure`;
}

export function isAuthenticated(event: HandlerEvent): boolean {
  const cookie = event.headers.cookie || event.headers.Cookie || "";
  const match = cookie.match(new RegExp(`${cookieName}=([^;]+)`));
  if (!match) return false;

  const [expires, signature] = decodeURIComponent(match[1]).split(".");
  if (!expires || !signature) return false;
  if (Number(expires) < Date.now()) return false;

  const expectedSignature = sign(expires);
  if (!expectedSignature) return false;

  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedSignatureBuffer.length) return false;

  return crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer);
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
  if (!secret()) return json(500, { error: "ADMIN_SESSION_SECRET is not configured." });
  if (isAuthenticated(event)) return null;
  return json(401, { error: "Authentication required." });
}
