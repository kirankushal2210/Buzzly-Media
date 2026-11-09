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
| `CONTACT_AUTO_REPLY` | Visitor confirmation email; on by default, `false` turns it off |

| `SUPABASE_URL`, `SUPABASE_SECRET_KEY` | **Required.** Inquiry database (server-only secret key) |

Every inquiry is saved to Supabase (`public.inquiries`) before the visitor is told it was received, then sent to every configured channel (email, Slack, Discord). Retries never save or notify twice, a failed notification is recorded on the row instead of losing the inquiry, and rate limits are counted in the database, so they hold across Vercel instances. Without Supabase configured the form shows "inbox being set up" and accepts nothing.

## Inquiry inbox

Full setup, environment variables, how to view inquiries in the Supabase dashboard, privacy, retention and backups: **[docs/INQUIRIES.md](docs/INQUIRIES.md)**. Migration: `supabase/migrations/`. Tests: `npm run test:contact` (needs a disposable Postgres; see the doc).

The older Cloudflare D1 storage (`db/`, `drizzle/`, `db:*` scripts) is no longer used by the contact route.

### Auto-reply, rate limiting, security

- Once the inquiry is saved, the visitor gets one short confirmation email (`lib/email.ts`), independent of whether the team notification succeeded. It never repeats their name or message, so the form can’t be used to relay spam, and it promises no response time. Turn it off with `CONTACT_AUTO_REPLY=false`.
- Each IP may send 5 inquiries and each email address 3 per hour, counted in the database (`submit_inquiry`); extra attempts get HTTP 429. IPs are stored only as a salted hash — set a random `CONTACT_IP_SALT` secret in production.
- Cross-site form posts are rejected. Security headers (CSP, frame blocking, nosniff, referrer and permissions policies, HSTS on HTTPS) are added in `worker/index.ts`; static files get theirs from `public/_headers`, which also sets long cache lifetimes for media, fonts and build assets.

## Legal pages

`/privacy` and `/terms` read company details from `lib/legal.ts` (legal entity name, privacy email, jurisdiction, retention period). Fill those in and have the text reviewed by a lawyer before launch.

## Video

Films were re-encoded (H.264, `+faststart`) from about 28 MB to 9.8 MB in total with near-identical quality, and now begin playing before they finish downloading. The cafe film has no audio track, so its sound button is hidden (`FILM_HAS_AUDIO` in `components/home/ExpandingScrollFilm.tsx`).

## SEO and launch settings

`NEXT_PUBLIC_SITE_URL` sets the production origin used by canonical URLs, `app/sitemap.ts`, `app/robots.ts` and the generated share images (`app/opengraph-image.tsx`, `app/work/[slug]/opengraph-image.tsx`). Pages are now indexable.

## Structured data and performance

- `app/layout.tsx` publishes linked `Organization` and `WebSite` JSON-LD. Add your social profile URLs to `socialLinks` in `lib/site.ts` and they appear as `sameAs` automatically.
- Posters and cards use `next/image` (AVIF/WebP, responsive sizes). Vercel optimises them; on Cloudflare without an Images binding they fall back to the original files.
- The homepage film expands with `clip-path` and transforms only, so scrolling causes no layout shift. Measured on a production build: CLS 0 on every page (desktop and phone), first contentful paint ~210 ms locally.

## Content still to approve

- `lib/work.ts`: case study copy and stats. The cafe story is marked illustrative on every page it appears.
- `lib/clients.ts`: testimonials are layout samples with `approved: false`, shown with an "awaiting approval" label. Replace them with approved client quotes and set `approved: true`.

## Known vinext issue

`next/link` in the vinext 1.0.0-beta.5 production build throws on click (its lazy navigation import resolves to the wrong chunk). `components/Link.tsx` is a drop-in replacement built on `useRouter()`. Switch imports back to `next/link` when vinext fixes it.

## Intro-call booking (`/book`)

The "Schedule a 15-Minute Intro Call" button on `/contact` opens `/book`, which embeds a Cal.com booking calendar (`components/booking/BookingScheduler.tsx`, settings in `lib/booking.ts`). Cal.com shows available dates and times in the visitor's time zone, collects their details, and emails the calendar invitation and meeting link. When a booking completes, the page swaps to its own confirmation screen.

Until `NEXT_PUBLIC_CAL_LINK` is set, `/book` shows "Online booking opens soon" with a link to the contact form; nothing is broken or invented. To go live:

1. Create a free Cal.com account and connect the calendar that should receive bookings (Google or Outlook).
2. Create an event type: 15 minutes, a video location (Cal Video, Google Meet or Zoom), sensible buffers and minimum notice, and your working hours under Availability.
3. Under the event's **Advanced → Booking questions**, keep Name and Email, rename "Additional notes" to "What would you like help with?", and add a short-text question with the identifier `company` labelled "Company or brand". `/book?company=…` prefills it.
4. Set `NEXT_PUBLIC_CAL_LINK` to the event, e.g. `your-username/intro-call`, in `.env.local` and in Vercel, then rebuild. The value is public: it is the same link anyone could open.
5. Make one test booking yourself and cancel it from the confirmation email.

Cal.com sends the invitation, reminders and reschedule/cancel links, and stores the booking; Buzzly's site stores nothing. The site's Content-Security-Policy (`lib/security-headers.ts`) allows only `app.cal.com` and `cal.com` for this. If the embed can't load (ad blocker, outage), the page links to the same event on cal.com and to the contact form.
