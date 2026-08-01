import { useEffect, useMemo, useState } from "react";
import { Briefcase, Car, Globe2, Hammer, Home, Languages, MapPin, Users } from "lucide-react";
import { renderMarkdown } from "../lib/markdown";
import type { PageRecord } from "../lib/types";
import { HeroVisual } from "./HeroVisual";

type PageRendererProps = {
  page: PageRecord;
  mode?: "home" | "article";
  live?: boolean;
};

function stripMarkdown(markdown: string): string {
  return markdown.replace(/^#+\s+/gm, "").replace(/\*\*/g, "");
}

function firstHeading(markdown: string, fallback: string): string {
  return markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? fallback;
}

function firstParagraph(markdown: string): string {
  return (
    markdown
      .split(/\n{2,}/)
      .find((block) => block.trim() && !block.startsWith("#") && !block.startsWith("-") && !block.includes("|")) ??
    ""
  ).trim();
}

function bulletLines(markdown: string): string[] {
  return markdown
    .split("\n")
    .filter((line) => line.startsWith("- "))
    .slice(0, 5)
    .map((line) => line.replace(/^- /, ""));
}

const sectors = [
  { label: "Travel", icon: Briefcase, color: "text-cyan-700" },
  { label: "Language Learning", icon: Languages, color: "text-red-600" },
  { label: "Automotive", icon: Car, color: "text-amber-600" },
  { label: "Luxury Real Estate", icon: Home, color: "text-blue-700" },
  { label: "Home Improvement", icon: Hammer, color: "text-green-700" },
];

function HomeLanding({ page }: { page: PageRecord }) {
  const heading = firstHeading(page.markdown, page.title);
  const intro = firstParagraph(page.markdown);
  const bullets = bulletLines(page.markdown);

  return (
    <main>
      <section className="border-b border-slate-200 bg-white">
        <div className="content-shell grid min-h-[560px] items-center gap-10 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:py-6">
          <div className="max-w-2xl">
            <h1 className="max-w-[13ch] text-4xl font-black leading-[0.98] tracking-normal text-slate-950 md:text-5xl lg:text-6xl">
              {heading.includes("500,000") ? (
                <>
                  {heading.split("500,000")[0]}
                  <span className="text-red-600">500,000</span>
                  {heading.split("500,000").slice(1).join("500,000")}
                </>
              ) : (
                heading
              )}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 md:text-lg">{intro}</p>
            <div className="mt-6 grid gap-2.5 text-sm text-slate-700 md:text-[0.95rem]">
              {bullets.map((fact, index) => {
                const Icon = [Users, Globe2, Briefcase, MapPin, Globe2][index] ?? Globe2;
                const colors = ["text-cyan-700", "text-blue-700", "text-amber-600", "text-red-600", "text-green-700"];
                return (
                  <div className="flex items-start gap-4" key={fact}>
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${colors[index]}`} strokeWidth={2.2} />
                    <span>{fact}</span>
                  </div>
                );
              })}
            </div>
            <a
              href="/contact"
              className="focus-ring mt-6 inline-flex min-h-12 items-center justify-center bg-blue-700 px-7 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
            >
              Contact
            </a>
          </div>
          <HeroVisual />
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="content-shell grid gap-10 py-14 lg:grid-cols-[0.55fr_1.45fr]">
          <div>
            <h2 className="text-3xl font-black leading-tight text-slate-950 md:text-4xl">
              Where we create impact
            </h2>
            <p className="mt-5 max-w-sm text-base leading-7 text-slate-600">
              Our portfolio spans categories that inform and inspire, helping people plan, learn, buy,
              and improve.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden border border-slate-200 bg-slate-200 md:grid-cols-5">
            {sectors.map(({ label, icon: Icon, color }) => (
              <div className="bg-white p-6 text-center" key={label}>
                <Icon className={`mx-auto h-10 w-10 ${color}`} strokeWidth={1.8} />
                <h3 className="mt-5 min-h-10 text-base font-black text-slate-950">{label}</h3>
                <div className="mx-auto mt-3 h-0.5 w-8 bg-current opacity-80" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="content-shell flex flex-col gap-6 py-9 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black">Let's connect</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Have a question, partnership idea, or need support? We'd love to hear from you.
            </p>
          </div>
          <a
            className="focus-ring inline-flex min-h-12 items-center justify-center border border-cyan-500 px-6 text-sm font-bold text-cyan-200 transition hover:bg-cyan-500 hover:text-slate-950"
            href="/contact"
          >
            Contact our team
          </a>
        </div>
      </section>
    </main>
  );
}

function ArticlePage({ page }: { page: PageRecord }) {
  const html = useMemo(() => renderMarkdown(page.markdown), [page.markdown]);

  return (
    <main className="bg-white">
      <section className="content-shell max-w-4xl py-16 md:py-24">
        <article className="prose-disco" dangerouslySetInnerHTML={{ __html: html }} />
      </section>
    </main>
  );
}

export function PageRenderer({ page, mode = "article", live = true }: PageRendererProps) {
  const [current, setCurrent] = useState(page);

  useEffect(() => {
    if (!live) return;
    const url = `/api/page?slug=${encodeURIComponent(page.slug)}`;
    fetch(url)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (payload?.page?.published) setCurrent(payload.page);
      })
      .catch(() => undefined);
  }, [live, page.slug]);

  if (mode === "home") return <HomeLanding page={current} />;
  return <ArticlePage page={current} />;
}

export function DynamicPageRenderer() {
  const [page, setPage] = useState<PageRecord | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    const slug = window.location.pathname;
    fetch(`/api/page?slug=${encodeURIComponent(slug)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (payload?.page?.published) {
          setPage(payload.page);
          setStatus("ready");
          document.title = payload.page.seoTitle || `${payload.page.title} | Disco Media`;
        } else {
          setStatus("missing");
        }
      })
      .catch(() => setStatus("missing"));
  }, []);

  if (status === "loading") {
    return (
      <main className="content-shell py-20">
        <p className="text-sm font-semibold text-slate-500">Loading page...</p>
      </main>
    );
  }

  if (!page) {
    return (
      <main className="content-shell py-20">
        <h1 className="text-5xl font-black text-slate-950">Page not found</h1>
        <p className="mt-5 max-w-xl text-slate-600">
          The page you requested does not exist or is no longer published.
        </p>
      </main>
    );
  }

  return <ArticlePage page={page} />;
}
