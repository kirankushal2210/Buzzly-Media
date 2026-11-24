import { RecordManager } from "@/components/crm/RecordManager";

export default function Page() {
  return (
    <>
      <div className="crm-page-head">
        <h1>Sales & calls</h1>
        <p className="crm-muted">Deals moving through the pipeline, and every sales call booked or held</p>
      </div>
      <RecordManager entityKey="deals" board />
      <RecordManager entityKey="calls" />
    </>
  );
}
