import { leadFaqs } from "@/lib/engagements";
import { JsonLd } from "@/components/JsonLd";
import { faqPage } from "@/lib/structured-data";

/** Server-rendered FAQ: native <details>, so every answer is in the initial HTML and works without JavaScript. */
export function LeadFaq() {
  return (
    <section className="leadfaq" aria-labelledby="leadfaq-title">
      <JsonLd data={faqPage("/contact", leadFaqs)} />
      <div className="leadfaq-head">
        <p className="interior-eyebrow">BEFORE YOU SEND IT</p>
        <h2 id="leadfaq-title">Straight answers.</h2>
      </div>
      <div className="leadfaq-list">
        {leadFaqs.map((item, index) => (
          <details key={item.question} className="leadfaq-item" open={index === 0}>
            <summary><span>{item.question}</span><span className="leadfaq-icon" aria-hidden="true" /></summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
