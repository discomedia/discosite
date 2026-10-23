# Disco Media style review — 23 October 2026

Baseline: Dana Master Style Guide v1.3. The same local attachment was updated in place after Dana’s follow-up; replacing the Library version is unavailable in this session. Dana approved the local preview and requested production deployment on 23 October 2026.

## Audience and direction

Visitors need to understand what Disco Media publishes and builds, find a particular product, or contact the company. The homepage introduces the business and shows two publications and two apps. The portfolio retains all 24 projects and their existing destinations, screenshots and development status. Contact and support give separate email destinations.

The visual direction uses the existing globe and self-hosted Inter font, off-white surfaces and dark green text. A single neutral surface groups product previews; screenshot colours belong to the products themselves. Six type roles and a 4px spacing scale are documented in `src/styles.css`. No testimonials, audience estimates or performance claims were added.

## Findings and changes

| Category / severity | Location and original example | Effect on visitors | Change |
| --- | --- | --- | --- |
| Writing / moderate | Home: “Good ideas. Out in the world.” | Doesn't identify the business or its products. | “Publishing and Apps for Everyday Life”, with Dana’s requested subtitle. |
| Writing / moderate | Home: “Curiosity is our common thread”, “Our orbit” | Metaphors occupy headings where people need a topic. | “Selected projects” and “We publish, build and run our products.” |
| Design preference / moderate | Home: oversized animated globe, coordinate label, grid, orbit captions and topic strip | Decoration delays the projects and repeats the brand story. | Smaller static globe, no extra annotations or strips, selected work immediately after the introduction. The existing globe artwork remains the brand illustration. |
| Writing / moderate | Portfolio: “bringing people together and making the world a smaller place” | Doesn't explain what the portfolio contains. | Names publications, iPhone and web apps, and tools built for the company's businesses. |
| Writing / moderate | Shared contact banner: “Always curious. Always building.”, “A conversation worth having”, “Let’s connect” | Repeats a general appeal after the project list. | Removed the banner; explicit contact navigation, footer email and a contextual partnership link remain. |
| Writing / moderate | Project descriptions: “Flashcards that fit your life”, “Give your words a voice”, “the useful bits between” | Slogans replace the actual product action. | Rewrote all 24 summaries with the product's documented functions. |
| Design preference / moderate | Project cards: separate pastel backgrounds, fake browser toolbar, tiny domain label, format badge and sequence number | Adds multiple visual layers around each real screenshot. | Show screenshots directly; use one neutral background for phone/panel screenshots. Category and format sit beside the project title. |
| Writing / moderate | Contact: “Good things start with a hello”; support: “A little help. Back on track”; 404: “A little off course” | Delays identification of the page's purpose or failure. | “Contact us”, “Product support”, “Page not found”, with direct instructions. |
| Accessibility / moderate | Contact navigation had no current-page marker; project detail navigation didn't indicate portfolio context. | Current location wasn't consistently available. | All primary links use current-page state; project details mark Portfolio as the current location. |
| Accessibility / moderate | Old supporting text was often 9–13px; legal prose was 14–15px. | Dense and longer content was hard to read. | Body copy 17px, project summaries 16px, supporting labels 12–13px, legal line height 1.8 and width capped at 70ch. |
| Accessibility / minor | Portfolio went from h1 to project h3s. | Skipped the section level for assistive navigation. | Added a screen-reader-visible Projects h2. |
| Function / minor | Native mobile menu lacked Escape/outside-click dismissal. | Extra friction when leaving an open menu. | Escape closes it and restores focus; clicks outside close it. Native disclosure remains usable without JavaScript. |
| Accuracy / potential major | Unused home Markdown claimed “over 500,000 monthly users” and sectors not represented in the current portfolio. | Stale content could reintroduce unsupported claims in a future renderer. | Aligned the legacy content files with the current pages; no audience estimate retained. |
| Content consistency / moderate | Social preview contained the old slogans and design. | Shared links would show copy removed from the site. | Replaced it with a Chrome capture of the revised homepage at a 1200 × 630 CSS-pixel viewport, then refreshed after Dana’s follow-up. |

Legal policy text and dates are unchanged; the guide explicitly gives legal requirements priority over cosmetic preferences. Screenshots remain representative captures from the existing portfolio, rather than new claims about the latest product builds. External product destinations were preserved, not exhaustively re-audited.

## Validation

- `npm run typecheck`: passed, zero errors, warnings or hints.
- `npm test`: passed all five existing tests, covering all ten public HTML routes, all 24 distinct project links, local assets and links, legal content, contact email destinations, sitemap and accessible filter markup.
- `git diff --check`: passed.
- Chrome visual checks: narrow phone (320px), larger phone (390px), tablet (768px), desktop (1440px), plus the sharing-image viewport (1200 × 630) and support-page reflow at 200% browser zoom. The narrow-phone filter wrap found during review was corrected; tablet portfolio headings were realigned and the introduction shortened.
- Chrome interactions: Apps shows 14 projects; right-arrow selects Sites (six), then Other (four), then All (24). Mobile menu opens with labelled destinations; Escape closes it and restores focus. Home/portfolio navigation and contact/support and app-detail routes were exercised.
- Main text colour pairs: ink on paper 12.39:1; muted text on paper 6.07:1; muted text on the secondary surface 5.50:1; green links on paper 7.30:1. Button text passes at 12.39:1 normally and 7.30:1 on hover.
- Screenshots for local review are in ignored `.local/style-review/`. The development server is available at `http://127.0.0.1:4321/`.

Local visual checks don't establish field Core Web Vitals or a complete assistive-technology audit. Real-device and throttled-network performance measurements have not been taken in this pass.

## Follow-up changes

- Exact homepage heading: “Publishing and Apps for Everyday Life” (no final period).
- Exact subtitle: “We publish apps, create websites, and build software for the world around us and everything we love.”
- Selected projects, in order: Discover Discomfort, Grandmaster Flash, Motofomo, Detour.
- Removed all decorative link, card and call-to-action arrows, including the project-detail back-link arrow.
- Geographic references use “Melbourne / Naarm, Australia”; the proper name Melbourne Social Club is preserved.
- The original local master-guide attachment is now v1.3, with the arrow rule, place-name rule and revision entry. No duplicate Library item was created; Library synchronisation remains unavailable.
