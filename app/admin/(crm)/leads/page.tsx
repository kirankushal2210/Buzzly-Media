import { RecordManager } from "@/components/crm/RecordManager";

export default function Page() {
  return (
    <>
      <div className="crm-page-head">
        <h1>Leads</h1>
        <p className="crm-muted">Everyone who might become a client. Website enquiries arrive here automatically and are scored by the rules on each lead.</p>
      </div>
      <RecordManager entityKey="leads" />
    </>
  );
}
