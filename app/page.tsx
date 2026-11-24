import { HomeHeader, Hero, Splash } from "@/components/HomeIntro";
import { PhoneReelStory } from "@/components/home/PhoneReelStory";
import { EcosystemSection } from "@/components/home/EcosystemSection";
import { ClientProof, ContentLine } from "@/components/home/HomeSections";
import { ServiceBillboard } from "@/components/home/ApproachSections";
import { HomeFooter } from "@/components/home/HomeFooter";
import { HomeContact } from "@/components/home/HomeContact";

export const metadata = { alternates: { canonical: "/" } };

/** Brand landing page. Every call to action scrolls to the in-page contact form (#start-project). */
export default function Home() {
  return (
    <>
      <Splash />
      <div id="site">
        <HomeHeader />
        <main id="top">
          <Hero />
          <PhoneReelStory />
          <EcosystemSection />
          <ClientProof />
          <ServiceBillboard />
          <ContentLine />
          <HomeContact />
        </main>
        <HomeFooter />
      </div>
    </>
  );
}
