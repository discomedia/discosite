import { connectLambda, getStore } from "@netlify/blobs";
import type { HandlerEvent } from "@netlify/functions";
import fs from "node:fs/promises";
import path from "node:path";
import { publicSeedPages, seedMenuItems } from "../../src/lib/content";
import type { MenuArea, MenuItemRecord } from "../../src/lib/types";

const storeName = "disco-media-menu";
const localStoreDir = path.join(process.cwd(), ".netlify", "local-blobs", storeName);
const localStorePath = path.join(localStoreDir, "menu.json");
const blobKey = "items";
const menuAreas: MenuArea[] = ["primary", "headerCta", "footer"];
type LambdaBlobEvent = Parameters<typeof connectLambda>[0];

class MenuInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MenuInputError";
  }
}

export function connectMenuStore(event: HandlerEvent): void {
  const lambdaEvent = event as HandlerEvent & Partial<LambdaBlobEvent>;
  if (typeof lambdaEvent.blobs === "string") {
    connectLambda(lambdaEvent as LambdaBlobEvent);
  }
}

export function isMenuInputError(error: unknown): error is MenuInputError {
  return error instanceof MenuInputError;
}

function normalizeInternalPath(url: string): string {
  if (!url || url === "/") return "/";
  const segments = url
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .map((segment) => segment.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, ""))
    .filter(Boolean);
  return segments.length ? `/${segments.join("/")}` : "/";
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) throw new MenuInputError("Menu URL is required.");
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed) || trimmed.startsWith("#")) return trimmed;
  return normalizeInternalPath(trimmed);
}

function validMenuItem(input: Partial<MenuItemRecord>, index: number): MenuItemRecord {
  const label = String(input.label || "").trim();
  if (!label) throw new MenuInputError("Menu label is required.");

  const area = input.area;
  if (!area || !menuAreas.includes(area)) throw new MenuInputError("Menu area is invalid.");

  return {
    id: String(input.id || `menu-item-${index + 1}`).trim().replace(/[^a-zA-Z0-9_-]+/g, "-") || `menu-item-${index + 1}`,
    label,
    url: normalizeUrl(String(input.url || "")),
    area,
    order: Number(input.order ?? index + 1),
    published: Boolean(input.published ?? true),
    updatedAt: input.updatedAt || new Date().toISOString(),
  };
}

function validMenuItems(input: unknown): MenuItemRecord[] {
  const items = Array.isArray(input) ? input : [];
  return items
    .map((item, index) => validMenuItem(item as Partial<MenuItemRecord>, index))
    .sort((a, b) => a.area.localeCompare(b.area) || a.order - b.order || a.label.localeCompare(b.label));
}

export async function allMenuItems(): Promise<MenuItemRecord[]> {
  const saved = await storedMenuItems();
  return saved.length ? saved : seedMenuItems(publicSeedPages());
}

export async function publicMenuItems(): Promise<MenuItemRecord[]> {
  return (await allMenuItems()).filter((item) => item.published);
}

export async function saveMenuItems(input: unknown): Promise<MenuItemRecord[]> {
  const items = validMenuItems(input);

  try {
    const store = getStore(storeName);
    await store.setJSON(blobKey, items);
  } catch (error) {
    if (!isMissingBlobEnvironment(error)) throw error;
    await writeLocalMenuItems(items);
  }

  if (process.env.NETLIFY_BUILD_HOOK_URL) {
    fetch(process.env.NETLIFY_BUILD_HOOK_URL, { method: "POST" }).catch(() => undefined);
  }

  return items;
}

async function storedMenuItems(): Promise<MenuItemRecord[]> {
  try {
    const store = getStore(storeName);
    const items = await store.get(blobKey, { type: "json" });
    return validMenuItems(items);
  } catch (error) {
    if (!isMissingBlobEnvironment(error)) throw error;
    return readLocalMenuItems();
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

async function readLocalMenuItems(): Promise<MenuItemRecord[]> {
  try {
    return validMenuItems(JSON.parse(await fs.readFile(localStorePath, "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeLocalMenuItems(items: MenuItemRecord[]): Promise<void> {
  await fs.mkdir(localStoreDir, { recursive: true });
  await fs.writeFile(localStorePath, JSON.stringify(items, null, 2));
}
