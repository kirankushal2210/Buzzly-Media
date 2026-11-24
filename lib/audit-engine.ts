/**
 * Content & funnel readiness scorer behind components/ContentReadinessAudit.tsx.
 *
 * Deterministic today: the same answers always give the same score. The UI
 * only calls `analyzeContentReadiness`, so an LLM can replace the rule-based
 * scorer later without touching the component.
 */
export const AUDIT_QUESTIONS = [
  {
    id: "industry",
    label: "Industry",
    options: [
      { id: "food", label: "Food & restaurants" },
      { id: "health", label: "Healthcare & wellness" },
      { id: "realestate", label: "Real estate" },
      { id: "d2c", label: "D2C & e-commerce" },
      { id: "b2b", label: "B2B services" },
      { id: "other", label: "Something else" },
    ],
  },
  {
    id: "cadence",
    label: "Current posting cadence",
    options: [
      { id: "none", label: "Not posting yet" },
      { id: "irregular", label: "A few times a month" },
      { id: "weekly", label: "1–2 times a week" },
      { id: "frequent", label: "3+ times a week" },
    ],
  },
  {
    id: "bottleneck",
    label: "Primary bottleneck",
    options: [
      { id: "ideas", label: "We don’t know what to post" },
      { id: "production", label: "Production takes too long" },
      { id: "views", label: "Posts don’t get views" },
      { id: "leads", label: "Views, but no enquiries" },
    ],
  },
  {
    id: "capture",
    label: "Lead capture setup",
    options: [
      { id: "none", label: "No way to capture leads" },
      { id: "dms", label: "DMs or phone calls only" },
      { id: "form", label: "A contact form on our website" },
      { id: "funnel", label: "Landing pages with tracked forms" },
    ],
  },
] as const;

type Question = (typeof AUDIT_QUESTIONS)[number];
export type AuditQuestionId = Question["id"];
export type AuditAnswers = { [Q in Question as Q["id"]]: Q["options"][number]["id"] };

export type Severity = "High" | "Medium" | "Low";
export type DiagnosticPoint = { id: "hook" | "distribution" | "conversion"; title: string; score: number; severity: Severity; detail: string };
export type AuditResult = { score: number; band: string; verdict: string; points: DiagnosticPoint[] };

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const severity = (score: number): Severity => (score < 40 ? "High" : score < 70 ? "Medium" : "Low");

const cadenceReach = { none: 10, irregular: 35, weekly: 60, frequent: 80 } as const;
const captureConversion = { none: 10, dms: 35, form: 55, funnel: 80 } as const;

const industryProof: Record<AuditAnswers["industry"], string> = {
  food: "the kitchen, the people and the plate",
  health: "the practitioner explaining what patients worry about",
  realestate: "walkthroughs that show the space and the neighbourhood",
  d2c: "the product in use, from real customers’ point of view",
  b2b: "the expert explaining the problem your buyers search for",
  other: "the people and process behind what you sell",
};

/** Rule-based scorer. Weights: hook/retention 35%, distribution 30%, conversion 35%. */
export function scoreContentEngine(answers: AuditAnswers): AuditResult {
  let hook = 60;
  let distribution: number = cadenceReach[answers.cadence];
  let conversion: number = captureConversion[answers.capture];

  if (answers.bottleneck === "ideas") hook -= 25;
  if (answers.bottleneck === "views") { hook -= 30; distribution -= 10; }
  if (answers.bottleneck === "production") { hook -= 5; distribution -= 15; }
  if (answers.bottleneck === "leads") { hook += 10; conversion -= 20; }
  if (answers.cadence === "none") hook -= 15;
  // Considered purchases need a clear next step more than impulse buys do.
  if ((answers.industry === "b2b" || answers.industry === "realestate") && answers.capture !== "funnel") conversion -= 10;

  hook = clamp(hook);
  distribution = clamp(distribution);
  conversion = clamp(conversion);
  const score = clamp(hook * 0.35 + distribution * 0.3 + conversion * 0.35);
  const proof = industryProof[answers.industry];

  const points: DiagnosticPoint[] = [
    {
      id: "hook",
      title: "Hook & retention gap",
      score: hook,
      severity: severity(hook),
      detail: hook < 40
        ? `Viewers are leaving before the message lands. Open on ${proof} in the first three seconds, and script every piece around one idea.`
        : hook < 70
          ? `The idea is there, but the first seconds need work. Test two or three openings per idea and keep the one people watch past.`
          : "Your openings are holding attention. Keep testing new hooks so the engine does not go stale.",
    },
    {
      id: "distribution",
      title: "Distribution bottleneck",
      score: distribution,
      severity: severity(distribution),
      detail: distribution < 40
        ? "Too little is going out for any platform to learn who your audience is. One shoot a month, cut into many formats, fixes cadence without more filming days."
        : distribution < 70
          ? "You are publishing, but not enough or not everywhere. Cut each piece for Instagram, YouTube Shorts and LinkedIn instead of posting once."
          : "Cadence is healthy. The next gain comes from doubling down on the formats that already earn saves and shares.",
    },
    {
      id: "conversion",
      title: "Conversion leak",
      score: conversion,
      severity: severity(conversion),
      detail: conversion < 40
        ? "Interested viewers have nowhere obvious to go. Give every post one next step and a page built to capture the enquiry."
        : conversion < 70
          ? "Enquiries are possible but hard to trace. Route content traffic to a dedicated landing page so you can see which posts bring leads."
          : "Your capture is in place. Track which posts bring enquiries and make more of those.",
    },
  ];

  const band = score < 40 ? "Early engine" : score < 70 ? "Leaking engine" : "Ready to scale";
  const verdict = score < 40
    ? "The basics of a content engine are missing. Fixing the biggest gap first will matter more than posting more."
    : score < 70
      ? "Parts of the engine work, but attention is leaking somewhere between the first second and the enquiry."
      : "The engine is in place. The work now is scaling what already converts.";

  return { score, band, verdict, points: points.sort((a, b) => a.score - b.score) };
}

/**
 * The one entry point the UI uses.
 * TODO: Swap in an LLM call here (keep the AuditResult shape) when an API key is available.
 */
export async function analyzeContentReadiness(answers: AuditAnswers): Promise<AuditResult> {
  return scoreContentEngine(answers);
}

const ORDER: AuditQuestionId[] = ["industry", "cadence", "bottleneck", "capture"];

/** Answers ↔ a short URL-safe code, e.g. "food.weekly.views.dms", so the form can carry the diagnostic. */
export const encodeAudit = (answers: AuditAnswers) => ORDER.map(id => answers[id]).join(".");

export function decodeAudit(code: string | null | undefined): AuditAnswers | null {
  if (!code) return null;
  const parts = code.split(".");
  if (parts.length !== ORDER.length) return null;
  const answers: Record<string, string> = {};
  for (const [index, id] of ORDER.entries()) {
    const question = AUDIT_QUESTIONS.find(q => q.id === id)!;
    if (!question.options.some(option => option.id === parts[index])) return null;
    answers[id] = parts[index];
  }
  return answers as AuditAnswers;
}

export function optionLabel(id: AuditQuestionId, value: string) {
  return AUDIT_QUESTIONS.find(q => q.id === id)?.options.find(option => option.id === value)?.label ?? value;
}

/** One-line summary for the team, e.g. in the lead log or email. */
export function summarizeAudit(answers: AuditAnswers, result = scoreContentEngine(answers)) {
  const context = ORDER.map(id => optionLabel(id, answers[id])).join(" · ");
  const gaps = result.points.map(point => `${point.title}: ${point.severity}`).join(", ");
  return `Content Engine Score ${result.score}/100 (${result.band}). ${gaps}. Answers: ${context}.`;
}
