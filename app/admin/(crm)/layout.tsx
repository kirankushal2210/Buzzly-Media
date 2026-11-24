import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-session";
import { AdminShell } from "@/components/crm/AdminShell";
import "../shell.css";

export const dynamic = "force-dynamic";

/** Every CRM page requires a valid admin session; the API checks it again on each request. */
export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  return <AdminShell>{children}</AdminShell>;
}
