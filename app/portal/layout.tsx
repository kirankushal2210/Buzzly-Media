import type { Metadata } from "next";
import "./portal.css";

/**
 * Wrapper for everything under /portal, including the login page. The signed-in
 * workspace shell and its session check live in app/portal/(workspace)/layout.tsx,
 * so /portal/login is never wrapped in the authenticated shell.
 */
export const metadata: Metadata = {
  title: { default: "Client Portal", template: "%s · Client Portal | Buzzly" },
  robots: { index: false, follow: false },
};

export default function PortalRoot({ children }: { children: React.ReactNode }) {
  return <div className="portal">{children}</div>;
}
