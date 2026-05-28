import { publicSeedPages } from "../lib/content";

export async function GET() {
  const base = "https://discomedia.co";
  const urls = publicSeedPages()
    .map((page) => {
      const loc = `${base}${page.slug === "/" ? "" : page.slug}`;
      return `<url><loc>${loc}</loc><changefreq>weekly</changefreq></url>`;
    })
    .join("");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
