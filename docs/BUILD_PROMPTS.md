# Copy-ready build prompts, in order

These prompts are for page-by-page implementation in Codex. The source of visual truth is the current private Buzzly site and this repository's `lib/prototype.ts`, `app/prototype.css`, `public/prototype.js`, and supplied media. Keep the current owner-private audience. Do not attach a GoDaddy domain until the owner chooses one.

## 0. Foundation and design tokens

> Audit the approved homepage and `docs/SITEMAP.md`. Extract the palette, typography, spacing, buttons, rules, media treatments, and responsive breakpoints into shared design tokens. Preserve the current rendered design. Make a list of all homepage sections and interactive states. Do not invent content or change the brand positioning. Run TypeScript and the production build. Show desktop and mobile screenshots before moving on.

## 1. Homepage intro, navigation, and hero

> Rebuild the intro, navigation, hero, immediate project CTA, and positioning block as reusable React components. Match the approved design element for element: near-black background; cream Instrument Serif headline; red accents and button; the exact Buzzly core line; “For ambitious brands ready to scale.” directly below it; supporting positioning and Our Work. Preserve the brand hover from cream to red, intro skip, keyboard focus, and responsive reading order. Compare screenshots at 1440px and 390px against the current homepage before replacing the existing prototype markup.

## 2. Expanding film

> Implement the homepage film as a reusable accessible component. It starts as an editorial frame and expands smoothly to the viewport as the user scrolls. Keep pause, replay, progress, time, poster, and transcript. Respect reduced motion, mobile data/performance, and touch input. The current cafe video is an illustrative placeholder; its numerical views and customer counts must always be labeled fictional. Do not autoplay with sound. Confirm that the scroll effect is smooth and the page remains usable without JavaScript.

## 3. Companies overview and three company pages

> Build `/companies` and the three real Buzzly company routes from shared structured content. Use the supplied videos and the homepage's editorial language, varied layouts, large serif typography, dark/cream/red palette, and subtle motion. Do not present illustrative stock imagery as company photography. Each page needs a meaningful company description, navigation to the other companies, and a project CTA. Verify each route at desktop and mobile widths and check video loading behavior.

## 4. Work and future case studies

> Build `/work` as a motion-led portfolio page in the same design system. Show sample concepts only with conspicuous “Sample concept — not a client project” labels. Keep data structures ready for genuine `/work/[slug]` case studies, but do not publish case studies without approved assets and verified results. Make the gallery visual, asymmetric, and interactive without repeating generic cards. Verify navigation and keyboard access.

## 5. Client Confessions and Wins

> Build a dedicated `/clients` page and align the homepage client preview with it. The page has a logo/story showcase, testimonial layout, and win format, but displays only approved client names, quotes, and outcomes. Until approved content arrives, show clearly labeled preview slots, not fabricated endorsements. Keep the editorial red/cream/dark treatment and add touch-friendly horizontal navigation. Prevent the route from being indexed during review.

## 6. Services and process

> Build `/services` with a clear story: understand the brand, form the strategy, create content, manage social channels, and distribute it. Explain where reels, imagery, storytelling, and optional paid campaigns fit. Avoid guaranteed reach or revenue claims. Match the bold typography, section pacing, and motion language of the homepage. Use distinct layouts for each stage instead of a uniform grid. Include a Start a Project CTA.

## 7. About Buzzly

> Build `/about` around the precise positioning: Buzzly is a technology-led company builder that builds its own businesses and helps ambitious partners through content and distribution. Explain the three businesses and the partner offer. Use only verified team/company facts. Keep the page visually rich through typography, films, and transitions while ensuring the information is readable without animation.

## 8. Contact and backend

> Finish `/contact` and `/api/contact`. Keep the form accessible and validated on the client and server. Reject spam via honeypot and request limits. Deliver through a configured email provider using server-side secrets; never put keys in client code. Show a true success state only after the provider accepts delivery. The owner has not chosen a real recipient yet, so keep delivery unconfigured and surface a clear error. Test invalid input, unavailable delivery, successful provider response in a mock, and mobile form behavior.

## 9. Footer, global motion, and accessibility

> Make navigation, footer, typography, buttons, focus states, page transitions, and reduced-motion behavior consistent across all routes. Preserve the editorial footer rather than a boxed layout. Check every CTA, menu state, scroll animation, form label, alt text, and media control with keyboard and touch input. Remove unnecessary animation when it slows reading or causes layout shifts.

## 10. Private deployment and launch preparation

> Run TypeScript, lint, production build, and browser QA at 1440px, 768px, and 390px. Review every route and media request. Publish a new owner-private version to the existing Buzzly Site and verify the deployment status and access. Keep `noindex` and demo labels. Write a launch checklist for real client assets, approved claims, chosen contact email, verified sender, selected GoDaddy domain, exact DNS records, HTTPS, and rollback. Do not make the site public or change DNS until those items are supplied and the owner asks for launch.
