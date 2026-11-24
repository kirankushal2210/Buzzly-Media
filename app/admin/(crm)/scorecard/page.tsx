import { Scorecard } from "@/components/crm/Scorecard";
import { RecordManager } from "@/components/crm/RecordManager";

export default function Page() {
  return (
    <>
      <div className="crm-page-head">
        <h1>Weekly scorecard</h1>
        <p className="crm-muted">Leads, qualification, calls, wins and ad spend, week by week. Add each week’s ad spend and your notes below.</p>
      </div>
      <Scorecard />
      <RecordManager entityKey="weekly" />
    </>
  );
}
