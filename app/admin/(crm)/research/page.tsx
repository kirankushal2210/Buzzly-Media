import { RecordManager } from "@/components/crm/RecordManager";

export default function Page() {
  return (
    <>
      <div className="crm-page-head">
        <h1>Research & experiments</h1>
        <p className="crm-muted">Ads worth learning from (to inspire original ideas, never to copy) and landing-page tests with one change at a time.</p>
      </div>
      <RecordManager entityKey="adResearch" />
      <RecordManager entityKey="experiments" />
    </>
  );
}
