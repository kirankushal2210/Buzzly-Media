import { RecordManager } from "@/components/crm/RecordManager";

export default function Page() {
  return (
    <>
      <div className="crm-page-head">
        <h1>SEO</h1>
        <p className="crm-muted">The keywords Buzzly and its clients want to be found for, the page meant to rank for each, and where it sits on Google at each check.</p>
      </div>
      <RecordManager entityKey="seoKeywords" />
    </>
  );
}
