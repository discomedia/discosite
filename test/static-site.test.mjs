import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const read = (file) => fs.readFileSync(path.join("dist", file), "utf8");
const routes = [
  "index.html",
  "portfolio/index.html",
  "contact/index.html",
  "support/index.html",
  "privacy/index.html",
  "terms/index.html",
  "404.html",
  "projects/learn-just-enough/index.html",
  "projects/skyfighter/index.html",
  "projects/roy/index.html",
];
test("all public routes render complete content without a CMS or framework runtime", () => {
  for (const route of routes) {
    const html = read(route);
    assert.match(html, /<main id="main"/);
    assert.match(html, /<h1/);
    assert.match(html, /Skip to content/);
    assert.doesNotMatch(
      html,
      /astro-island|\/api\/|\/admin|Loading page|client:load/,
    );
  }
  assert.equal(fs.existsSync("dist/admin"), false);
  assert.equal(fs.existsSync("dist/dynamic"), false);
  assert.equal(fs.existsSync("dist/_worker.js"), false);
  assert.equal(fs.existsSync("functions"), false);
});
test("portfolio contains 24 distinct project links and real local screenshots", () => {
  const html = read("portfolio/index.html");
  const links = [
    ...html.matchAll(/class="project-card"[^>]*href="([^"]+)"/g),
  ].map((match) => match[1]);
  assert.equal(links.length, 24);
  assert.equal(new Set(links).size, 24);
  assert.ok(links.includes("https://salsamatic.app"));
  assert.ok(links.includes("https://bananastandapp.com"));
  assert.ok(
    links.includes("https://apps.apple.com/app/absolute-timer/id6755406554"),
  );
  const images = [...html.matchAll(/src="(\/images\/projects\/[^\"]+)"/g)].map(
    (match) => match[1],
  );
  assert.equal(images.length, 39);
  for (const image of images)
    assert.ok(fs.statSync(path.join("dist", image)).size > 1000, image);
  const galleries = [...html.matchAll(/<div class="app-screenshots">(.*?)<\/div>/gs)];
  assert.equal(galleries.length, 8);
  for (const [, gallery] of galleries) {
    const screenshots = [...gallery.matchAll(/src="([^"]+)"/g)].map(match => match[1]);
    assert.equal(screenshots.length, 3);
    assert.equal(new Set(screenshots).size, 3);
  }
  for (const route of ["projects/learn-just-enough/index.html", "projects/skyfighter/index.html", "projects/roy/index.html"])
    assert.equal([...read(route).matchAll(/src="\/images\/projects\//g)].length, 3);
});
test("every local link and asset resolves in the production build", () => {
  for (const route of routes) {
    const html = read(route);
    for (const [, target] of html.matchAll(/(?:href|src)="(\/[^\"]*)"/g)) {
      const pathname = target.split(/[?#]/)[0];
      const file = path.join("dist", pathname);
      assert.ok(
        fs.existsSync(file) || fs.existsSync(path.join(file, "index.html")),
        `${route}: ${target}`,
      );
    }
  }
});
test("legal copy, contact destinations, sitemap, and shared brand survive the migration", () => {
  assert.match(read("privacy/index.html"), /Retention and deletion/);
  assert.match(
    read("privacy/index.html"),
    /App stores and third-party platforms/,
  );
  assert.match(read("terms/index.html"), /Australian Consumer Law/);
  assert.match(read("contact/index.html"), /mailto:info@discomedia.co/);
  assert.match(read("support/index.html"), /mailto:support@discomedia.co/);
  for (const route of ["portfolio", "contact", "support", "privacy", "terms"])
    assert.ok(
      read("sitemap-index.xml").includes(`https://discomedia.co/${route}/`),
    );
  assert.equal(read("favicon.svg"), read("images/disco-globe.svg"));
  const redirect = JSON.parse(fs.readFileSync("cloudflare/www-redirect.json", "utf8"));
  assert.equal(redirect.expression, 'http.host eq "www.discomedia.co"');
  assert.equal(redirect.action_parameters.from_value.status_code, 301);
  assert.equal(redirect.action_parameters.from_value.preserve_query_string, true);
});

// Interactive filtering must leave the complete portfolio in static HTML.
test("portfolio exposes all four accessible filters and every requested project", () => {
  const html = read("portfolio/index.html");
  for (const value of ["all", "apps", "sites", "other"])
    assert.match(html, new RegExp(`type="radio"[^>]*value="${value}"`));
  assert.match(html, /<legend class="sr-only">Filter projects<\/legend>/);
  assert.match(html, /aria-live="polite"/);
  const counts = Object.fromEntries(["apps", "sites", "other"].map(type => [type, [...html.matchAll(new RegExp(`data-project-type="${type}"`, "g"))].length]));
  assert.deepEqual(counts, { apps: 14, sites: 6, other: 4 });
  for (const name of ["Melbourne Social Club", "Grandmaster Flash", "Mailer Choice", "Skyfighter", "Disco HQ", "Roy", "Cover Artist", "Salsamatic", "Salsa Machine", "Disco TTS", "Disco Media Utils"])
    assert.ok(html.includes(`<h3>${name}</h3>`), name);
  assert.match(html, /npm install/);
  assert.match(html, /href="\/projects\/learn-just-enough\/"/);
  for (const slug of ["learn-just-enough", "skyfighter", "roy"])
    assert.match(read(`projects/${slug}/index.html`), /a public download is not available yet/);
});
