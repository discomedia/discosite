import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Eye, FileText, Home, Link2, Menu, Plus, Save, Trash2, X } from "lucide-react";
import { renderMarkdown } from "../lib/markdown";
import type { MenuArea, MenuItemRecord, PageRecord } from "../lib/types";

const emptyPage: PageRecord = {
  slug: "/new-page",
  title: "New page",
  navLabel: "New page",
  seoTitle: "New page | Disco Media",
  description: "A Disco Media page.",
  order: 50,
  published: true,
  markdown: "# New page\n\nWrite the page content here.",
};

const coreSlugs = new Set(["/", "/contact", "/support", "/privacy"]);
const menuAreaLabels: Record<MenuArea, string> = {
  primary: "Primary nav",
  headerCta: "Header button",
  footer: "Footer",
};

const emptyMenuItem: MenuItemRecord = {
  id: "new-menu-item",
  label: "New link",
  url: "/",
  area: "primary",
  order: 50,
  published: true,
};

function normalizeSlug(slug: string): string {
  if (!slug || slug === "/") return "/";
  const segments = slug
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .map((segment) => segment.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, ""))
    .filter(Boolean);
  return segments.length ? `/${segments.join("/")}` : "/";
}

function normalizeMenuUrl(url: string): string {
  const trimmed = url.trim();
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed) || trimmed.startsWith("#")) return trimmed;
  return normalizeSlug(trimmed);
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const payload = await response.json().catch(() => ({}));
  return payload && typeof payload === "object" && !Array.isArray(payload) ? payload as Record<string, unknown> : {};
}

function responseError(payload: Record<string, unknown>, fallback: string): string {
  return typeof payload.error === "string" ? payload.error : fallback;
}

export function AdminApp() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [section, setSection] = useState<"pages" | "menus">("pages");
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemRecord[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("/");
  const [selectedMenuId, setSelectedMenuId] = useState("");
  const [draft, setDraft] = useState<PageRecord | null>(null);
  const [menuDraft, setMenuDraft] = useState<MenuItemRecord | null>(null);
  const [status, setStatus] = useState("Enter the password to continue.");
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [menuModalOpen, setMenuModalOpen] = useState(false);

  const selected = useMemo(
    () => pages.find((page) => page.slug === selectedSlug) ?? pages[0],
    [pages, selectedSlug],
  );

  const selectedMenuItem = useMemo(
    () => menuItems.find((item) => item.id === selectedMenuId) ?? menuItems[0],
    [menuItems, selectedMenuId],
  );

  const sortedMenuItems = useMemo(
    () => [...menuItems].sort((a, b) => a.area.localeCompare(b.area) || a.order - b.order || a.label.localeCompare(b.label)),
    [menuItems],
  );

  const previewHtml = useMemo(() => renderMarkdown(draft?.markdown ?? ""), [draft?.markdown]);

  async function loadAdminData(): Promise<boolean> {
    const [pagesResponse, menuResponse] = await Promise.all([
      fetch("/.netlify/functions/pages", { credentials: "include" }),
      fetch("/.netlify/functions/menu", { credentials: "include" }),
    ]);
    const pagesPayload = await readJson(pagesResponse);
    const menuPayload = await readJson(menuResponse);

    if (pagesResponse.status === 401) {
      setAuthed(false);
      setPages([]);
      setMenuItems([]);
      setSelectedSlug("/");
      setSelectedMenuId("");
      setStatus("Enter the password to continue.");
      return false;
    }

    if (!pagesResponse.ok || !Array.isArray(pagesPayload.pages)) {
      setStatus(responseError(pagesPayload, "Unable to load admin content."));
      return false;
    }

    if (!menuResponse.ok || !Array.isArray(menuPayload.items)) {
      setStatus(responseError(menuPayload, "Unable to load menu content."));
      return false;
    }

    const nextPages = pagesPayload.pages as PageRecord[];
    const nextMenuItems = menuPayload.items as MenuItemRecord[];
    setPages(nextPages);
    setMenuItems(nextMenuItems);
    setSelectedSlug((slug) => nextPages.some((page) => page.slug === slug) ? slug : (nextPages[0]?.slug ?? "/"));
    setSelectedMenuId((id) => nextMenuItems.some((item) => item.id === id) ? id : (nextMenuItems[0]?.id ?? ""));
    setAuthed(true);
    setStatus("Saved just now");
    return true;
  }

  useEffect(() => {
    loadAdminData().catch(() => setStatus("Unable to load admin content."));
  }, []);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Signing in...");
    const response = await fetch("/.netlify/functions/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password }),
    });
    const payload = await readJson(response);
    if (!response.ok) {
      setStatus(responseError(payload, "Password was not accepted."));
      return;
    }
    setPassword("");
    await loadAdminData().catch(() => setStatus("Unable to load admin content."));
  }

  function openEditor(page: PageRecord) {
    setDraft({ ...page });
    setModalOpen(true);
    setStatus("Editing");
  }

  function addPage() {
    const suffix = pages.length + 1;
    const page = {
      ...emptyPage,
      slug: `/new-page-${suffix}`,
      title: `New page ${suffix}`,
      navLabel: `New page ${suffix}`,
      seoTitle: `New page ${suffix} | Disco Media`,
      order: 50 + suffix,
    };
    setDraft(page);
    setModalOpen(true);
    setStatus("New page draft");
  }

  function openMenuEditor(item: MenuItemRecord) {
    setMenuDraft({ ...item });
    setMenuModalOpen(true);
    setStatus("Editing menu");
  }

  function addMenuItem() {
    const suffix = menuItems.length + 1;
    const item = {
      ...emptyMenuItem,
      id: `menu-item-${Date.now()}`,
      label: `New link ${suffix}`,
      order: 50 + suffix,
    };
    setMenuDraft(item);
    setMenuModalOpen(true);
    setStatus("New menu item draft");
  }

  async function saveMenu(nextItems: MenuItemRecord[], selectedId?: string) {
    setSaving(true);
    setStatus("Saving menu...");
    const response = await fetch("/.netlify/functions/menu", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ items: nextItems }),
    });
    const payload = await readJson(response);
    setSaving(false);

    if (!response.ok || !Array.isArray(payload.items)) {
      setStatus(responseError(payload, "Unable to save menu."));
      return;
    }

    const savedItems = payload.items as MenuItemRecord[];
    setMenuItems(savedItems);
    setSelectedMenuId(selectedId && savedItems.some((item) => item.id === selectedId) ? selectedId : (savedItems[0]?.id ?? ""));
    setMenuModalOpen(false);
    setMenuDraft(null);
    setStatus("Menu saved");
  }

  async function saveMenuDraft() {
    if (!menuDraft) return;
    const payload = {
      ...menuDraft,
      url: normalizeMenuUrl(menuDraft.url),
      updatedAt: new Date().toISOString(),
    };
    const exists = menuItems.some((item) => item.id === payload.id);
    const nextItems = exists ? menuItems.map((item) => (item.id === payload.id ? payload : item)) : [...menuItems, payload];
    await saveMenu(nextItems, payload.id);
  }

  async function deleteMenuDraft() {
    if (!menuDraft) return;
    await saveMenu(menuItems.filter((item) => item.id !== menuDraft.id));
  }

  async function saveDraft() {
    if (!draft) return;
    setSaving(true);
    setStatus("Saving...");
    const payload = { ...draft, slug: normalizeSlug(draft.slug), updatedAt: new Date().toISOString() };
    const response = await fetch("/.netlify/functions/page", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setStatus(data.error || "Unable to save page.");
      return;
    }
    setModalOpen(false);
    setDraft(null);
    await loadAdminData();
    setSelectedSlug(payload.slug);
    setStatus("Saved and published instantly");
  }

  async function deleteDraft() {
    if (!draft || coreSlugs.has(draft.slug)) return;
    setSaving(true);
    setStatus("Deleting...");
    const response = await fetch(`/.netlify/functions/page?slug=${encodeURIComponent(draft.slug)}`, {
      method: "DELETE",
      credentials: "include",
    });
    setSaving(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setStatus(data.error || "Unable to delete page.");
      return;
    }
    setModalOpen(false);
    setDraft(null);
    await loadAdminData();
    setStatus("Deleted");
  }

  if (!authed) {
    return (
      <main className="min-h-[72vh] bg-slate-50 py-16">
        <section className="content-shell max-w-md border border-slate-200 bg-white p-8 shadow-xl">
          <h1 className="text-3xl font-black text-slate-950">Admin sign in</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{status}</p>
          <form className="mt-8 grid gap-5" onSubmit={signIn}>
            <label className="grid gap-2 text-sm font-bold text-slate-950">
              Password
              <input
                className="focus-ring min-h-12 border border-slate-300 px-4 text-base font-medium"
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                value={password}
              />
            </label>
            <button className="focus-ring min-h-12 bg-blue-700 px-6 text-sm font-bold text-white hover:bg-blue-800">
              Sign in
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[78vh] border-t border-slate-200 bg-slate-50">
      <section className="grid min-h-[78vh] lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-black uppercase tracking-normal text-slate-500">Admin</h1>
            <button
              className="focus-ring inline-flex h-9 w-9 items-center justify-center border border-slate-300 text-blue-700 hover:bg-blue-50"
              onClick={section === "pages" ? addPage : addMenuItem}
              title={section === "pages" ? "Add page" : "Add menu item"}
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              className={`focus-ring min-h-10 text-sm font-bold ${section === "pages" ? "bg-slate-950 text-white" : "border border-slate-300 text-slate-700"}`}
              onClick={() => setSection("pages")}
            >
              Pages
            </button>
            <button
              className={`focus-ring min-h-10 text-sm font-bold ${section === "menus" ? "bg-slate-950 text-white" : "border border-slate-300 text-slate-700"}`}
              onClick={() => setSection("menus")}
            >
              Menus
            </button>
          </div>
          {section === "pages" ? (
            <>
              <div className="mt-5 grid gap-2">
                {pages.map((page) => (
                  <button
                    className={`focus-ring flex min-h-12 items-center gap-3 px-3 text-left text-sm font-bold ${
                      selectedSlug === page.slug ? "bg-cyan-50 text-slate-950 shadow-[inset_3px_0_0_#0891b2]" : "text-slate-600 hover:bg-slate-50"
                    }`}
                    key={page.slug}
                    onClick={() => setSelectedSlug(page.slug)}
                  >
                    {page.slug === "/" ? <Home className="h-4 w-4 shrink-0" /> : <FileText className="h-4 w-4 shrink-0" />}
                    <span className="min-w-0">
                      <span className="block truncate">{page.navLabel}</span>
                      <span className="block truncate text-xs font-semibold text-slate-400">{page.slug}</span>
                    </span>
                  </button>
                ))}
              </div>
              <button className="focus-ring mt-8 min-h-11 w-full border border-dashed border-blue-300 text-sm font-bold text-blue-700" onClick={addPage}>
                Add page
              </button>
            </>
          ) : (
            <>
              <div className="mt-5 grid gap-2">
                {sortedMenuItems.map((item) => (
                  <button
                    className={`focus-ring flex min-h-12 items-center gap-3 px-3 text-left text-sm font-bold ${
                      selectedMenuId === item.id ? "bg-cyan-50 text-slate-950 shadow-[inset_3px_0_0_#0891b2]" : "text-slate-600 hover:bg-slate-50"
                    }`}
                    key={item.id}
                    onClick={() => setSelectedMenuId(item.id)}
                  >
                    <Menu className="h-4 w-4 shrink-0" />
                    <span className="min-w-0">
                      <span className="block truncate">{item.label}</span>
                      <span className="block truncate text-xs font-semibold text-slate-400">{menuAreaLabels[item.area]} · {item.url}</span>
                    </span>
                  </button>
                ))}
              </div>
              <button className="focus-ring mt-8 min-h-11 w-full border border-dashed border-blue-300 text-sm font-bold text-blue-700" onClick={addMenuItem}>
                Add menu item
              </button>
            </>
          )}
        </aside>

        <div className="p-5 md:p-8">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">/admin</p>
              <h2 className="mt-1 text-3xl font-black text-slate-950">
                {section === "pages" ? (selected?.title ?? "Pages") : (selectedMenuItem?.label ?? "Menus")}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-slate-500">{status}</span>
              {section === "pages" && selected && (
                <a
                  className="focus-ring inline-flex min-h-11 items-center gap-2 border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:bg-white"
                  href={selected.slug}
                  target="_blank"
                >
                  <Eye className="h-4 w-4" />
                  Preview site
                </a>
              )}
              {section === "pages" && selected && (
                <button
                  className="focus-ring inline-flex min-h-11 items-center gap-2 bg-blue-700 px-5 text-sm font-bold text-white hover:bg-blue-800"
                  onClick={() => openEditor(selected)}
                >
                  <Save className="h-4 w-4" />
                  Edit
                </button>
              )}
              {section === "menus" && selectedMenuItem && (
                <a
                  className="focus-ring inline-flex min-h-11 items-center gap-2 border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:bg-white"
                  href={selectedMenuItem.url}
                  target="_blank"
                >
                  <Link2 className="h-4 w-4" />
                  Open link
                </a>
              )}
              {section === "menus" && selectedMenuItem && (
                <button
                  className="focus-ring inline-flex min-h-11 items-center gap-2 bg-blue-700 px-5 text-sm font-bold text-white hover:bg-blue-800"
                  onClick={() => openMenuEditor(selectedMenuItem)}
                >
                  <Save className="h-4 w-4" />
                  Edit
                </button>
              )}
            </div>
          </div>

          {section === "pages" && selected && (
            <div className="grid gap-6 xl:grid-cols-2">
              <section className="border border-slate-200 bg-white p-6">
                <dl className="grid gap-5 text-sm">
                  <div>
                    <dt className="font-black text-slate-950">Slug</dt>
                    <dd className="mt-1 text-slate-600">{selected.slug}</dd>
                  </div>
                  <div>
                    <dt className="font-black text-slate-950">SEO title</dt>
                    <dd className="mt-1 text-slate-600">{selected.seoTitle}</dd>
                  </div>
                  <div>
                    <dt className="font-black text-slate-950">Meta description</dt>
                    <dd className="mt-1 text-slate-600">{selected.description}</dd>
                  </div>
                </dl>
              </section>
              <section className="border border-slate-200 bg-white p-6">
                <div className="prose-disco max-h-[520px] overflow-auto" dangerouslySetInnerHTML={{ __html: renderMarkdown(selected.markdown) }} />
              </section>
            </div>
          )}

          {section === "menus" && selectedMenuItem && (
            <div className="grid gap-6 xl:grid-cols-2">
              <section className="border border-slate-200 bg-white p-6">
                <dl className="grid gap-5 text-sm">
                  <div>
                    <dt className="font-black text-slate-950">Label</dt>
                    <dd className="mt-1 text-slate-600">{selectedMenuItem.label}</dd>
                  </div>
                  <div>
                    <dt className="font-black text-slate-950">URL</dt>
                    <dd className="mt-1 break-all text-slate-600">{selectedMenuItem.url}</dd>
                  </div>
                  <div>
                    <dt className="font-black text-slate-950">Menu area</dt>
                    <dd className="mt-1 text-slate-600">{menuAreaLabels[selectedMenuItem.area]}</dd>
                  </div>
                  <div>
                    <dt className="font-black text-slate-950">Order</dt>
                    <dd className="mt-1 text-slate-600">{selectedMenuItem.order}</dd>
                  </div>
                  <div>
                    <dt className="font-black text-slate-950">Published</dt>
                    <dd className="mt-1 text-slate-600">{selectedMenuItem.published ? "Yes" : "No"}</dd>
                  </div>
                </dl>
              </section>
              <section className="border border-slate-200 bg-white p-6">
                <h3 className="text-sm font-black uppercase tracking-normal text-slate-500">Menu layout</h3>
                <div className="mt-5 grid gap-4">
                  {(["primary", "headerCta", "footer"] as MenuArea[]).map((area) => (
                    <div className="border border-slate-200 p-4" key={area}>
                      <h4 className="text-sm font-black text-slate-950">{menuAreaLabels[area]}</h4>
                      <div className="mt-3 grid gap-2">
                        {sortedMenuItems.filter((item) => item.area === area).map((item) => (
                          <div className="flex items-center justify-between gap-3 text-sm" key={item.id}>
                            <span className={item.published ? "font-semibold text-slate-700" : "font-semibold text-slate-400"}>
                              {item.order}. {item.label}
                            </span>
                            <span className="truncate text-xs font-semibold text-slate-400">{item.url}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </section>

      {modalOpen && draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
          <section className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl">
            <div className="shrink-0 border-b border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-950">Edit page</h2>
                <button className="focus-ring inline-flex h-10 w-10 items-center justify-center text-slate-600" onClick={() => setModalOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="grid min-h-0 flex-1 overflow-auto lg:grid-cols-[360px_minmax(0,1fr)] lg:overflow-hidden">
              <div className="grid content-start gap-5 overflow-auto border-r border-slate-200 p-5">
                {[
                  ["slug", "URL path"],
                  ["title", "Title"],
                  ["navLabel", "Navigation label"],
                  ["seoTitle", "SEO title"],
                ].map(([field, label]) => (
                  <label className="grid gap-2 text-sm font-bold text-slate-950" key={field}>
                    {label}
                    <input
                      className="focus-ring min-h-11 border border-slate-300 px-3 text-sm font-semibold"
                      disabled={field === "slug" && coreSlugs.has(draft.slug)}
                      onChange={(event) => setDraft({ ...draft, [field]: event.target.value })}
                      value={String(draft[field as keyof PageRecord])}
                    />
                    {field === "slug" && (
                      <span className="text-xs font-semibold leading-5 text-slate-500">
                        Use nested paths such as /portfolio or /portfolio/app1.
                      </span>
                    )}
                  </label>
                ))}
                <label className="grid gap-2 text-sm font-bold text-slate-950">
                  Meta description
                  <textarea
                    className="focus-ring min-h-28 border border-slate-300 px-3 py-2 text-sm font-semibold"
                    onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                    value={draft.description}
                  />
                </label>
                <label className="flex items-center gap-3 text-sm font-bold text-slate-950">
                  <input
                    checked={draft.published}
                    onChange={(event) => setDraft({ ...draft, published: event.target.checked })}
                    type="checkbox"
                  />
                  Published
                </label>
              </div>
              <div className="grid min-h-0 overflow-hidden md:grid-cols-2">
                <label className="grid min-h-0 grid-rows-[auto_1fr] border-r border-slate-200 text-sm font-bold text-slate-950">
                  <span className="border-b border-slate-200 px-5 py-4">Markdown</span>
                  <textarea
                    className="focus-ring min-h-0 resize-none overflow-auto border-0 bg-slate-950 p-5 font-mono text-sm leading-6 text-slate-50 outline-none"
                    onChange={(event) => setDraft({ ...draft, markdown: event.target.value })}
                    value={draft.markdown}
                  />
                </label>
                <div className="grid min-h-0 grid-rows-[auto_1fr]">
                  <div className="border-b border-slate-200 px-5 py-4 text-sm font-bold text-slate-950">Preview</div>
                  <div className="prose-disco min-h-0 overflow-auto p-5" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </div>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
              <button
                className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 border border-red-300 px-4 text-sm font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={coreSlugs.has(draft.slug) || saving}
                onClick={deleteDraft}
              >
                <Trash2 className="h-4 w-4" />
                Delete page
              </button>
              <div className="flex gap-3">
                <button className="focus-ring min-h-11 border border-slate-300 px-5 text-sm font-bold text-slate-700" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button
                  className="focus-ring min-h-11 bg-blue-700 px-6 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-60"
                  disabled={saving}
                  onClick={saveDraft}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {menuModalOpen && menuDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
          <section className="w-full max-w-2xl overflow-hidden border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-950">Edit menu item</h2>
                <button className="focus-ring inline-flex h-10 w-10 items-center justify-center text-slate-600" onClick={() => setMenuModalOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="grid gap-5 p-5">
              <label className="grid gap-2 text-sm font-bold text-slate-950">
                Label
                <input
                  className="focus-ring min-h-11 border border-slate-300 px-3 text-sm font-semibold"
                  onChange={(event) => setMenuDraft({ ...menuDraft, label: event.target.value })}
                  value={menuDraft.label}
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-slate-950">
                URL
                <input
                  className="focus-ring min-h-11 border border-slate-300 px-3 text-sm font-semibold"
                  onChange={(event) => setMenuDraft({ ...menuDraft, url: event.target.value })}
                  value={menuDraft.url}
                />
                <span className="text-xs font-semibold leading-5 text-slate-500">
                  Internal links can use /portfolio/app1. External links can use https://, mailto:, or tel:.
                </span>
              </label>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-slate-950">
                  Menu area
                  <select
                    className="focus-ring min-h-11 border border-slate-300 px-3 text-sm font-semibold"
                    onChange={(event) => setMenuDraft({ ...menuDraft, area: event.target.value as MenuArea })}
                    value={menuDraft.area}
                  >
                    {(["primary", "headerCta", "footer"] as MenuArea[]).map((area) => (
                      <option key={area} value={area}>{menuAreaLabels[area]}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-bold text-slate-950">
                  Order
                  <input
                    className="focus-ring min-h-11 border border-slate-300 px-3 text-sm font-semibold"
                    onChange={(event) => setMenuDraft({ ...menuDraft, order: Number(event.target.value) })}
                    type="number"
                    value={menuDraft.order}
                  />
                </label>
              </div>
              <label className="flex items-center gap-3 text-sm font-bold text-slate-950">
                <input
                  checked={menuDraft.published}
                  onChange={(event) => setMenuDraft({ ...menuDraft, published: event.target.checked })}
                  type="checkbox"
                />
                Published
              </label>
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
              <button
                className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 border border-red-300 px-4 text-sm font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={saving}
                onClick={deleteMenuDraft}
              >
                <Trash2 className="h-4 w-4" />
                Delete menu item
              </button>
              <div className="flex gap-3">
                <button className="focus-ring min-h-11 border border-slate-300 px-5 text-sm font-bold text-slate-700" onClick={() => setMenuModalOpen(false)}>
                  Cancel
                </button>
                <button
                  className="focus-ring min-h-11 bg-blue-700 px-6 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-60"
                  disabled={saving}
                  onClick={saveMenuDraft}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
