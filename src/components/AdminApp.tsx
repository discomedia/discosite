import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ArrowDown, ArrowUp, Eye, FileText, Home, Link2, Plus, Save, Trash2, X } from "lucide-react";
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

const coreSlugs = new Set(["/", "/contact", "/support", "/privacy", "/terms"]);
const menuAreaLabels: Record<MenuArea, string> = {
  primary: "Primary nav",
  headerCta: "Header button",
  footer: "Footer",
};
const menuAreaDescriptions: Record<MenuArea, string> = {
  primary: "Links across the top of the site.",
  headerCta: "The prominent button at the right of the header.",
  footer: "Links shown at the bottom of every page.",
};
const menuAreas: MenuArea[] = ["primary", "headerCta", "footer"];

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

function sortMenuItems(items: MenuItemRecord[]): MenuItemRecord[] {
  return [...items].sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
}

function normalizeMenuOrders(items: MenuItemRecord[]): MenuItemRecord[] {
  return menuAreas.flatMap((area) =>
    sortMenuItems(items.filter((item) => item.area === area)).map((item, index) => ({
      ...item,
      order: index + 1,
    })),
  );
}

export function AdminApp() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [section, setSection] = useState<"pages" | "menus">("pages");
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemRecord[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("/");
  const [selectedMenuArea, setSelectedMenuArea] = useState<MenuArea>("primary");
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

  const groupedMenuItems = useMemo(
    () => Object.fromEntries(menuAreas.map((area) => [area, sortMenuItems(menuItems.filter((item) => item.area === area))])) as Record<MenuArea, MenuItemRecord[]>,
    [menuItems],
  );

  const previewHtml = useMemo(() => renderMarkdown(draft?.markdown ?? ""), [draft?.markdown]);

  async function loadAdminData(): Promise<boolean> {
    const [pagesResponse, menuResponse] = await Promise.all([
      fetch("/api/pages", { credentials: "include" }),
      fetch("/api/menu", { credentials: "include" }),
    ]);
    const pagesPayload = await readJson(pagesResponse);
    const menuPayload = await readJson(menuResponse);

    if (pagesResponse.status === 401) {
      setAuthed(false);
      setPages([]);
      setMenuItems([]);
      setSelectedSlug("/");
      setSelectedMenuArea("primary");
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
    setSelectedMenuArea((area) => nextMenuItems.some((item) => item.area === area) ? area : "primary");
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
    const response = await fetch("/api/admin-login", {
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
      area: selectedMenuArea,
      order: 50 + suffix,
    };
    setMenuDraft(item);
    setMenuModalOpen(true);
    setStatus("New menu item draft");
  }

  async function saveMenu(nextItems: MenuItemRecord[], selectedArea?: MenuArea) {
    setSaving(true);
    setStatus("Saving menu...");
    const normalizedItems = normalizeMenuOrders(nextItems);
    const response = await fetch("/api/menu", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ items: normalizedItems }),
    });
    const payload = await readJson(response);
    setSaving(false);

    if (!response.ok || !Array.isArray(payload.items)) {
      setStatus(responseError(payload, "Unable to save menu."));
      return;
    }

    const savedItems = payload.items as MenuItemRecord[];
    setMenuItems(savedItems);
    if (selectedArea) setSelectedMenuArea(selectedArea);
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
    await saveMenu(nextItems, payload.area);
  }

  async function deleteMenuDraft() {
    if (!menuDraft) return;
    await saveMenu(menuItems.filter((item) => item.id !== menuDraft.id), menuDraft.area);
  }

  async function moveMenuItem(item: MenuItemRecord, direction: -1 | 1) {
    const areaItems = sortMenuItems(menuItems.filter((candidate) => candidate.area === item.area));
    const fromIndex = areaItems.findIndex((candidate) => candidate.id === item.id);
    const toIndex = fromIndex + direction;
    if (fromIndex < 0 || toIndex < 0 || toIndex >= areaItems.length) return;

    const reorderedAreaItems = [...areaItems];
    [reorderedAreaItems[fromIndex], reorderedAreaItems[toIndex]] = [reorderedAreaItems[toIndex], reorderedAreaItems[fromIndex]];
    const reorderedIds = reorderedAreaItems.map((candidate) => candidate.id);
    const nextItems = menuItems.map((candidate) => {
      if (candidate.area !== item.area) return candidate;
      return {
        ...candidate,
        order: reorderedIds.indexOf(candidate.id) + 1,
      };
    });
    await saveMenu(nextItems, item.area);
  }

  async function saveDraft() {
    if (!draft) return;
    setSaving(true);
    setStatus("Saving...");
    const payload = { ...draft, slug: normalizeSlug(draft.slug), updatedAt: new Date().toISOString() };
    const response = await fetch("/api/page", {
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
    const response = await fetch(`/api/page?slug=${encodeURIComponent(draft.slug)}`, {
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
                {menuAreas.map((area) => (
                  <button
                    className={`focus-ring flex min-h-12 items-center gap-3 px-3 text-left text-sm font-bold ${
                      selectedMenuArea === area ? "bg-cyan-50 text-slate-950 shadow-[inset_3px_0_0_#0891b2]" : "text-slate-600 hover:bg-slate-50"
                    }`}
                    key={area}
                    onClick={() => setSelectedMenuArea(area)}
                  >
                    <span className="min-w-0">
                      <span className="block truncate">{menuAreaLabels[area]}</span>
                      <span className="block truncate text-xs font-semibold text-slate-400">
                        {groupedMenuItems[area].length} {groupedMenuItems[area].length === 1 ? "item" : "items"}
                      </span>
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
                {section === "pages" ? (selected?.title ?? "Pages") : "Menus"}
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
              {section === "menus" && (
                <button
                  className="focus-ring inline-flex min-h-11 items-center gap-2 bg-blue-700 px-5 text-sm font-bold text-white hover:bg-blue-800"
                  onClick={addMenuItem}
                >
                  <Plus className="h-4 w-4" />
                  Add menu item
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

          {section === "menus" && (
            <div className="grid gap-5">
              {menuAreas.map((area) => {
                const areaItems = groupedMenuItems[area];
                return (
                  <section
                    className={`border bg-white p-5 ${selectedMenuArea === area ? "border-cyan-500 shadow-[inset_4px_0_0_#0891b2]" : "border-slate-200"}`}
                    key={area}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-xl font-black text-slate-950">{menuAreaLabels[area]}</h3>
                        <p className="mt-1 text-sm font-semibold text-slate-500">{menuAreaDescriptions[area]}</p>
                      </div>
                      <button
                        className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 border border-dashed border-blue-300 px-4 text-sm font-bold text-blue-700 hover:bg-blue-50"
                        onClick={() => {
                          setSelectedMenuArea(area);
                          const suffix = areaItems.length + 1;
                          setMenuDraft({
                            ...emptyMenuItem,
                            id: `menu-item-${Date.now()}`,
                            area,
                            label: `New ${menuAreaLabels[area].toLowerCase()} link ${suffix}`,
                            order: areaItems.length + 1,
                          });
                          setMenuModalOpen(true);
                          setStatus("New menu item draft");
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Add link
                      </button>
                    </div>

                    <div className="mt-5 grid gap-3">
                      {areaItems.length === 0 ? (
                        <div className="border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-semibold text-slate-500">
                          No links in this menu area.
                        </div>
                      ) : (
                        areaItems.map((item, index) => (
                          <div className="grid gap-3 border border-slate-200 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center" key={item.id}>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex h-7 min-w-7 items-center justify-center bg-slate-100 px-2 text-xs font-black text-slate-600">
                                  {index + 1}
                                </span>
                                <h4 className={item.published ? "text-base font-black text-slate-950" : "text-base font-black text-slate-400"}>
                                  {item.label}
                                </h4>
                                {!item.published && (
                                  <span className="border border-slate-300 px-2 py-1 text-xs font-black uppercase tracking-normal text-slate-500">
                                    Hidden
                                  </span>
                                )}
                              </div>
                              <p className="mt-2 truncate text-sm font-semibold text-slate-500">{item.url}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                className="focus-ring inline-flex h-10 w-10 items-center justify-center border border-slate-300 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                                disabled={index === 0 || saving}
                                onClick={() => moveMenuItem(item, -1)}
                                title="Move up"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </button>
                              <button
                                className="focus-ring inline-flex h-10 w-10 items-center justify-center border border-slate-300 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                                disabled={index === areaItems.length - 1 || saving}
                                onClick={() => moveMenuItem(item, 1)}
                                title="Move down"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </button>
                              <a
                                className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 border border-slate-300 px-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                                href={item.url}
                                target="_blank"
                              >
                                <Link2 className="h-4 w-4" />
                                Open
                              </a>
                              <button
                                className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 bg-blue-700 px-4 text-sm font-bold text-white hover:bg-blue-800"
                                onClick={() => openMenuEditor(item)}
                              >
                                <Save className="h-4 w-4" />
                                Edit
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                );
              })}
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
              <label className="grid gap-2 text-sm font-bold text-slate-950">
                Menu area
                <select
                  className="focus-ring min-h-11 border border-slate-300 px-3 text-sm font-semibold"
                  onChange={(event) => setMenuDraft({ ...menuDraft, area: event.target.value as MenuArea })}
                  value={menuDraft.area}
                >
                  {menuAreas.map((area) => (
                    <option key={area} value={area}>{menuAreaLabels[area]}</option>
                  ))}
                </select>
              </label>
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
