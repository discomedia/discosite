# Disco Media Site

Astro site for Disco Media, a Melbourne-based media company. The site is built with Astro, React islands, Tailwind CSS, Cloudflare Pages Functions, Cloudflare KV, and Disco Mail-powered contact/support forms.

## Features

- Static Astro pages for the core site routes.
- Markdown-backed seed content in `src/content/pages`.
- Dynamic page rendering through `/api/page` and Pages Functions.
- Password-protected `/admin` interface for creating, editing, publishing, and deleting pages, including nested paths like `/portfolio/app1`.
- Admin-managed primary navigation, header button, and footer menu items.
- Cloudflare KV storage for CMS pages and menu items, with a local KV simulator during development.
- Contact and support forms delivered through Disco Mail.
- Sitemap, robots.txt, canonical metadata, Open Graph tags, terms, and Cloudflare Pages deployment configuration.

## Tech Stack

- [Astro](https://astro.build/)
- React 19
- Tailwind CSS 4
- Cloudflare Pages Functions
- Cloudflare KV
- [Disco Mail](https://mail.discomedia.co)

## Project Structure

```text
src/pages/                 Astro routes
src/components/            Astro and React UI components
src/content/pages/         Markdown seed pages
src/lib/                   Content, markdown, and shared types
functions/                 Cloudflare Pages admin, CMS, contact, and support functions
public/                    Static assets, headers, and robots.txt
```

## Requirements

- Node.js 22 or compatible current LTS
- npm
- Wrangler for local Pages Function development

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a local `.env` file from `.env.example`. Configure the runtime values as Cloudflare Pages secrets; do not commit them.

```bash
ADMIN_PASSWORD="replace-me"
ADMIN_SESSION_SECRET="replace-me-with-a-long-random-string"
DISCO_MAIL_API_KEY="..."
CONTACT_TO_EMAIL="hello@example.com"
CONTACT_FROM_EMAIL="Disco Media <hello@example.com>"
CLOUDFLARE_ACCOUNT_ID="..."
CLOUDFLARE_API_TOKEN="..."
```

`ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` are required for `/admin`. `DISCO_MAIL_API_KEY`, `CONTACT_TO_EMAIL`, and `CONTACT_FROM_EMAIL` are required for form delivery. CMS data is stored in the `DISCO_MEDIA_CMS` KV binding, which is configured on the Pages project and never committed.

## Development

Run the Astro dev server:

```bash
npm run dev
```

Run the Pages dev server when testing functions, forms, dynamic pages, or the admin interface:

```bash
npm run dev:pages
```

The admin UI is available at:

```text
/admin
```

## Content

Seed pages live in `src/content/pages/*.md`. Each page uses frontmatter with this shape. Slugs can be nested paths, such as `/portfolio/app1`.

```yaml
---
slug: "/example"
title: "Example"
navLabel: "Example"
seoTitle: "Example | Disco Media"
description: "Short SEO description."
order: 10
published: true
---
```

Core seed pages are:

- `/`
- `/contact`
- `/support`
- `/privacy`

The admin interface stores edited pages and menu items in Cloudflare KV. `npm run dev:pages` creates an isolated local KV simulator under `.wrangler/`.

## Scripts

```bash
npm run dev          # Start Astro dev server
npm run build        # Build production output into dist/
npm run preview      # Preview the production build locally
npm run dev:pages    # Start Pages dev with functions and local KV
npm run typecheck    # Typecheck browser and Pages code
npm test             # Run CMS, auth, and Disco Mail unit tests
npm run snapshot:netlify-cms # Back up the legacy live CMS before cutover
npm run migrate:netlify-cms  # Import the backup data into the bound KV namespace
```

## Deployment

The site deploys to Cloudflare Pages:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `functions`
- Production branch: `master`
- GitHub Actions validates each push and deploys `master`; pull requests receive preview deployments.

Published CMS paths are resolved by the Pages catch-all Function and served with the existing dynamic Astro shell. Static routes and assets are served by the Pages `ASSETS` binding.

## Cloudflare setup and cutover

1. Create the Pages project with `npx wrangler pages project create disco-media-site --production-branch master --compatibility-date 2026-07-31 --compatibility-flag nodejs_compat`.
2. Create separate production and preview KV namespaces (this project uses `DISCO_MEDIA_CMS` and `DISCO_MEDIA_CMS_PREVIEW`); bind each to `DISCO_MEDIA_CMS` in the matching Pages deployment environment.
3. Set the five runtime values from `.env.example` as Pages secrets and set `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` as GitHub repository secrets.
4. Run `npm run snapshot:netlify-cms`, set `DISCO_MEDIA_CMS_NAMESPACE_ID`, then run `npm run migrate:netlify-cms`. Keep the ignored `.local/migration-backups/` snapshot until Netlify is retired.
5. Deploy a preview, validate `/`, `/portfolio`, `/admin`, `/terms`, both forms, sitemap, and robots, then add `discomedia.co` and `www.discomedia.co` as Pages domains. `www` is redirected to the apex by middleware.
6. After production verification succeeds, detach the domain from Netlify and delete the old Netlify site, functions, blobs, variables, and build hook.

## Verification

Before deploying, run:

```bash
npm test && npm run typecheck && npm run build
```
