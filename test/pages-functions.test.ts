import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSessionCookie, isAuthenticated } from "../functions/_auth";
import { allMenuItems, allPages, CmsInputError, deletePage, saveMenuItems, savePage } from "../functions/_cms";
import { sendFormEmail } from "../functions/_mail";
import { type Env } from "../functions/_shared";
import { disco } from "@discomedia/utils";

class MemoryKv {
  values = new Map<string, string>();

  async get<T>(key: string, type: "json"): Promise<T | null> {
    expect(type).toBe("json");
    const value = this.values.get(key);
    return value ? JSON.parse(value) as T : null;
  }

  async put(key: string, value: string): Promise<void> {
    this.values.set(key, value);
  }
}

function env(): Env {
  const kv = new MemoryKv();
  return {
    ADMIN_PASSWORD: "correct horse battery staple",
    ADMIN_SESSION_SECRET: "a long local test session secret",
    CONTACT_FROM_EMAIL: "Disco Media <hello@discomedia.co>",
    CONTACT_TO_EMAIL: "hello@discomedia.co",
    DISCO_MAIL_API_KEY: "test-key",
    DISCO_MEDIA_CMS: kv,
    ASSETS: { fetch: vi.fn() },
  };
}

describe("Pages CMS", () => {
  let runtime: Env;

  beforeEach(() => {
    runtime = env();
  });

  it("stores, reads, and protects core pages", async () => {
    await savePage(runtime, {
      slug: "/portfolio",
      title: "Portfolio",
      markdown: "# Portfolio\n\nContent",
      order: 8,
      published: true,
    });
    expect((await allPages(runtime)).map((page) => page.slug)).toEqual(["/portfolio"]);
    await expect(deletePage(runtime, "/")).rejects.toBeInstanceOf(CmsInputError);
    await deletePage(runtime, "/portfolio");
    expect(await allPages(runtime)).toEqual([]);
  });

  it("normalizes and validates the complete menu payload", async () => {
    await saveMenuItems(runtime, [{ id: "contact", label: "Contact", url: "contact", area: "footer", order: 1, published: true }]);
    expect(await allMenuItems(runtime)).toMatchObject([{ url: "/contact", area: "footer" }]);
    await expect(saveMenuItems(runtime, [{ label: "Broken", url: "/", area: "invalid" }])).rejects.toBeInstanceOf(CmsInputError);
  });
});

describe("Pages authentication", () => {
  it("accepts a signed session and rejects tampering", async () => {
    const runtime = env();
    const cookie = await createSessionCookie(runtime);
    expect(cookie).toBeTruthy();
    const request = new Request("https://example.test/api/pages", { headers: { Cookie: cookie! } });
    expect(await isAuthenticated(request, runtime)).toBe(true);
    const tampered = new Request("https://example.test/api/pages", { headers: { Cookie: cookie!.replace("dm_admin=", "dm_admin=x") } });
    expect(await isAuthenticated(tampered, runtime)).toBe(false);
  });
});

describe("Disco Mail forms", () => {
  it("uses the shared Disco Mail client with a reply-to address", async () => {
    const send = vi.spyOn(disco.mail, "send").mockResolvedValue({ emailId: "test-email" });
    await sendFormEmail(env(), "Disco Media contact form", { name: "Test", email: "sender@example.com", message: "Hello" });
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ replyTo: "sender@example.com", subject: "Disco Media contact form" }),
      expect.objectContaining({ apiKey: "test-key" }),
    );
    send.mockRestore();
  });
});
