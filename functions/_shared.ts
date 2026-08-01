export type Env = {
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
  CONTACT_FROM_EMAIL?: string;
  CONTACT_TO_EMAIL?: string;
  DISCO_MAIL_API_KEY?: string;
  DISCO_MEDIA_CMS: {
    get<T>(key: string, type: "json"): Promise<T | null>;
    put(key: string, value: string): Promise<void>;
  };
  ASSETS: {
    fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  };
};

export type PageContext = {
  request: Request;
  env: Env;
  next(input?: RequestInfo | URL, init?: RequestInit): Promise<Response>;
};

export type PageFunction = (context: PageContext) => Response | Promise<Response>;

export function json(body: unknown, status = 200, headers: HeadersInit = {}): Response {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("Content-Type", "application/json; charset=utf-8");
  responseHeaders.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(body), { status, headers: responseHeaders });
}

export function methodNotAllowed(): Response {
  return json({ error: "Method not allowed." }, 405, { Allow: "GET, PUT, DELETE" });
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? body as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

export function normalizeSlug(input: string): string {
  if (!input || input === "/") return "/";
  const segments = input
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .map((segment) => segment.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, ""))
    .filter(Boolean);
  return segments.length ? `/${segments.join("/")}` : "/";
}
