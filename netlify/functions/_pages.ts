import { connectLambda, getStore } from "@netlify/blobs";
import type { HandlerEvent } from "@netlify/functions";
import fs from "node:fs/promises";
import path from "node:path";
import { coreSlugs, readSeedPages, slugToKey } from "../../src/lib/content";
import type { PageRecord } from "../../src/lib/types";

const storeName = "disco-media-pages";
const localStoreDir = path.join(process.cwd(), ".netlify", "local-blobs", storeName);
type LambdaBlobEvent = Parameters<typeof connectLambda>[0];

export function connectPageStore(event: HandlerEvent): void {
  const lambdaEvent = event as HandlerEvent & Partial<LambdaBlobEvent>;
  if (typeof lambdaEvent.blobs === "string") {
    connectLambda(lambdaEvent as LambdaBlobEvent);
  }
}

function normalizeSlug(slug: string): string {
  if (!slug || slug === "/") return "/";
  return `/${slug.replace(/^\/+|\/+$/g, "").toLowerCase().replace(/[^a-z0-9/-]+/g, "-")}`;
}

function validPage(input: Partial<PageRecord>): PageRecord {
  const slug = normalizeSlug(String(input.slug || ""));
  if (!slug) throw new Error("Slug is required.");
  if (!input.title) throw new Error("Title is required.");
  if (!input.markdown) throw new Error("Markdown content is required.");

  return {
    slug,
    title: String(input.title),
    navLabel: String(input.navLabel || input.title),
    seoTitle: String(input.seoTitle || `${input.title} | Disco Media`),
    description: String(input.description || ""),
    order: Number(input.order ?? 99),
    published: Boolean(input.published ?? true),
    markdown: String(input.markdown),
    updatedAt: input.updatedAt || new Date().toISOString(),
  };
}

export async function storedPages(): Promise<PageRecord[]> {
  try {
    const store = getStore(storeName);
    const { blobs } = await store.list();
    const pages: PageRecord[] = [];

    for (const blob of blobs) {
      const page = await store.get(blob.key, { type: "json" });
      if (page) pages.push(page as PageRecord);
    }

    return pages;
  } catch (error) {
    if (!isMissingBlobEnvironment(error)) throw error;
    return readLocalPages();
  }
}

export async function allPages(): Promise<PageRecord[]> {
  const seeds = readSeedPages();
  const overrides = await storedPages();
  const bySlug = new Map<string, PageRecord>();

  for (const page of seeds) bySlug.set(page.slug, page);
  for (const page of overrides) bySlug.set(page.slug, page);

  return [...bySlug.values()].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export async function findPage(slug: string): Promise<PageRecord | undefined> {
  const normalized = normalizeSlug(slug);
  return (await allPages()).find((page) => page.slug === normalized);
}

export async function savePage(input: Partial<PageRecord>): Promise<PageRecord> {
  const page = validPage(input);
  try {
    const store = getStore(storeName);
    await store.setJSON(slugToKey(page.slug), page);
  } catch (error) {
    if (!isMissingBlobEnvironment(error)) throw error;
    await writeLocalPage(page);
  }

  if (process.env.NETLIFY_BUILD_HOOK_URL) {
    fetch(process.env.NETLIFY_BUILD_HOOK_URL, { method: "POST" }).catch(() => undefined);
  }

  return page;
}

export async function deletePage(slug: string): Promise<void> {
  const normalized = normalizeSlug(slug);
  if (coreSlugs().includes(normalized)) {
    throw new Error("Core pages cannot be deleted.");
  }

  const seed = readSeedPages().find((page) => page.slug === normalized);
  if (seed) {
    await savePage({
      ...seed,
      published: false,
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  try {
    const store = getStore(storeName);
    await store.delete(slugToKey(normalized));
  } catch (error) {
    if (!isMissingBlobEnvironment(error)) throw error;
    await deleteLocalPage(normalized);
  }
}

function isMissingBlobEnvironment(error: unknown): boolean {
  return allowLocalBlobFallback() && error instanceof Error && error.message.includes("Netlify Blobs");
}

function allowLocalBlobFallback(): boolean {
  if (process.env.NETLIFY_DEV === "true" || process.env.NETLIFY_LOCAL === "true") return true;
  if (process.env.NETLIFY === "true" || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT) {
    return false;
  }
  return process.env.NODE_ENV !== "production";
}

async function readLocalPages(): Promise<PageRecord[]> {
  try {
    const files = await fs.readdir(localStoreDir);
    const pages = await Promise.all(
      files
        .filter((file) => file.endsWith(".json"))
        .map(async (file) => JSON.parse(await fs.readFile(path.join(localStoreDir, file), "utf8")) as PageRecord),
    );
    return pages;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeLocalPage(page: PageRecord): Promise<void> {
  await fs.mkdir(localStoreDir, { recursive: true });
  await fs.writeFile(path.join(localStoreDir, `${slugToKey(page.slug)}.json`), JSON.stringify(page, null, 2));
}

async function deleteLocalPage(slug: string): Promise<void> {
  try {
    await fs.rm(path.join(localStoreDir, `${slugToKey(slug)}.json`));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
