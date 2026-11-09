# Development Rules

Operational rules for working in this repository. `README.md` covers the stack and `docs/style-review.md` covers copy and design rules.

## Guidance Maintenance

- Keep this file up to date when a change alters how the site is built, tested, deployed or verified.
- Keep updates short and operational.

## Before Finishing a Change

- Run `npm run typecheck` and `npm test`. Both must pass; CI runs the same two commands before it deploys.
- Check copy against `docs/style-review.md` (for example "Melbourne / Naarm, Australia", no decorative arrows, no audience or traffic claims).

## Committing vs Going Live

Committing, pushing a branch and deploying to production are three separate actions. Do each one only when asked.

- **Commit:** local only. "Commit the changes" means `git commit` and nothing else. Do not push.
- **Push a non-`master` branch or open a PR:** CI validates it and publishes a Cloudflare Pages preview deployment. Production is not touched.
- **Push `master`:** this is a live production deploy. `.github/workflows/deploy-cloudflare-pages.yml` runs typecheck and tests, builds, then runs `wrangler pages deploy` to the `disco-media-site` Pages project, which serves https://discomedia.co. Push `master` only when the user explicitly asks to deploy, go live or push the live site. A request to commit is never permission to push `master`.

## Live Deploy Procedure

1. Confirm the working tree is clean and `master` is ahead of `origin/master`: `git status -sb`.
2. Push: `git push origin master`.
3. Watch the run until it finishes: `gh run list --branch master --limit 1`, then `gh run watch <run-id> --exit-status`. The `validate` job must pass before `deploy` runs. If either fails, the live site is unchanged; report the failing step and its log (`gh run view <run-id> --log-failed`).
4. Verify production: fetch https://discomedia.co/ (and any changed route, using trailing slashes) and confirm the new content is served, for example `curl -s https://discomedia.co/ | grep '<expected text>'`. Report the commit hash and run result.

Manual fallback, only if GitHub Actions is unavailable and the user asks for it: with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` loaded from `.env`, run `npm test`, then `npx wrangler pages deploy dist --project-name disco-media-site --branch master`. This bypasses CI, so say so when reporting.

Rollback: revert the commit and push `master` again, or promote an earlier deployment in the Cloudflare Pages dashboard.
