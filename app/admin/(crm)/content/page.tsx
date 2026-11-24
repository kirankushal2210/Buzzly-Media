import { ContentPlanner } from "@/components/crm/ContentPlanner";

export default function Page() {
  return (
    <>
      <div className="crm-page-head">
        <h1>Content planner</h1>
        <p className="crm-muted">What each client was promised, what is posted, and what to do today</p>
      </div>
      <ContentPlanner />
    </>
  );
}
