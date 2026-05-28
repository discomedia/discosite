import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { PageRecord } from "./types";

const pagesDir = path.join(process.cwd(), "src", "content", "pages");

function normalizeSlug(slug: string): string {
  if (!slug || slug === "/") return "/";
  return `/${slug.replace(/^\/+|\/+$/g, "")}`;
}

export function slugToKey(slug: string): string {
  return normalizeSlug(slug).replace(/\//g, "__") || "__";
}

export function pagePathFromSlug(slug: string): string {
  const normalized = normalizeSlug(slug);
  if (normalized === "/") return "/";
  return normalized;
}

export function readSeedPages(): PageRecord[] {
  if (!fs.existsSync(pagesDir)) return [];

  return fs
    .readdirSync(pagesDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const source = fs.readFileSync(path.join(pagesDir, file), "utf8");
      const parsed = matter(source);
      const data = parsed.data as Partial<PageRecord>;

      return {
        slug: normalizeSlug(String(data.slug ?? `/${file.replace(/\.md$/, "")}`)),
        title: String(data.title ?? "Untitled"),
        navLabel: String(data.navLabel ?? data.title ?? "Untitled"),
        seoTitle: String(data.seoTitle ?? data.title ?? "Disco Media"),
        description: String(data.description ?? ""),
        order: Number(data.order ?? 99),
        published: Boolean(data.published ?? true),
        markdown: parsed.content.trim(),
        updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
      };
    })
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export function findSeedPage(slug: string): PageRecord | undefined {
  const normalized = normalizeSlug(slug);
  return readSeedPages().find((page) => page.slug === normalized);
}

export function publicSeedPages(): PageRecord[] {
  return readSeedPages().filter((page) => page.published);
}

export function coreSlugs(): string[] {
  return ["/", "/contact", "/support", "/privacy"];
}
