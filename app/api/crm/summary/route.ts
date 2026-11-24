import { getCrm } from "@/db/crm";
import { crmSummary } from "@/lib/crm-metrics";
import { adminJson, requireAdmin } from "@/lib/admin-session";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const crm = await getCrm();
  if (!crm) return adminJson({ error: "The CRM database isn’t connected yet." }, 503);
  return adminJson({ summary: crmSummary(await crm.listAll()) });
}
