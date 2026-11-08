# Buzzly website handoff

This folder contains the current **local** Buzzly website source, supplied films, generated film covers, and the latest compiled `dist/` build. The existing private review site has not been updated with these local changes.

## Pages

Home, Work, Clients, Our Companies, three company pages, About, Services, and Contact.

## Run locally

Requires Node.js 22.13 or newer. Run `npm ci`, then `npm run dev`. Use `npm run build` to recreate the compiled build. The ZIP excludes `node_modules` and temporary local state.

## Inquiry inbox

The contact form stays in preview mode until `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `CONTACT_FROM_EMAIL` are configured. `CONTACT_TO_EMAIL` is the destination inbox and can be changed later without redesigning the form. An end-to-end email test is still required after configuration.

## Before public launch

The site currently uses `noindex` metadata and a `robots.txt` disallow rule for private review. Update those rules, the share-image base URL, and the domain when the public launch is ready. Replace the illustrative cafe campaign with approved client work when available.
