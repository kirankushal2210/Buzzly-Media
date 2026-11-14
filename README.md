# Buzzly website

Source for the public Buzzly website (live on Vercel): the site of Buzzly, a technology-led company builder that builds brands through content. Next.js App Router (React 19) built with vinext for Cloudflare or plain `next build` for Vercel. Lead capture runs through `/api/contact` with storage (Cloudflare D1) and/or delivery to Telegram, Slack, Discord, a generic webhook, or email (Resend).

**Maintainer documentation lives in [`docs/`](docs/README.md)** — PRD, technical requirements, app flow, design brief, schema, integrations, security, agent rules, tickets, and the deployment runbook. Start there.

## Quick start

```bash
npm ci
cp .env.example .env.local      # fill in what you have; all optional locally
npm run db:migrate:local        # creates the local inquiries table
npm run dev                     # http://localhost:5173
```

## Quality gates

```bash
npm run lint
npx tsc --noEmit
npm test                        # unit + in-process API tests
npm run smoke -- <origin>       # post-deploy check, e.g. https://www.buzzly.in (MAINTAINER_TOKEN env adds the health check)
npx next build                  # Vercel path
npm run build                   # Cloudflare path
```

## Pages

Home, Work (+ case studies), Services, About, Clients, Our sub-companies (+ three detail pages), Contact, Careers (roles live in `lib/careers.ts`; empty list = open-application mode), Privacy, Terms. Route details in [`docs/03-APP-FLOW.md`](docs/03-APP-FLOW.md).

## Receiving leads

Configure at least one channel in the hosting platform's environment variables (see [`docs/06-API-AND-INTEGRATIONS.md`](docs/06-API-AND-INTEGRATIONS.md) for step-by-step setup):

| Channel | Variables | Needs an email account? |
|---|---|---|
| Telegram bot | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | No |
| Slack | `SLACK_WEBHOOK_URL` | No |
| Discord | `DISCORD_WEBHOOK_URL` | No |
| Google Sheet / Zapier / Make / n8n | `LEAD_WEBHOOK_URL` (+ optional `LEAD_WEBHOOK_SECRET`) | No |
| Email via Resend | `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Free tier works with `onboarding@resend.dev` → your own address |

Then verify with `curl -H "Authorization: Bearer $MAINTAINER_TOKEN" https://<site>/api/admin/health`.

## Launch status

Content truth: the sample testimonials in `lib/clients.ts` are labelled "awaiting approval" and the cafe film's numbers are labelled illustrative until the owner supplies approved material. Open items are tracked in [`docs/09-FEATURE-TICKETS.md`](docs/09-FEATURE-TICKETS.md).
