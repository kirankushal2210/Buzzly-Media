import { HomeHeader, Hero, Splash } from "@/components/HomeIntro";
import { ExpandingScrollFilm } from "@/components/home/ExpandingScrollFilm";
import { WorkShowcaseSection } from "@/components/home/WorkShowcaseSection";
import { EcosystemSection } from "@/components/home/EcosystemSection";
import { ClientPreviewSection } from "@/components/home/ClientPreviewSection";
import { ContentLine, Manifesto, ServiceBillboard, StoryFlow } from "@/components/home/ApproachSections";
import { HomeFooter } from "@/components/home/HomeFooter";

export const metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <Splash />
      <div id="site">
        <HomeHeader />
        <main id="top">
          <Hero />
          <ExpandingScrollFilm />
          <WorkShowcaseSection />
          <EcosystemSection />
          <ClientPreviewSection />
          <ServiceBillboard />
          <Manifesto />
          <StoryFlow />
          <ContentLine />
        </main>
        <HomeFooter />
      </div>
    </>
  );
}
