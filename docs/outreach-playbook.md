# Cold outreach playbook: the free brand preview

For businesses whose brand isn't showing up online yet. Adapted from the "free preview" outreach
method (find businesses with a weak online presence, build them something useful from their own
public information, and lead with it). Buzzly's version is a **brand preview**, not a website.

## The loop (all inside the CRM → GTM → Cold calling)

1. **Find** local businesses with a weak presence, manually: Google Maps in one area and category
   (for example cloud kitchens in Gachibowli). Look for an old or missing website, an Instagram that
   stopped posting, no reels, no recent photos on the Maps listing.
   - Don't scrape Google Maps with bots; it breaks Google's terms. If volume grows, use the official
     Google Places API (needs a Google Cloud account and billing, so it needs approval).
2. **Add a prospect**: business, kind of business, area, public phone/email/website/Instagram/Maps link.
3. **Write what you noticed**, one observation per line, factual and kind
   ("Last Instagram post was in March"). Add a one-line personal note. Set Preview to **Ready**.
4. **Their preview page** appears at a private link (`/p/<id>`): what we noticed, three ideas for
   their kind of business, what a first month looks like, and a way to reply. It is not in the
   sitemap, is blocked for search engines, and shows only what you wrote.
5. **Send it** through their public contact form or business email, or mention it on the call. Mark it
   **Sent**. When they open it, it switches to **Viewed** with the time (your own team's views don't count).
6. **Call** with the copilot: it picks who's next, writes a personalised script (opener, why you're
   calling, what you noticed, questions, close, objection answers) and logs the outcome in one click.
   **Interested** creates a lead and a call record automatically.

## Rules (India)

- **Call only 9 AM–9 PM.** The copilot warns outside that window.
- **Respect "Do not call"** immediately, and say where you got the number (their public listing).
- **WhatsApp only to people who opted in.** Never cold-message on WhatsApp.
- **Only public business information.** No personal phone numbers of staff, no bought or scraped lists.
- **Previews are private.** Never publish a prospect's preview or use their name or logo publicly
  without permission.
- TRAI's 2026 amendment to the telemarketing rules was still in draft at the time of writing. Check
  the final text before scaling calling, and before any automated or AI calling.

## The sales calling agent

**Built now: the call copilot** (`/admin/calling`). It doesn't need any new account: it writes the
script and logs outcomes, and a person makes every call.

**Not built (needs your approval): an AI that places calls itself.** That needs:
- a telephony provider with Indian numbers (for example Exotel or Plivo) and a voice-agent platform
  (for example Vapi or Retell), each a paid account;
- a check of TRAI rules for automated/AI calls and DLT registration where it applies;
- the call to say clearly at the start that it's an AI assistant calling for Buzzly;
- a human handoff for anyone interested, and recordings only with consent.

A sensible order: run the copilot with people for a few weeks, learn which script works, then decide
whether an AI caller is worth it.
