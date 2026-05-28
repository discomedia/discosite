# Disco Media Site

Astro site for Disco Media, a Melbourne-based media company. The site is built with Astro, React islands, Tailwind CSS, Netlify Functions, Netlify Blobs, and Resend-powered contact/support forms.

## Features

- Static Astro pages for the core site routes.
- Markdown-backed seed content in `src/content/pages`.
- Dynamic page rendering through `/.netlify/functions/page`.
- Password-protected `/admin` interface for creating, editing, publishing, and deleting pages.
- Netlify Blobs storage for CMS page overrides, with a local fallback under `.netlify/local-blobs` during development.
- Contact and support forms delivered through Resend.
- Sitemap, robots.txt, canonical metadata, Open Graph tags, and Netlify deploy configuration.

## Tech Stack

- [Astro](https://astro.build/)
- React 19
- Tailwind CSS 4
- Netlify Functions
- Netlify Blobs
- Resend

## Project Structure

```text
src/pages/                 Astro routes
src/components/            Astro and React UI components
src/content/pages/         Markdown seed pages
src/lib/                   Content, markdown, and shared types
netlify/functions/         Admin, page, contact, and support functions
public/                    Static assets, robots.txt, and Netlify redirects
```

## Requirements

- Node.js 22 or compatible current LTS
- npm
- Netlify CLI for local function development

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a local `.env` file for Netlify development and configure the same values in Netlify for production.

```bash
ADMIN_PASSWORD="replace-me"
ADMIN_SESSION_SECRET="replace-me-with-a-long-random-string"
RESEND_API_KEY="re_..."
CONTACT_TO_EMAIL="hello@example.com"
CONTACT_FROM_EMAIL="Disco Media <hello@example.com>"
NETLIFY_BUILD_HOOK_URL="https://api.netlify.com/build_hooks/..."
```

`ADMIN_PASSWORD` is required for `/admin`. `ADMIN_SESSION_SECRET` is optional for local development but required in production so admin cookies are signed independently from the password. Resend variables are required for the contact and support forms. `NETLIFY_BUILD_HOOK_URL` is optional and triggers a rebuild after admin page saves.

## Development

Run the Astro dev server:

```bash
npm run dev
```

Run the Netlify dev server when testing functions, forms, dynamic pages, or the admin interface:

```bash
npm run netlify:dev
```

The admin UI is available at:

```text
/admin
```

## Content

Seed pages live in `src/content/pages/*.md`. Each page uses frontmatter with this shape:

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

The admin interface stores edited pages in Netlify Blobs. Locally, when Netlify Blobs is not available, page overrides are written to `.netlify/local-blobs/disco-media-pages`.

## Scripts

```bash
npm run dev          # Start Astro dev server
npm run build        # Build production output into dist/
npm run preview      # Preview the production build locally
npm run netlify:dev  # Start Netlify dev with functions
```

## Deployment

The site is configured for Netlify:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

Netlify redirects all unmatched paths to `/dynamic`, which renders published dynamic pages.

## Verification

Before deploying, run:

```bash
npm run build
```
