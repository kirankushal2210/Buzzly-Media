import { RecordManager } from "@/components/crm/RecordManager";

export default function Page() {
  return (
    <>
      <div className="crm-page-head">
        <h1>AI search visibility</h1>
        <p className="crm-muted">The same buyer questions asked in AI tools over time: is Buzzly mentioned, and which page is cited? Answers vary between runs, so track trends, not single results.</p>
      </div>
      <RecordManager entityKey="aiChecks" />
    </>
  );
}
