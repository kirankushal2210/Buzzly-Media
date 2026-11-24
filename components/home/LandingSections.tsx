import { Reveal } from "@/components/Reveal";

/**
 * Landing-page sections that complete the structure:
 * hero → proof → PROBLEM → solution → HOW IT WORKS → FAQ → final CTA.
 * Copy makes no numeric claims; nothing here is a client result.
 */

const pains = [
  { title: "You post, and nothing happens.", copy: "Content goes out every week, but the views, messages and enquiries don’t follow." },
  { title: "Nobody can see what makes you good.", copy: "Your food, care or homes are better than the feed suggests, and customers can’t tell." },
  { title: "Three vendors, no single story.", copy: "A production house, a social agency and a web developer, each pulling in a different direction." },
  { title: "Ad money with nothing behind it.", copy: "Paid reach pushed onto posts nobody chose to watch, then switched off when the budget runs out." },
];

export function ProblemSection() {
  return (
    <Reveal className="landing-problem wrap" id="problem" aria-labelledby="problem-title">
      <div className="landing-head">
        <p className="eyebrow">BUZZLY / SOUND FAMILIAR?</p>
        <h2 id="problem-title">You’re showing up.<br /><em>Nobody’s noticing.</em></h2>
      </div>
      <ul className="landing-pains">
        {pains.map(pain => (
          <li key={pain.title}>
            <h3>{pain.title}</h3>
            <p>{pain.copy}</p>
          </li>
        ))}
      </ul>
      <p className="landing-cost">
        <span className="eyebrow">THE REAL COST</span>
        Every month like this costs you twice: the time and money spent making content, and the customers who chose a competitor they could actually see.
      </p>
    </Reveal>
  );
}

const steps = [
  { title: "Tell us where you are.", copy: "Send one message through the form below. A person reads it and replies, no sales script." },
  { title: "Agree the plan.", copy: "We map the story, the platforms and the publishing rhythm, and agree the scope with you before anything is booked." },
  { title: "We make it. You approve it.", copy: "We shoot on location at your business. You approve every script before shoot day and every edit before it goes out." },
  { title: "Publish, learn, repeat.", copy: "We publish, watch what people actually save and share, and let that shape the next round." },
];

export function HowItWorks() {
  return (
    <Reveal className="landing-steps wrap" id="how-it-works" aria-labelledby="steps-title">
      <div className="landing-head">
        <p className="eyebrow">BUZZLY / HOW IT WORKS</p>
        <h2 id="steps-title">Four steps.<br /><em>That’s it.</em></h2>
      </div>
      <ol className="landing-step-list">
        {steps.map((step, index) => (
          <li key={step.title}>
            <span className="landing-step-no">0{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.copy}</p>
          </li>
        ))}
      </ol>
      <a className="cta" href="#start-project">Start with Step 01 ↗</a>
    </Reveal>
  );
}

const faqs = [
  { question: "How quickly will I hear back?", answer: "We reply personally to every inquiry that comes through the form." },
  { question: "Do I need a studio or my own team?", answer: "No. We are based in Hyderabad and usually shoot on location at your business: the kitchen, clinic, site or office your customers already know. Shoots in other cities are planned as part of your scope." },
  { question: "Who approves the content?", answer: "You do. You approve every script before shoot day and every edit before it is published, with one point of contact for feedback." },
  { question: "What does it cost?", answer: "It depends on how much content, which platforms and whether shoots are included. We agree a written scope and price with you before any work starts." },
  { question: "Do you run paid ads?", answer: "Only where it helps. We put paid support behind content people have already shown they want to watch, rather than buying reach for posts nobody chose." },
];

export function LandingFaq() {
  return (
    <Reveal className="leadfaq landing-faq" id="faq" aria-labelledby="landing-faq-title">
      <div className="leadfaq-head">
        <p className="eyebrow">BUZZLY / QUESTIONS</p>
        <h2 id="landing-faq-title">Straight answers.</h2>
      </div>
      <div className="leadfaq-list">
        {faqs.map((item, index) => (
          <details key={item.question} className="leadfaq-item" open={index === 0}>
            <summary><span>{item.question}</span><span className="leadfaq-icon" aria-hidden="true" /></summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </Reveal>
  );
}
