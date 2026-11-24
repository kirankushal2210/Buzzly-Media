import { Dashboard } from "@/components/crm/Dashboard";

export default function Page() {
  return (
    <>
      <div className="crm-page-head">
        <h1>Dashboard</h1>
        <p className="crm-muted">Every figure is calculated from the records in this CRM</p>
      </div>
      <Dashboard />
    </>
  );
}
