"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "What is the difference between Buzzly’s own companies and partner work?",
    answer:
      "Buzzly is a technology-led company builder. We build our own businesses—like De Food Kampney, Buzzly Health, and Buzzly Properties—while partnering with ambitious outside brands to provide strategic direction, content production, and audience distribution.",
  },
  {
    question: "What kind of content does Buzzly produce?",
    answer:
      "We produce cinematic campaign films, short-form vertical reels, high-craft brand photography, and narrative copy. Every piece of content is engineered for organic social discoverability, audience connection, and brand recall.",
  },
  {
    question: "How does your distribution model work?",
    answer:
      "Great content needs distribution to travel. We optimize publishing cadence, channel management, search-aware copywriting, and targeted amplification campaigns so your message consistently reaches the people it is made for.",
  },
  {
    question: "How do we start a project conversation?",
    answer:
      "Share your brand, goals, and audience in our inquiry form. We review every brief within two working days and schedule an introductory conversation to explore whether we’re the right creative partner for your goals.",
  },
];

export function FaqSection({ title = "Frequently Asked Questions" }: { title?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section" aria-label="Frequently Asked Questions">
      <div className="faq-header">
        <span className="interior-eyebrow">COMMON QUESTIONS</span>
        <h2>{title}</h2>
      </div>
      <div className="faq-list">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div className={`faq-item ${isOpen ? "is-open" : ""}`} key={index}>
              <button
                type="button"
                className="faq-question"
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
              >
                <span>{faq.question}</span>
                <span className="faq-icon" aria-hidden="true">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

