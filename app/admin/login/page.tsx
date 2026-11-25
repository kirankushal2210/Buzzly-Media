import { redirect } from "next/navigation";
import Link from "@/components/Link";
import { adminConfigured } from "@/lib/admin-auth";
import { isAdmin } from "@/lib/admin-session";
import { LoginForm } from "@/components/crm/LoginForm";
import { BuzzlySignIn } from "@/components/ui/buzzly-sign-in";
import "../sign-in.css";

export const dynamic = "force-dynamic";

export default async function AdminLogin() {
  if (await isAdmin()) redirect("/admin");
  return (
    <BuzzlySignIn
      title="Buzzly CRM."
      subtitle="Leads, sales calls, clients and GTM in one place"
      footer={<>Private to the Buzzly team. <Link href="/privacy">Privacy Policy</Link></>}
    >
      {adminConfigured()
        ? <LoginForm />
        : <p className="crm-note">Admin sign-in isn’t set up yet. Add an <code>ADMIN_PASSWORD</code> of at least 12 characters in Vercel, under Settings then Environment Variables, and redeploy.</p>}
    </BuzzlySignIn>
  );
}
