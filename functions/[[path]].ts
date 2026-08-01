import { findPage } from "./_cms";
import { normalizeSlug, type PageFunction } from "./_shared";

const staticPages = new Set(["/", "/admin", "/contact", "/dynamic", "/privacy", "/support", "/terms"]);

function staticPageAsset(pathname: string, requestUrl: string): URL {
  return new URL(pathname === "/" ? "/index.html" : `${pathname}/index.html`, requestUrl);
}

export const onRequest: PageFunction = async (context) => {
  const url = new URL(context.request.url);
  const pathname = normalizeSlug(url.pathname);
  if (pathname.startsWith("/api/")) return context.next();
  if (staticPages.has(pathname)) return context.env.ASSETS.fetch(staticPageAsset(pathname, context.request.url));

  try {
    const page = await findPage(context.env, pathname);
    if (page?.published) return context.env.ASSETS.fetch(new URL("/dynamic/index.html", context.request.url));
  } catch (error) {
    console.error("Unable to resolve dynamic page", error);
  }
  return context.env.ASSETS.fetch(context.request);
};
