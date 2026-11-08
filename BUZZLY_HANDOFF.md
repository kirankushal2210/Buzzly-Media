# Buzzly website handoff

This folder contains the current **local** Buzzly website source, supplied films, generated film covers, and the latest compiled `dist/` build. The existing private review site has not been updated with these local changes.

## Pages

Home, Work, Clients, Our Companies, three company pages, About, Services, and Contact.

## Run locally

Requires Node.js 22.13 or newer. Run `npm ci`, then `npm run dev`. Use `npm run build` to recreate the compiled build. The ZIP excludes `node_modules` and temporary local state.

## Deploying on Vercel

`vercel.json` makes Vercel run a plain `next build` (not the vinext `npm run build`, which targets Cloudflare). App code reads settings through `lib/runtime-env.ts`, so it has no Cloudflare imports; the Cloudflare D1 database is used only when the site runs on Cloudflare.

Set these in Vercel → Project → Settings → Environment Variables (Production and Preview):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Production origin, e.g. `https://www.yourdomain.com` |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook (`https://hooks.slack.com/services/...`) |
| `DISCORD_WEBHOOK_URL` | Discord channel webhook (`https://discord.com/api/webhooks/...`) |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Email delivery via Resend |
| `CONTACT_IP_SALT` | Long random string for hashing IPs |
| `CONTACT_AUTO_REPLY` | `true` to email customers a confirmation (off by default) |

Leads go to every configured channel at once; a submission succeeds if at least one channel accepts it. On Vercel there is no database, so if every channel fails the visitor is asked to try again (nothing is stored). Rate limiting on Vercel is per server instance; for a hard limit, add a Vercel Firewall rate-limit rule on `POST /api/contact` (for example 5 requests per hour per IP).

## Inquiry inbox

Every contact form submission is saved to the D1 table `contact_inquiries` (see `db/schema.ts`, migration in `drizzle/`) before any email is sent, so inquiries are kept even when Resend is down or not configured. Each row records whether the email was sent (`emailed`, `email_failed`, `email_skipped`).

- Local: copy `.env.example` to `.env.local` and fill in `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`. Run `npm run db:migrate:local` once, then `npm run db:inquiries:local` to list recent inquiries.
- Production: set the same three values as Worker secrets. The hosting platform applies `drizzle/` migrations to the real D1 database (`.openai/hosting.json` now sets `"d1": "DB"`).

### Auto-reply, rate limiting, security

- After an inquiry is stored, the sender gets a short confirmation email (`lib/email.ts`). It never repeats their name or message, so the form can’t be used to relay spam. Turn it off with `CONTACT_AUTO_REPLY=false`.
- Each IP may send 5 inquiries and each email address 3 per hour (`lib/rate-limit.ts`); extra attempts get HTTP 429. IPs are stored only as a salted hash — set a random `CONTACT_IP_SALT` secret in production.
- Cross-site form posts are rejected. Security headers (CSP, frame blocking, nosniff, referrer and permissions policies, HSTS on HTTPS) are added in `worker/index.ts`; static files get theirs from `public/_headers`, which also sets long cache lifetimes for media, fonts and build assets.

## Legal pages

`/privacy` and `/terms` read company details from `lib/legal.ts` (legal entity name, privacy email, jurisdiction, retention period). Fill those in and have the text reviewed by a lawyer before launch.

## Video

Films were re-encoded (H.264, `+faststart`) from about 28 MB to 9.8 MB in total with near-identical quality, and now begin playing before they finish downloading. The cafe film has no audio track, so its sound button is hidden (`FILM_HAS_AUDIO` in `components/home/ExpandingScrollFilm.tsx`).

## SEO and launch settings

`NEXT_PUBLIC_SITE_URL` sets the production origin used by canonical URLs, `app/sitemap.ts`, `app/robots.ts` and the generated share images (`app/opengraph-image.tsx`, `app/work/[slug]/opengraph-image.tsx`). Pages are now indexable.

## Content still to approve

- `lib/work.ts`: case study copy and stats. The cafe story is marked illustrative on every page it appears.
- `lib/clients.ts`: testimonials are layout samples with `approved: false`, shown with an "awaiting approval" label. Replace them with approved client quotes and set `approved: true`.

## Known vinext issue

`next/link` in the vinext 1.0.0-beta.5 production build throws on click (its lazy navigation import resolves to the wrong chunk). `components/Link.tsx` is a drop-in replacement built on `useRouter()`. Switch imports back to `next/link` when vinext fixes it.
