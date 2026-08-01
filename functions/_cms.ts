import type { MenuArea, MenuItemRecord, PageRecord } from "../src/lib/types";
import { normalizeSlug, type Env } from "./_shared";

const pagesKey = "pages";
const menuKey = "menu";
const coreSlugs = new Set(["/", "/contact", "/support", "/privacy", "/terms"]);
const menuAreas = new Set<MenuArea>(["primary", "headerCta", "footer"]);

export class CmsInputError extends Error {}

function sortPages(pages: PageRecord[]): PageRecord[] {
  return [...pages].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

function sortMenu(items: MenuItemRecord[]): MenuItemRecord[] {
  return [...items].sort((a, b) => a.area.localeCompare(b.area) || a.order - b.order || a.label.localeCompare(b.label));
}

function normalizeUrl(value: string): string {
  const url = value.trim();
  if (!url) throw new CmsInputError("Menu URL is required.");
  if (/^(https?:\/\/|mailto:|tel:)/i.test(url) || url.startsWith("#")) return url;
  return normalizeSlug(url);
}

function pageRecord(input: Partial<PageRecord>): PageRecord {
  const slug = normalizeSlug(String(input.slug ?? ""));
  if (!input.slug || !slug) throw new CmsInputError("Slug is required.");
  if (!String(input.title ?? "").trim()) throw new CmsInputError("Title is required.");
  if (!String(input.markdown ?? "").trim()) throw new CmsInputError("Markdown content is required.");
  const title = String(input.title).trim();
  return {
    slug,
    title,
    navLabel: String(input.navLabel ?? title).trim() || title,
    seoTitle: String(input.seoTitle ?? `${title} | Disco Media`).trim() || `${title} | Disco Media`,
    description: String(input.description ?? "").trim(),
    order: Number(input.order ?? 99),
    published: Boolean(input.published ?? true),
    markdown: String(input.markdown).trim(),
    updatedAt: input.updatedAt || new Date().toISOString(),
  };
}

function menuRecord(input: Partial<MenuItemRecord>, index: number): MenuItemRecord {
  const label = String(input.label ?? "").trim();
  if (!label) throw new CmsInputError("Menu label is required.");
  const area = input.area;
  if (!area || !menuAreas.has(area)) throw new CmsInputError("Menu area is invalid.");
  const id = String(input.id ?? `menu-item-${index + 1}`).trim().replace(/[^a-zA-Z0-9_-]+/g, "-");
  return {
    id: id || `menu-item-${index + 1}`,
    label,
    url: normalizeUrl(String(input.url ?? "")),
    area,
    order: Number(input.order ?? index + 1),
    published: Boolean(input.published ?? true),
    updatedAt: input.updatedAt || new Date().toISOString(),
  };
}

export async function allPages(env: Env): Promise<PageRecord[]> {
  return sortPages((await env.DISCO_MEDIA_CMS.get<PageRecord[]>(pagesKey, "json")) ?? []);
}

export async function findPage(env: Env, slug: string): Promise<PageRecord | undefined> {
  const normalized = normalizeSlug(slug);
  return (await allPages(env)).find((page) => page.slug === normalized);
}

export async function savePage(env: Env, input: Partial<PageRecord>): Promise<PageRecord> {
  const page = pageRecord(input);
  const pages = await allPages(env);
  const next = [...pages.filter((candidate) => candidate.slug !== page.slug), page];
  await env.DISCO_MEDIA_CMS.put(pagesKey, JSON.stringify(sortPages(next)));
  return page;
}

export async function deletePage(env: Env, slug: string): Promise<void> {
  const normalized = normalizeSlug(slug);
  if (coreSlugs.has(normalized)) throw new CmsInputError("Core pages cannot be deleted.");
  await env.DISCO_MEDIA_CMS.put(pagesKey, JSON.stringify((await allPages(env)).filter((page) => page.slug !== normalized)));
}

export async function allMenuItems(env: Env): Promise<MenuItemRecord[]> {
  return sortMenu((await env.DISCO_MEDIA_CMS.get<MenuItemRecord[]>(menuKey, "json")) ?? []);
}

export async function publicMenuItems(env: Env): Promise<MenuItemRecord[]> {
  return (await allMenuItems(env)).filter((item) => item.published);
}

export async function saveMenuItems(env: Env, input: unknown): Promise<MenuItemRecord[]> {
  if (!Array.isArray(input)) throw new CmsInputError("Menu items are required.");
  const items = sortMenu(input.map((item, index) => menuRecord(item as Partial<MenuItemRecord>, index)));
  await env.DISCO_MEDIA_CMS.put(menuKey, JSON.stringify(items));
  return items;
}
