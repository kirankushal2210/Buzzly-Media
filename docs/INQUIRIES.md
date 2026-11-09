# Website inquiries: Supabase setup and operations

How the contact form stores and delivers inquiries, how to set it up, and how to look after the data.

## The flow

```
Contact form (components/ContactForm.tsx)
  │  POST /api/contact  { name, email, company, interest, message, website (honeypot), idempotencyKey }
  ▼
app/api/contact/route.ts
  1. Request checks: JSON content type (415), same-origin (403), 8 KB limit (413), valid JSON (400)
  2. Honeypot filled → silent { ok: true }, nothing stored or sent
  3. Field validation (lib/inquiry-validation.ts) → 400 with per-field messages
  4. Supabase not configured → 503 "Our inbox is being set up"
  5. saveInquiry → Supabase function submit_inquiry (lib/inquiries.ts)
       created / duplicate  → continue
       rate_limited         → 429 (5 per IP, 3 per email, per hour)
       key_conflict         → 409 (same key, different content)
       database error       → 503 "We couldn't save your message… nothing was sent"
  6. notifyInquiry → claim_inquiry_notification → in parallel: internal email, visitor confirmation (Resend),
     Slack, Discord → finish_inquiry_notification (each channel recorded separately)
  7. 200 { ok: true, received: true }   (sent only after the database confirmed the save)
```

**Success is reported only after Supabase confirms the save.** The visitor sees "Your message has reached Buzzly", which says the message is stored. It never claims an email was delivered.

**If the save succeeds but a notification fails,** the inquiry stays in the table with `notification_status = 'failed'`, a per-channel result in `notification_channels`, and a short code in `notification_error` (for example `slack:http_500,email:timeout`). The visitor still gets a success message, because the inquiry was received. Someone must check for failed rows (see "Daily check" below); nothing retries them automatically except a repeated submission of the same form.

**If the database is down,** no notification is sent and the visitor is asked to try again. Sending a notification without a saved row would risk a duplicate when the visitor retries.

## Email (Resend)

Two separate emails are sent for each saved inquiry, in parallel, from `CONTACT_FROM_EMAIL`:

| | Internal notification | Visitor confirmation |
|---|---|---|
| To | `CONTACT_TO_EMAIL` (comma-separated list allowed) | The visitor's address |
| Reply-To | The visitor, so Reply in Gmail answers them | The first `CONTACT_TO_EMAIL` address |
| Content | Name, email, company, inquiry type, message, reference; HTML-escaped, plus a plain-text version | Generic thank-you with the inquiry type and reference. It never repeats the visitor's name, company or message (so the form can't relay spam to someone else's address) and promises no response time. |
| Recorded as | `notification_channels.email` | `notification_channels.confirmation` |
| Turn off | Unset `RESEND_API_KEY` | `CONTACT_AUTO_REPLY=false` |

- The confirmation goes out once the inquiry is saved, whether or not the internal notification succeeded.
- A failed confirmation is recorded (for example `confirmation:http_500`) but does not mark the inquiry `failed`. `notification_status` reflects only whether the team was reached. Find failed confirmations with:

  ```sql
  select created_at, email, notification_error from public.inquiries
  where notification_channels->>'confirmation' = 'failed' order by created_at desc;
  ```

  A confirmation that failed while the team was notified is not retried automatically.
- **`sent` means Resend accepted the email.** It does not prove it reached the inbox; it can still bounce or land in spam. Check delivery in Resend → Emails. The website never claims an email was delivered: it says the message reached Buzzly, which is true once it is saved.
- Each email carries a stable Resend `Idempotency-Key` (`inquiry-<id>-notification` / `inquiry-<id>-confirmation`). If a retry ever tries to resend an email Resend already accepted within 24 hours, Resend drops the repeat. This sits on top of the database claim, and it relies on Resend's documented idempotency behaviour, which has not been tested against a real Resend account.
- With Resend's shared test sender (`onboarding@resend.dev`), Resend only delivers to the email address of the Resend account owner. The internal notification works only if that account is registered with the `CONTACT_TO_EMAIL` address. Visitor confirmations are skipped automatically until a real domain is verified.

### Free-plan limits

Check current numbers at resend.com/pricing; they can change. At the time of writing, Resend's free plan allows roughly **100 emails per day and 3,000 per month**, **one verified domain**, and a low **per-second API rate limit**. Each inquiry uses **two emails**, or one if confirmations are off, so the daily cap is about 50 inquiries.

- **Per-second limit hit** (several inquiries at the same moment): the request is retried once after a short pause, reusing the same idempotency key.
- **Daily or monthly quota used up:** Resend rejects further emails until the quota resets. The inquiry is still saved and the visitor still sees success; the row records `email:quota_exceeded` and/or `confirmation:quota_exceeded`, and the team must check the dashboard. Nothing is queued or resent automatically when the quota resets.

### Choosing and verifying the sending domain (Resend + GoDaddy)

Do this once the domain is chosen. Don't invent or pre-fill a domain in the code; only the environment variables change.

1. **Resend → Domains → Add domain.** Resend recommends a sending subdomain (for example `mail.yourdomain.com`) so website email reputation stays separate from the main mailbox. Pick the region closest to your users.
2. Resend shows the exact DNS records to add, typically:
   - an **MX** and a **TXT (SPF)** record for a `send` host;
   - a **TXT (DKIM)** record at `resend._domainkey`;
   - optionally a **TXT (DMARC)** at `_dmarc`.

   Copy the values from Resend, not from this document.
3. **GoDaddy → My Products → (domain) → DNS → Manage DNS → Add New Record** for each one.
   - GoDaddy appends the domain automatically, so enter only the host part Resend shows (for example `send` or `resend._domainkey`, plus `.mail` if you used a subdomain).
   - Don't delete or change existing MX records for the main domain (they route your normal mailbox).
   - If a TXT SPF record already exists for the same host, merge the `include:` into it instead of adding a second SPF record.
4. Back in Resend, click **Verify**. DNS can take minutes to a few hours.
5. Set `CONTACT_FROM_EMAIL` to an address on the verified domain, for example `Buzzly <hello@mail.yourdomain.com>`, in `.env.local` and in Vercel. Restart or redeploy. Visitor confirmations start automatically.
6. Recommended: add a DMARC record (`v=DMARC1; p=none;` to start) so Gmail and Outlook trust the mail, then tighten it later.

### Changing the receiving inbox

`CONTACT_TO_EMAIL` currently points at a temporary Gmail address. To switch to the official business inbox, change `CONTACT_TO_EMAIL` in Vercel (Production and Preview) and in `.env.local`, then redeploy or restart. No code change is needed. Several addresses can be listed, comma-separated. The visitor confirmation's Reply-To follows the first address automatically.

## Duplicate protection

- The browser creates one random key (UUID) per submission and reuses it when the visitor presses Send again after an error. Editing the form or a successful send starts a new key.
- `submit_inquiry` returns the existing row for a repeated key instead of inserting. `idempotency_key` is `unique`, so two simultaneous requests cannot both insert.
- `claim_inquiry_notification` is one atomic `UPDATE`: of any number of concurrent requests, only one gets the claim and sends. The others return success without sending.
- A retry after a partial failure resends only the channels that did not succeed (for example Slack, not the email that already went out).
- A claim left behind by a crashed request expires after 90 seconds. Notifications are attempted at most 3 times per inquiry.
- Known gap: if a notification is sent but the outcome cannot be recorded, even after one retry, the claim expires and a later retry of that same submission could resend it. For the two emails, Resend's idempotency key should drop that repeat within 24 hours; Slack and Discord have no such protection. This needs a database failure at that exact moment.

Tests covering all of this: `tests/contact-api.test.ts`.

## Supabase setup (one time)

1. Create a project at supabase.com. Pick a region close to your Vercel functions; Vercel's default is Washington, D.C. (`iad1`), so a US East region fits unless you change Vercel's region.
2. Apply the migration. Open **SQL Editor → New query**, paste the whole of `supabase/migrations/20261109120000_create_inquiries.sql`, and run it once. If you use the Supabase CLI, `supabase link` and then `supabase db push` do the same.
3. Check it: under **Table Editor**, `inquiries` should show "RLS enabled" and no policies. That is intended.
4. Copy two values from **Project Settings → API Keys** and the project URL:
   - Project URL → `SUPABASE_URL`
   - A **secret** key (`sb_secret_…`) → `SUPABASE_SECRET_KEY`. If your project only shows the legacy keys, use the `service_role` key as `SUPABASE_SERVICE_ROLE_KEY` instead.

   Never use the publishable/anon key here, and never give either value a `NEXT_PUBLIC_` name.
5. Put the values in `.env.local` for local testing, or in Vercel's environment variables (below). Don't paste them into chat, tickets or the repository.

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `SUPABASE_URL` | Yes | Project URL, https |
| `SUPABASE_SECRET_KEY` | Yes | Server-only secret key (or legacy `SUPABASE_SERVICE_ROLE_KEY`) |
| `CONTACT_IP_SALT` | Strongly recommended | Long random string; keeps IP hashes unguessable. Keep it stable or rate-limit history resets. |
| `CONTACT_TO_EMAIL` | For email | Inbox for new inquiries (currently the Buzzly team Gmail; change any time) |
| `RESEND_API_KEY` | For email | From resend.com |
| `CONTACT_FROM_EMAIL` | For email | A sender on a domain verified in Resend. Without a verified domain, Resend only delivers test emails to the Resend account owner's own address. |
| `SLACK_WEBHOOK_URL`, `DISCORD_WEBHOOK_URL` | Optional | Each channel is skipped when unset |
| `CONTACT_AUTO_REPLY` | Optional | Visitor confirmation email. On by default; `false` turns it off |
| `NEXT_PUBLIC_SITE_URL` | Yes for launch | Production domain |

Where to set them:

- **Local development:** `.env.local` (git-ignored). The dev server reads it on start; restart after changes.
- **Private review deployment:** Vercel → Project → Settings → Environment Variables, scope **Preview**. Prefer a separate Supabase project for review data, so test inquiries never mix with real ones.
- **Production:** the same variables, scope **Production**, pointing at the production Supabase project. Redeploy after changing them.

## Viewing inquiries (first version, no custom dashboard)

- **Table Editor → `inquiries`:** sort by `created_at` descending. The dashboard runs as an admin, so you see every row; website visitors cannot.
- **Daily check:** save this as a snippet in the SQL Editor and run it daily:

  ```sql
  select created_at, name, email, inquiry_type, notification_status, notification_error
  from public.inquiries
  where notification_status in ('pending', 'sending', 'failed')
  order by created_at desc;
  ```

  `skipped` means no notification channel was configured: the inquiry exists only in this table.
- **Access:** invite only the people who reply to inquiries (Organization → Team). If your plan offers a read-only member role, use it for anyone who only needs to read. Enable two-factor authentication on every account.
- Treat CSV exports as personal data: don't leave them in shared drives or email them around.

## Privacy and retention

**What is stored** (`public.inquiries` in Supabase):
- name, email, company or brand, inquiry type and message
- a salted one-way hash of the IP address (rate limiting only)
- notification status and short error codes
- timestamps

Raw IP addresses and the browser user-agent are no longer stored.

**Where it goes:**
- The Supabase project.
- The Buzzly inbox via Resend, and Slack/Discord if those are configured.
- Vercel's platform request logs.

App logs contain only status codes and categories, never visitor details.

**Retention: needs your decision.** `/privacy` currently promises inquiries are kept "up to 24 months after our last contact" (`lib/legal.ts`). Nothing deletes old rows automatically yet. Options:
1. A monthly manual delete in the SQL Editor:

   ```sql
   delete from public.inquiries where created_at < now() - interval '24 months';
   ```

   This counts from submission, not from "last contact". Inquiries that became projects should be moved to project records first.
2. Schedule the same delete with Supabase Cron (`pg_cron`).

Copies already sent to email, Slack and Discord are not deleted by this; each needs its own clean-up.

**Privacy page wording that is now inaccurate** (needs updating before launch; not changed here):
- "Who we share it with" names **Cloudflare** as host and inquiry database. It should name Vercel (hosting) and Supabase (inquiry database), plus Slack/Discord if used.
- "What we collect" says the browser's **user-agent string** is stored. It no longer is.
- "How we use it" promises a **one-time confirmation email**. That is now accurate when email is configured (confirmation is on by default), but not while Resend is unconfigured or using its test sender.
- The legal entity, privacy contact and jurisdiction are still placeholders in `lib/legal.ts`.

## Rate limiting

Limits are counted inside the database (`submit_inquiry`), so they are shared by every Vercel instance. That replaces the old in-memory limiter, which reset per instance.

**Limitations:**
- Simultaneous requests can slip a few past the limit.
- Visitors behind one shared IP (office, mobile carrier) share the per-IP allowance.
- Every attempt still reaches the function and the database.

**Recommendation:** add a **Vercel Firewall rate-limit rule** on `POST /api/contact` (for example 10 requests per 10 minutes per IP). It stops floods at the edge before they cost a function call or a database query.

## Backups and reliability

- Saved inquiries live only in Supabase. Check **Database → Backups** for your plan's backup frequency and retention, and whether point-in-time recovery is available. Don't assume backups exist until you've seen them there.
- Free Supabase projects can be paused after a period of inactivity. While paused, the form returns "We couldn't save your message", so check the plan's current terms before launch.
- Email, Slack and Discord delivery depend on those providers and can fail or be delayed. The `inquiries` table is the system of record, and the daily check above is the safety net.
- A periodic CSV export of `inquiries`, stored securely, is a simple extra copy if your plan's backups are limited.

## Running the tests

The tests need a **disposable** Postgres; they wipe the `inquiries` table. With a local Postgres (macOS / Homebrew example):

```bash
initdb -D /tmp/buzzly-pg -U postgres --auth=trust
LC_ALL=C pg_ctl -D /tmp/buzzly-pg -o "-p 54329 -c unix_socket_directories=" start
createdb -h 127.0.0.1 -p 54329 -U postgres buzzly_test
TEST_DATABASE_URL=postgres://postgres@127.0.0.1:54329/buzzly_test npm run test:contact
```

The suite recreates Supabase's `anon`, `authenticated` and `service_role` roles and default grants, applies `supabase/migrations/`, and simulates Supabase's REST layer and Resend/Slack/Discord in-process. Nothing is sent over the network.

## Legacy

`db/`, `drizzle/`, `wrangler.d1-local.jsonc` and the `db:*` npm scripts belong to the earlier Cloudflare D1 storage. The contact route no longer uses them; they can be removed once Supabase is live.
