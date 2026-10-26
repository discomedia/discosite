# Disco Media

A static Astro site for Disco Media, an independent media and product company based in Melbourne / Naarm, Australia. Hosted on Cloudflare Pages. Content, navigation, screenshots, and branding are version-controlled; there is no CMS, admin login, database, KV binding, Pages Function, or runtime secret.

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
- Portfolio: `src/data/projects.ts`. Add or update the project metadata and a real screenshot at `public/images/projects/<slug>.webp`. Native apps use a three-screenshot set from `src/data/app-screenshots.ts`; see `docs/app-screenshots.md` for the original repository sources. The shared `AppScreenshots` component renders these side by side on the home, portfolio and detail pages. Set `type` to `apps`, `sites`, or `other`, and `visual` to `phone` for native screenshots or `code` for a package preview, or `artwork` for a complete promotional graphic without browser framing. Use `imageAlt` to describe artwork. Record the image dimensions. An `overview` adds a static project page for an app without a public download. Both the home page and complete portfolio use the same list.
- Page layouts and navigation: `src/components/SiteLayout.astro`
- Design: `src/styles.css`
- Brand: `public/images/disco-globe.svg`. The header, footer, and hero use this same artwork. Keep `public/favicon.svg` identical when updating the mark.
- Legal policies: `src/content/pages/privacy.md` and `terms.md`, rendered at build time.
- Contact and support: static email links to `info@discomedia.co` and `support@discomedia.co`.

The portfolio has 24 projects. The All / Apps / Sites / Other control uses native radio buttons with a visible selected state and a small DOM filter; all cards remain in the static HTML and are visible without JavaScript. Web apps are Apps; plugins, the npm package, and the internal Disco HQ tool are Other.

Most website screenshots were captured from public project sites on 8 October 2026; Mailer Choice was captured on 9 October. Melbourne Social Club uses a homepage capture from `https://melbournesocialclub.org` taken on 19 October 2026. Native app previews use three distinct repository screenshots each, copied locally as WebP at 600px wide. The complete source list is in `docs/app-screenshots.md`. Salsamatic links to `https://salsamatic.app`. These are representative captures, not a promise of the latest build. Cover Artist uses its WordPress editor screenshot from `cover-artist/releases/cover-artist-screenshot.png`. Disco HQ and Disco TTS reuse images already published on Hooshmand.net: [the connected-blogs dashboard](https://hooshmand.net/wp-content/uploads/2026/10/discohq-connected-blogs-dashboard.jpg) and [the TTS settings example](https://hooshmand.net/wp-content/uploads/2024/06/my-Azure-TTS-plugin-to-play-audio-files-1024x993.png). The npm card shows real installation and import syntax. PaperTiger and Banana Stand use actual dashboard images from their published launch articles on Hooshmand.net (`Paper-Tiger-Orders-scaled.jpg` and `banana-stand-day-1-1024x836.png`). Disco Mail uses its delivery-log capture from the repository's published changelog. Fluent Café uses its interactive language-onboarding panel; authenticated member screens are not publicly available. The portfolio links use the current public origins, including `bananastandapp.com`, `papertigerapp.com`, the existing FinePredict Netlify origin, and Absolute Timer's App Store listing. Screenshots are served locally, not fetched on demand.

Inter is self-hosted under `public/fonts` with its SIL Open Font License. The globe SVG is the brand illustration; it is static. The layout uses off-white surfaces, dark green text and six reusable type roles, with colour and spacing tokens in `src/styles.css`. Project previews use the actual screenshots without added browser toolbars or per-project colour panels. The homepage selects two publications and two apps; the portfolio retains all projects. The mobile menu uses a native disclosure and supports Escape and outside-click dismissal. Analytics run in production builds only; the development toolbar is disabled for local review.

The 23 October 2026 review follows Dana Master Style Guide v1.3. See `docs/style-review.md` for the findings and local validation. Dana approved the local preview and requested deployment on 23 October 2026. Pushing `master` triggers the validated production deployment.

## Deployment

The existing GitHub Actions workflow validates changes and deploys `master` to the `disco-media-site` Cloudflare Pages project. Pull requests receive preview deployments. Build command: `npm run build`; output directory: `dist`.

Only `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` are needed for deployment (GitHub secrets or local `.env`). There are no runtime environment variables. The Cloudflare zone redirect in `cloudflare/www-redirect.json` handles www-to-apex routing, preserving paths and query strings. It runs before Pages and needs no Function. A real `404.html` prevents removed admin/API routes from falling back to the home page.

The migration preserved the latest published privacy and terms content. A snapshot of the live CMS is retained locally in the ignored `.local/redesign/published-cms-backup.json`; the historical KV namespace can be retained as a backup but is no longer bound to or used by the site. Old CMS and mail secrets are no longer referenced.
