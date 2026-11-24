/**
 * Cold outreach for businesses with little brand presence yet.
 * Method (adapted from the "free preview" outreach approach): find local
 * businesses whose online presence is weak, prepare a personalised brand
 * preview from their own public information, then call or message them with
 * it, value first, pitch second.
 *
 * These ideas are Buzzly's suggestions, never claims about the prospect.
 * Everything specific to a business comes from what the team typed in the CRM.
 */
import type { PROSPECT_CATEGORIES } from "@/lib/crm-config";

type Category = (typeof PROSPECT_CATEGORIES)[number];
export type Idea = { format: string; hook: string; why: string };

export const IDEAS: Record<Category, Idea[]> = {
  "Restaurant, café or cloud kitchen": [
    { format: "Weekly reel series", hook: "Behind the pass: one dish, start to plate, in 20 seconds", why: "People order from kitchens they can see. A face and a process build trust faster than menu photos." },
    { format: "Regulars, on camera", hook: "What do you always order here?", why: "Real customers answering one question gives new visitors a reason to try you, in your regulars’ own words." },
    { format: "Google listing refresh", hook: "Fresh photos and a short video on your Maps listing", why: "Most first visits start on Google Maps. Recent, real photos turn a search into a booking or an order." },
  ],
  "Clinic or wellness": [
    { format: "Front-desk answers", hook: "The three questions patients ask every week, answered in 30 seconds each", why: "Calm, short explainers mean new patients arrive already understanding your care." },
    { format: "Meet the practitioner", hook: "Who will treat you, and how they work", why: "Choosing a clinic is personal. Seeing the person first lowers the worry of the first visit." },
    { format: "Myth or fact", hook: "One common myth in your field, corrected kindly", why: "Useful, shareable content that builds authority without making medical claims." },
  ],
  "Real estate": [
    { format: "One walkthrough, many cuts", hook: "A single shoot cut into a week of reels and stories", why: "Buyers want to feel the space. One shoot can feed every platform for weeks." },
    { format: "The neighbourhood", hook: "Five minutes from the site: schools, food, the commute", why: "People buy the area as much as the flat. Showing daily life answers the questions buyers don’t ask aloud." },
    { format: "Site-visit invitation", hook: "Every post ends with one clear way to book a visit", why: "Attention is only useful when it leads to a visit. One simple next step does that." },
  ],
  "Retail or boutique": [
    { format: "New in, worn three ways", hook: "One new piece, three ways to wear it", why: "Shows the product in real life and gives followers a reason to come back for each drop." },
    { format: "Owner’s picks", hook: "What the owner would buy this week, and why", why: "A personal voice is what a local store has that large brands don’t." },
    { format: "Visit the store", hook: "A 15-second walk from the door to the counter", why: "Helps people picture the visit, which turns online interest into footfall." },
  ],
  "Salon or fitness": [
    { format: "Before and after, done right", hook: "One transformation, with the client’s permission and their words", why: "Real results, shown honestly and with consent, are the strongest proof in your category." },
    { format: "Coach’s tip", hook: "One 20-second tip a week from your trainer or stylist", why: "Steady, useful tips keep you in people’s feeds between visits." },
    { format: "A day at the studio", hook: "What a first session actually looks like", why: "Removes the nerves of a first visit, the main reason people put off booking." },
  ],
  "Other local business": [
    { format: "Show the work", hook: "One job from start to finish, in under 30 seconds", why: "Seeing how you work builds trust faster than any description." },
    { format: "Customer questions", hook: "The question customers ask most, answered on camera", why: "Answers what people are wondering before they call." },
    { format: "Meet the team", hook: "The people customers will actually deal with", why: "People buy from people. A face makes a local business easier to choose." },
  ],
};

export const ideasFor = (category: unknown): Idea[] => IDEAS[(category as Category)] ?? IDEAS["Other local business"];

export const gapsList = (value: unknown) =>
  String(value ?? "").split("\n").map(line => line.replace(/^[-•*]\s*/, "").trim()).filter(Boolean).slice(0, 6);

export type Prospect = Record<string, string | number>;

/** Promotional calls in India are allowed 9 AM to 9 PM (TRAI). The copilot warns outside it. */
export function callingWindow(now = new Date()) {
  const hour = now.getHours();
  return { open: hour >= 9 && hour < 21, hour };
}

/** The call script the copilot shows, personalised from the prospect record. */
export function callScript(p: Prospect, caller = "") {
  const business = String(p.business ?? "your business");
  const person = String(p.contactName ?? "").trim();
  const me = caller.trim() || "[your name]";
  const gaps = gapsList(p.brandGaps);
  const idea = ideasFor(p.category)[0];
  const sentPreview = p.previewStatus === "Sent" || p.previewStatus === "Viewed";
  return {
    opener: `Hi${person ? ` ${person}` : ""}, this is ${me} from Buzzly, a content studio here in Hyderabad. I’m calling about ${business}. Is now a bad time for one minute?`,
    reason: sentPreview
      ? `We put together a short brand preview for ${business}, a few ideas made just for you. I sent it over${p.previewStatus === "Viewed" ? " and saw it was opened" : ""}. Did you get a chance to look at it?`
      : `We looked at how ${business} shows up online and put together a few ideas. I’d love to send you a short preview, free, no strings.`,
    noticed: gaps.length ? `One thing we noticed: ${gaps[0].charAt(0).toLowerCase()}${gaps[0].slice(1)}. ${idea ? `For example, ${idea.format.toLowerCase()}: “${idea.hook}”.` : ""}` : idea ? `One idea we had: ${idea.format.toLowerCase()}, “${idea.hook}”.` : "",
    questions: [
      "How do most new customers find you today?",
      "Who looks after your Instagram and Google listing right now?",
      "If more people found you online, what would you want them to do: call, visit or order?",
      "Have you worked with anyone on content before? What did you like or not like?",
    ],
    close: `Would you be open to a 20-minute call this week where we walk you through the preview and what a month could look like? No commitment.`,
    objections: [
      { q: "We don’t have the budget", a: "Completely fair. The preview is free, and we can start small. Most of our work starts with one shoot that feeds a month of posts." },
      { q: "We already post ourselves", a: "That’s great, you already know your customers. We can make what you post work harder, or take it off your plate on the busy weeks." },
      { q: "Send me an email", a: `Happy to. What’s the best address? I’ll send the preview for ${business} with two lines on what we’d do first.` },
      { q: "Not interested", a: "No problem at all, thanks for your time. Is it alright if I leave the preview with you in case it’s useful later?" },
      { q: "How did you get my number?", a: `From ${business}’s public Google listing. If you’d rather we didn’t call again, I’ll make a note right now.` },
    ],
  };
}
