import { InteriorHeader } from "@/components/InteriorHeader";
import { HomeFooter } from "@/components/home/HomeFooter";

export function InteriorFooter() {
  return <HomeFooter variant="interior" />;
}

export function Interior({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro?: string; children: React.ReactNode }) {
  return <div className="interior">
    <InteriorHeader />
    <main id="top"><section className="interior-hero"><p className="interior-eyebrow">{eyebrow}</p><h1>{title}</h1>{intro && <p className="interior-intro">{intro}</p>}</section>{children}</main>
    <InteriorFooter />
  </div>;
}
