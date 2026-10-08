import { publicSeedPages } from "../lib/content";
import { projects } from "../data/projects";
export function GET() {
  const paths = [...publicSeedPages().map((page) => page.slug), "/portfolio", ...projects.filter(project => project.overview).map(project => `/projects/${project.slug}`)];
  const urls = [...new Set(paths)]
    .map(
      (path) =>
        `<url><loc>https://discomedia.co${path === "/" ? "/" : path + "/"}</loc></url>`,
    )
    .join("");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { "Content-Type": "application/xml" } },
  );
}
