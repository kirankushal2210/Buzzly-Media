import { CallCopilot } from "@/components/crm/CallCopilot";
import { RecordManager } from "@/components/crm/RecordManager";

export default function Page() {
  return (
    <>
      <div className="crm-page-head">
        <h1>Cold calling</h1>
        <p className="crm-muted">Find businesses whose brand isn’t showing up yet, prepare a free brand preview from their public information, then call with something useful in hand. The copilot writes the script and logs every outcome</p>
      </div>
      <CallCopilot />
      <RecordManager entityKey="prospects" />
    </>
  );
}
