import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Eye, FileText, Home, Plus, Save, Trash2, X } from "lucide-react";
import { renderMarkdown } from "../lib/markdown";
import type { PageRecord } from "../lib/types";

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

function normalizeSlug(slug: string): string {
  if (!slug || slug === "/") return "/";
  return `/${slug.replace(/^\/+|\/+$/g, "").toLowerCase().replace(/[^a-z0-9/-]+/g, "-")}`;
}

export function AdminApp() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("/");
  const [draft, setDraft] = useState<PageRecord | null>(null);
  const [status, setStatus] = useState("Enter the password to continue.");
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const selected = useMemo(
    () => pages.find((page) => page.slug === selectedSlug) ?? pages[0],
    [pages, selectedSlug],
  );

  const previewHtml = useMemo(() => renderMarkdown(draft?.markdown ?? ""), [draft?.markdown]);

  async function loadPages(): Promise<boolean> {
    const response = await fetch("/.netlify/functions/pages", { credentials: "include" });
    const payload = await response.json().catch(() => ({}));

    if (response.status === 401) {
      setAuthed(false);
      setPages([]);
      setSelectedSlug("/");
      setStatus("Enter the password to continue.");
      return false;
    }

    if (!response.ok || !Array.isArray(payload.pages)) {
      const error = typeof payload.error === "string" ? payload.error : "Unable to load admin content.";
      setStatus(error);
      return false;
    }

    const nextPages = payload.pages as PageRecord[];
    setPages(nextPages);
    setSelectedSlug((slug) => nextPages.some((page) => page.slug === slug) ? slug : (nextPages[0]?.slug ?? "/"));
    setAuthed(true);
    setStatus("Saved just now");
    return true;
  }

  useEffect(() => {
    loadPages().catch(() => setStatus("Unable to load admin content."));
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
    if (!response.ok) {
      setStatus("Password was not accepted.");
      return;
    }
    setPassword("");
    await loadPages().catch(() => setStatus("Unable to load admin content."));
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
    await loadPages();
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
    await loadPages();
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
            <h1 className="text-sm font-black uppercase tracking-normal text-slate-500">Content</h1>
            <button
              className="focus-ring inline-flex h-9 w-9 items-center justify-center border border-slate-300 text-blue-700 hover:bg-blue-50"
              onClick={addPage}
              title="Add page"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-5 grid gap-2">
            {pages.map((page) => (
              <button
                className={`focus-ring flex min-h-12 items-center gap-3 px-3 text-left text-sm font-bold ${
                  selectedSlug === page.slug ? "bg-cyan-50 text-slate-950 shadow-[inset_3px_0_0_#0891b2]" : "text-slate-600 hover:bg-slate-50"
                }`}
                key={page.slug}
                onClick={() => setSelectedSlug(page.slug)}
              >
                {page.slug === "/" ? <Home className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                {page.navLabel}
              </button>
            ))}
          </div>
          <button className="focus-ring mt-8 min-h-11 w-full border border-dashed border-blue-300 text-sm font-bold text-blue-700" onClick={addPage}>
            Add page
          </button>
        </aside>

        <div className="p-5 md:p-8">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">/admin</p>
              <h2 className="mt-1 text-3xl font-black text-slate-950">{selected?.title ?? "Pages"}</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-slate-500">{status}</span>
              {selected && (
                <a
                  className="focus-ring inline-flex min-h-11 items-center gap-2 border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:bg-white"
                  href={selected.slug}
                  target="_blank"
                >
                  <Eye className="h-4 w-4" />
                  Preview site
                </a>
              )}
              {selected && (
                <button
                  className="focus-ring inline-flex min-h-11 items-center gap-2 bg-blue-700 px-5 text-sm font-bold text-white hover:bg-blue-800"
                  onClick={() => openEditor(selected)}
                >
                  <Save className="h-4 w-4" />
                  Edit
                </button>
              )}
            </div>
          </div>

          {selected && (
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
        </div>
      </section>

      {modalOpen && draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
          <section className="grid max-h-[92vh] w-full max-w-6xl overflow-hidden border border-slate-200 bg-white shadow-2xl lg:grid-cols-[360px_1fr]">
            <div className="border-b border-slate-200 p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-950">Edit page</h2>
                <button className="focus-ring inline-flex h-10 w-10 items-center justify-center text-slate-600" onClick={() => setModalOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="grid content-start gap-5 overflow-auto border-r border-slate-200 p-5">
              {[
                ["slug", "Slug"],
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
            <div className="grid min-h-[560px] overflow-hidden md:grid-cols-2">
              <label className="grid min-h-full grid-rows-[auto_1fr] border-r border-slate-200 text-sm font-bold text-slate-950">
                <span className="border-b border-slate-200 px-5 py-4">Markdown</span>
                <textarea
                  className="focus-ring min-h-[420px] resize-none border-0 bg-slate-950 p-5 font-mono text-sm leading-6 text-slate-50 outline-none"
                  onChange={(event) => setDraft({ ...draft, markdown: event.target.value })}
                  value={draft.markdown}
                />
              </label>
              <div className="grid min-h-full grid-rows-[auto_1fr]">
                <div className="border-b border-slate-200 px-5 py-4 text-sm font-bold text-slate-950">Preview</div>
                <div className="prose-disco overflow-auto p-5" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-200 p-5 md:flex-row md:items-center md:justify-between lg:col-span-2">
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
    </main>
  );
}
