# Buzzly sitemap and build order

## Brand and conversion goal

Buzzly is a technology-led company builder. It builds brands through content: its own companies and ambitious partners' businesses. The site's primary action is to start a project conversation. Secondary actions are to explore Buzzly's companies, understand the approach, and view approved work.

## Routes

| Build order | Route | Role | Main sections | Current state |
|---|---|---|---|---|
| 1 | `/` | Editorial introduction and conversion | Intro splash; navigation; hero; project CTA; expanding film; companies; work; ecosystem; clients preview; services; approach; content process; footer | Intro, navigation, and hero converted to React; remaining sections preserve approved prototype |
| 2 | `/companies` | Introduce Buzzly's three businesses | Hero; three film-led entries; company builder context; CTA | Staggered film-led layout built |
| 3 | `/companies/de-food-kampney` | Food business detail | Film hero; business description; relevant visual system; CTA | Film-led detail built |
| 4 | `/companies/buzzly-health` | Health business detail | Film hero; business description; relevant visual system; CTA | Film-led detail built |
| 5 | `/companies/buzzly-properties` | Property business detail | Film hero; business description; relevant visual system; CTA | Film-led detail built |
| 6 | `/services` | Explain the partner offer | Editorial hero; strategy; content; social media; distribution; process; CTA | Five-stage editorial story built |
| 7 | `/about` | Explain company builder model | Hero; positioning; own businesses; partner work; approach; CTA | Editorial manifesto and three-film strip built |
| 8 | `/work` | Show approved portfolio | Exact homepage Work section layout; asymmetric visual grid of sample concepts; approved case studies when available | Matched to approved homepage section; sample concepts clearly labeled |
| 9 | `/clients` | Showcase approved partners and wins | Client identities; stories; quotes; measurable outcomes | Preview route built; demo identities and empty win slots until source material is approved |
| 10 | `/contact` | Capture project inquiries | Hero; form; contact details when chosen; confirmation/error state | Form and API built; delivery needs real recipient and provider credentials |

`/work/[slug]` becomes a public route only after a case study has approved assets, client permission, and verified outcomes. Avoid publishing empty detail pages.

## Homepage section order

1. **Intro:** Buzzly wordmark and core line; short and skippable.
2. **Navigation:** Work, About, Services, Our Companies, Clients, Let’s Connect.
3. **Hero:** “We build brands through content. Ours and everyone else’s.” Serif display, cream text, dark background, red accents.
4. **Immediate conversion:** “For ambitious brands ready to scale.” and red “Start a Project” button immediately beneath the headline.
5. **Positioning:** A strategy-led brand statement; clear explanation of building distribution for own companies and partners; Our Work link.
6. **Scroll film:** Full-width expansion on scroll, poster, playback/replay controls, transcript. Current cafe story is illustrative and will be replaced.
7. **Our companies:** Three supplied videos for De Food Kampney, Buzzly Health, and Buzzly Properties; varied editorial placement.
8. **Work:** Motion-led sample concepts, visibly labeled until genuine work is approved.
9. **Buzzly ecosystem:** Own companies, partner offer, and industries.
10. **Client Confessions and Wins:** Preview structure only; no invented client claims.
11. **Services:** Content, social media, distribution; direct action to start a project.
12. **About/approach:** Technology-led company builder positioning and how content makes brands visible.
13. **Content direction:** Reels, images, stories, and visual references.
14. **Footer:** Large Buzzly identity, short brand statement, company/navigation links, prominent red Let’s Connect CTA.

## Shared design system

- Palette: `#151313` background, `#f5efdf` cream, `#ef342d` red, `#bbb5a9` muted, `#403b38` rules.
- Type: Instrument Serif for large editorial copy; DM Sans for body and controls.
- Layout: open, asymmetric, generous space, thin rules, little box chrome. Mobile gets its own composition.
- Motion: use motion to show the brand story and interactions; preserve readable content if motion is disabled.
- Truth: no fabricated clients, outcomes, testimonials, or projects. The current cafe film's figures are explicitly fictional.

## Definition of done for each page

At 1440px, 768px, and 390px widths: composition matches the approved reference where one exists; no overflow or clipped type; links work; keyboard focus is visible; videos have posters and controls; reduced motion works; no console errors; page metadata is correct; `tsc` and production build pass. Keep a before/after screenshot for review.
