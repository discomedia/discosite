import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";

const snapshotOnly = process.argv.includes("--snapshot-only");
const siteUrl = (process.env.NETLIFY_SITE_URL || "https://discomedia.co").replace(/\/+$/, "");

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function hash(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

async function getLegacyCms() {
  const password = required("ADMIN_PASSWORD");
  const login = await fetch(`${siteUrl}/.netlify/functions/admin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!login.ok) throw new Error(`Netlify admin login failed (${login.status}).`);
  const cookie = login.headers.get("set-cookie");
  if (!cookie) throw new Error("Netlify admin login did not return a session cookie.");
  const headers = { Cookie: cookie.split(";")[0] };
  const [pagesResponse, menuResponse] = await Promise.all([
    fetch(`${siteUrl}/.netlify/functions/pages`, { headers }),
    fetch(`${siteUrl}/.netlify/functions/menu`, { headers }),
  ]);
  if (!pagesResponse.ok || !menuResponse.ok) throw new Error("Unable to read Netlify CMS data.");
  const pagesPayload = await pagesResponse.json();
  const menuPayload = await menuResponse.json();
  if (!Array.isArray(pagesPayload.pages) || !Array.isArray(menuPayload.items)) {
    throw new Error("Netlify CMS returned an unexpected payload.");
  }
  return { pages: pagesPayload.pages, menu: menuPayload.items };
}

async function termsPage() {
  const source = await readFile(path.resolve("src/content/pages/terms.md"), "utf8");
  const parsed = matter(source);
  return { ...parsed.data, markdown: parsed.content.trim() };
}

function withTerms(snapshot, terms) {
  const pages = [...snapshot.pages.filter((page) => page.slug !== "/terms"), terms].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  const menu = snapshot.menu.some((item) => item.id === "footer-terms")
    ? snapshot.menu
    : [...snapshot.menu, { id: "footer-terms", label: "Terms", url: "/terms", area: "footer", order: 4, published: true }]
        .map((item) => item.id === "footer-admin" ? { ...item, order: 99 } : item);
  return { pages, menu };
}

async function putKv(namespaceId, key, value) {
  const accountId = required("CLOUDFLARE_ACCOUNT_ID");
  const token = required("CLOUDFLARE_API_TOKEN");
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`;
  const response = await fetch(endpoint, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });
  if (!response.ok) throw new Error(`Unable to write KV key ${key} (${response.status}).`);
  const verification = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
  if (!verification.ok) throw new Error(`Unable to verify KV key ${key} (${verification.status}).`);
  const written = await verification.json();
  if (hash(written) !== hash(value)) throw new Error(`KV verification failed for ${key}.`);
}

const legacy = await getLegacyCms();
const snapshot = {
  exportedAt: new Date().toISOString(),
  source: siteUrl,
  pageCount: legacy.pages.length,
  menuCount: legacy.menu.length,
  pagesHash: hash(legacy.pages),
  menuHash: hash(legacy.menu),
  ...legacy,
};
const backupDir = path.resolve(".local/migration-backups");
await mkdir(backupDir, { recursive: true });
const backupPath = path.join(backupDir, `netlify-cms-${snapshot.exportedAt.replace(/[:.]/g, "-")}.json`);
await writeFile(backupPath, `${JSON.stringify(snapshot, null, 2)}\n`, { mode: 0o600 });
console.log(`Saved Netlify CMS snapshot (${snapshot.pageCount} pages, ${snapshot.menuCount} menu items) to ${backupPath}`);

if (!snapshotOnly) {
  const namespaceId = required("DISCO_MEDIA_CMS_NAMESPACE_ID");
  const migrated = withTerms(legacy, await termsPage());
  await putKv(namespaceId, "pages", migrated.pages);
  await putKv(namespaceId, "menu", migrated.menu);
  console.log(`Migrated ${migrated.pages.length} pages and ${migrated.menu.length} menu items to Cloudflare KV.`);
}
