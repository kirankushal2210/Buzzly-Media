import { RecordManager } from "@/components/crm/RecordManager";

export default function Page() {
  return (
    <>
      <div className="crm-page-head">
        <h1>Clients</h1>
        <p className="crm-muted">Signed clients, their package, retainer and renewal dates</p>
      </div>
      <RecordManager entityKey="clients" />
    </>
  );
}
