import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Buzzly CRM",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="crm">{children}</div>;
}
