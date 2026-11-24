"use client";

import { useEffect, useState } from "react";
import { Badge, Button, SurfaceCard } from "@/components/ui/core";
import { AUDIT_QUESTIONS, analyzeContentReadiness, encodeAudit, type AuditAnswers, type AuditQuestionId, type AuditResult } from "@/lib/audit-engine";

type Partial4 = Partial<Record<AuditQuestionId, string>>;
const isComplete = (answers: Partial4): answers is AuditAnswers => AUDIT_QUESTIONS.every(question => answers[question.id]);

const severityTone = { High: "solid", Medium: "accent", Low: "neutral" } as const;

/**
 * Four-question content & funnel readiness scorer. Scoring lives in
 * lib/audit-engine.ts; this component only renders what it returns.
 */
export function ContentReadinessAudit() {
  const [answers, setAnswers] = useState<Partial4>({});
  const [result, setResult] = useState<{ code: string; value: AuditResult } | null>(null);
  const complete = isComplete(answers);
  const code = complete ? encodeAudit(answers) : null;

  useEffect(() => {
    if (!complete || !code) return;
    let current = true;
    analyzeContentReadiness(answers).then(value => { if (current) setResult({ code, value }); });
    return () => { current = false; };
  }, [complete, code, answers]);

  const shown = result && result.code === code ? result.value : null;
  const answered = AUDIT_QUESTIONS.filter(question => answers[question.id]).length;

  return (
    <section className="readiness" id="readiness-audit" aria-labelledby="readiness-title">
      <div className="readiness-head">
        <p className="interior-eyebrow">CONTENT ENGINE SCORE</p>
        <h2 id="readiness-title">How ready is your<br /><em>content engine?</em></h2>
        <p>Four questions, about a minute. You get a score out of 100 and the three gaps holding your content back.</p>
      </div>
      <div className="readiness-body">
        <SurfaceCard className="readiness-form">
          {AUDIT_QUESTIONS.map((question, index) => (
            <fieldset key={question.id} className="readiness-q">
              <legend><span className="bz-mono">0{index + 1}</span> {question.label}</legend>
              <div className="bz-chips">
                {question.options.map(option => (
                  <label className="bz-chip" key={option.id}>
                    <input
                      type="radio"
                      name={`audit-${question.id}`}
                      value={option.id}
                      checked={answers[question.id] === option.id}
                      onChange={() => setAnswers(current => ({ ...current, [question.id]: option.id }))}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </SurfaceCard>

        <SurfaceCard className="readiness-result" aria-live="polite">
          {shown ? (
            <>
              <div className="readiness-score">
                <strong>{shown.score}<small>/100</small></strong>
                <div>
                  <Badge tone="accent">{shown.band}</Badge>
                  <p>{shown.verdict}</p>
                </div>
              </div>
              <div className="readiness-meter" aria-hidden="true"><span style={{ width: `${shown.score}%` }} /></div>
              <ol className="readiness-points">
                {shown.points.map(point => (
                  <li key={point.id}>
                    <div><h3>{point.title}</h3><Badge tone={severityTone[point.severity]}>{point.severity} priority</Badge></div>
                    <p>{point.detail}</p>
                  </li>
                ))}
              </ol>
              <Button href={`/contact?audit=${code}#lead-form`} size="lg" className="readiness-cta">Send This Diagnostic With My Inquiry →</Button>
            </>
          ) : (
            <div className="readiness-empty">
              <span className="bz-mono">{answered} of {AUDIT_QUESTIONS.length} answered</span>
              <p>Your score and diagnostic appear here as soon as all four questions are answered.</p>
            </div>
          )}
        </SurfaceCard>
      </div>
    </section>
  );
}
