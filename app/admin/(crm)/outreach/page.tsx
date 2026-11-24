import { RecordManager } from "@/components/crm/RecordManager";

export default function Page() {
  return (
    <>
      <div className="crm-page-head">
        <h1>Outreach</h1>
        <p className="crm-muted">Buzzly’s own client-acquisition campaigns, and the creators you might work with. Drafts only: people send every message themselves.</p>
      </div>
      <RecordManager entityKey="outreach" />
      <RecordManager entityKey="creators" />
    </>
  );
}
