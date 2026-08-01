import { useEffect, useMemo, useState } from "react";
import type { MenuItemRecord } from "../lib/types";

type MenuProps = {
  currentPath: string;
  fallbackItems: MenuItemRecord[];
};

function sortItems(items: MenuItemRecord[]): MenuItemRecord[] {
  return [...items].filter((item) => item.published).sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
}

function isActive(item: MenuItemRecord, currentPath: string): boolean {
  if (!item.url.startsWith("/")) return false;
  if (item.url === "/") return currentPath === "/";
  return currentPath === item.url || currentPath.startsWith(`${item.url}/`);
}

function useMenuItems(fallbackItems: MenuItemRecord[]): MenuItemRecord[] {
  const [items, setItems] = useState(fallbackItems);

  useEffect(() => {
    fetch("/api/menu")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (Array.isArray(payload?.items)) setItems(payload.items);
      })
      .catch(() => undefined);
  }, []);

  return items;
}

export function HeaderMenu({ currentPath, fallbackItems }: MenuProps) {
  const items = useMenuItems(fallbackItems);
  const primaryItems = useMemo(() => sortItems(items.filter((item) => item.area === "primary")), [items]);
  const cta = useMemo(() => sortItems(items.filter((item) => item.area === "headerCta"))[0], [items]);

  return (
    <>
      <nav className="hidden items-center gap-2 md:flex" aria-label="Primary navigation">
        {primaryItems.map((item) => (
          <a
            className={`focus-ring px-4 py-7 text-sm font-bold transition ${
              isActive(item, currentPath) ? "text-slate-950 shadow-[inset_0_-3px_0_#0891b2]" : "text-slate-600 hover:text-slate-950"
            }`}
            href={item.url}
            key={item.id}
          >
            {item.label}
          </a>
        ))}
        {cta && (
          <a className="focus-ring ml-3 bg-blue-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800" href={cta.url}>
            {cta.label}
          </a>
        )}
      </nav>
      <details className="relative md:hidden">
        <summary className="focus-ring list-none border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700">
          Menu
        </summary>
        <div className="absolute right-0 top-12 grid w-56 gap-1 border border-slate-200 bg-white p-2 shadow-xl">
          {[...primaryItems, ...(cta ? [cta] : [])].map((item) => (
            <a className="px-3 py-2 text-sm font-bold text-slate-700" href={item.url} key={item.id}>
              {item.label}
            </a>
          ))}
        </div>
      </details>
    </>
  );
}

export function FooterMenu({ currentPath, fallbackItems }: MenuProps) {
  const items = useMenuItems(fallbackItems);
  const footerItems = useMemo(() => sortItems(items.filter((item) => item.area === "footer")), [items]);

  return (
    <nav className="flex flex-wrap gap-5 text-sm font-bold text-slate-300" aria-label="Footer navigation">
      {footerItems.map((item) => (
        <a className={isActive(item, currentPath) ? "text-white" : "hover:text-white"} href={item.url} key={item.id}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}
