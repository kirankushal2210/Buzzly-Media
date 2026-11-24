import { PerformanceHub } from "@/components/crm/PerformanceHub";

export default function Page() {
  return (
    <>
      <div className="crm-page-head">
        <h1>Performance marketing</h1>
        <p className="crm-muted">Paid campaigns for Buzzly and its clients, by channel. Pick a channel to see and add its campaigns.</p>
      </div>
      <PerformanceHub />
    </>
  );
}
