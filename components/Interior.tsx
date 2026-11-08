import { InteriorHeader } from "@/components/InteriorHeader";
import { prototypeFooter } from "@/lib/prototype-tail";

const interiorFooter = prototypeFooter.replaceAll('href="#clients"', 'href="/clients"').replaceAll('href="#how"', 'href="/services"');

export function InteriorFooter() {
  return <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: interiorFooter }} />;
}

export function Interior({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro?: string; children: React.ReactNode }) {
  return <div className="interior">
    <InteriorHeader />
    <main id="top"><section className="interior-hero"><p className="interior-eyebrow">{eyebrow}</p><h1>{title}</h1>{intro && <p className="interior-intro">{intro}</p>}</section>{children}</main>
    <InteriorFooter />
  </div>;
}
