import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { MenuItemRecord, PageRecord } from "./types";

const pagesDir = path.join(process.cwd(), "src", "content", "pages");

function normalizeSlug(slug: string): string {
  if (!slug || slug === "/") return "/";
  const segments = slug
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);
  return segments.length ? `/${segments.join("/")}` : "/";
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

export function seedMenuItems(pages: PageRecord[] = publicSeedPages()): MenuItemRecord[] {
  const publishedPages = pages.filter((page) => page.published).sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  const pageMenuItems = publishedPages.map((page) => ({
    id: `primary-${slugToKey(page.slug)}`,
    label: page.navLabel,
    url: page.slug,
    area: "primary" as const,
    order: page.order,
    published: true,
  }));

  return [
    ...pageMenuItems,
    {
      id: "primary-admin",
      label: "Admin",
      url: "/admin",
      area: "primary",
      order: 99,
      published: true,
    },
    {
      id: "header-cta-contact",
      label: "Contact",
      url: "/contact",
      area: "headerCta",
      order: 1,
      published: true,
    },
    {
      id: "footer-contact",
      label: "Contact",
      url: "/contact",
      area: "footer",
      order: 1,
      published: true,
    },
    {
      id: "footer-support",
      label: "Support",
      url: "/support",
      area: "footer",
      order: 2,
      published: true,
    },
    {
      id: "footer-privacy",
      label: "Privacy",
      url: "/privacy",
      area: "footer",
      order: 3,
      published: true,
    },
    {
      id: "footer-terms",
      label: "Terms",
      url: "/terms",
      area: "footer",
      order: 4,
      published: true,
    },
    {
      id: "footer-admin",
      label: "Admin",
      url: "/admin",
      area: "footer",
      order: 99,
      published: true,
    },
  ];
}

export function coreSlugs(): string[] {
  return ["/", "/contact", "/support", "/privacy", "/terms"];
}
