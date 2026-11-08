# Buzzly website

This is the source for the private Buzzly review site. It uses a Next-style App Router implementation through Vinext and deploys as a Cloudflare Worker on Sites. The approved prototype remains in this repository's Git history. The intro, navigation, and hero are React components; the remaining homepage markup, CSS, and motion behavior are preserved in `lib/prototype-tail.ts`, `app/prototype.css`, and `public/prototype.js` while they are converted section by section.

The Work route uses the approved homepage Work section directly. All interior routes share its navigation, editorial heading treatment, and footer.

## Pages

Home, Work, Services, About, Clients, Contact, Companies, and detail pages for De Food Kampney, Buzzly Health, and Buzzly Properties. The route plan is in `docs/SITEMAP.md`; copy-ready implementation prompts are in `docs/BUILD_PROMPTS.md`.

## Local commands

Install with `npm run install:ci`, run `npm run dev`, then `npm run build` for the deployable Worker. The Sites workflow publishes the existing project ID in `.openai/hosting.json`.

## Contact delivery

The contact API at `/api/contact` validates inquiries, rejects a honeypot field, and sends through Resend when these runtime variables are configured: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `CONTACT_FROM_EMAIL`. `CONTACT_FROM_EMAIL` must be a verified sender. Until the owner chooses a recipient and configures delivery, the endpoint returns a clear configuration error and does not claim a message was sent.

## Launch checks

- The review site is owner-private and has `noindex` metadata.
- The cafe campaign film and its performance numbers are fictional and labeled as illustrative.
- The sample work and demo client names are placeholders. Replace or remove them before public launch.
- The owner will select a GoDaddy domain and contact address later. Do not change DNS or public access until then.
