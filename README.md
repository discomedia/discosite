# Disco Media

A static Astro site for Disco Media, an independent media and product company based in Melbourne. Hosted on Cloudflare Pages. Content, navigation, screenshots, and branding are version-controlled; there is no CMS, admin login, database, KV binding, Pages Function, or runtime secret.

## Develop and verify

Use Node.js 24 or newer and npm.

```sh
npm ci
npm run dev
npm run typecheck
npm test
```

`npm test` builds the site and checks public routes, local assets and links, the complete portfolio, preserved legal content, and removal of the CMS runtime. `npm run preview` previews the production output. `npm run dev:pages` checks Cloudflare's static routing and redirects locally.

## Make updates

- Home: `src/pages/index.astro`
- Portfolio: `src/data/projects.ts`. Add or update the project metadata and a real screenshot at `public/images/projects/<slug>.webp`. Both the home page and complete portfolio use the same list.
- Page layouts and navigation: `src/components/SiteLayout.astro`
- Design: `src/styles.css`
- Brand: `public/images/disco-globe.svg`. The header, footer, and hero use this same artwork. Keep `public/favicon.svg` identical when updating the mark.
- Legal policies: `src/content/pages/privacy.md` and `terms.md`, rendered at build time.
- Contact and support: static email links to `info@discomedia.co` and `support@discomedia.co`.

Screenshots were captured from the public project sites on 8 October 2026. Absolute Timer uses its actual iPhone screenshot from the app repository. Disco Mail's public screen is its sign-in page. The portfolio links use the current public origins, including `bananastandapp.com`, `papertigerapp.com`, the existing FinePredict Netlify origin, and Absolute Timer's App Store listing. Screenshots are served locally, not fetched on demand.

Inter is self-hosted under `public/fonts` with its SIL Open Font License. The graphic is an SVG with projected mirror facets and continent shapes; motion respects `prefers-reduced-motion`.

## Deployment

The existing GitHub Actions workflow validates changes and deploys `master` to the `disco-media-site` Cloudflare Pages project. Pull requests receive preview deployments. Build command: `npm run build`; output directory: `dist`.

Only `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` are needed for deployment (GitHub secrets or local `.env`). There are no runtime environment variables. The Cloudflare zone redirect in `cloudflare/www-redirect.json` handles www-to-apex routing, preserving paths and query strings. It runs before Pages and needs no Function. A real `404.html` prevents removed admin/API routes from falling back to the home page.

The migration preserved the latest published privacy and terms content. A snapshot of the live CMS is retained locally in the ignored `.local/redesign/published-cms-backup.json`; the historical KV namespace can be retained as a backup but is no longer bound to or used by the site. Old CMS and mail secrets are no longer referenced.
