import { HomeHeader, Hero, Splash } from "@/components/HomeIntro";
import { PhoneReelStory } from "@/components/home/PhoneReelStory";
import { EcosystemSection } from "@/components/home/EcosystemSection";
import { ClientProof, ContentLine } from "@/components/home/HomeSections";
import { ServiceBillboard } from "@/components/home/ApproachSections";
import { HomeFooter } from "@/components/home/HomeFooter";
import { HomeContact } from "@/components/home/HomeContact";
import { HowItWorks, LandingFaq, ProblemSection } from "@/components/home/LandingSections";

export const metadata = {
  alternates: { canonical: "/" },
  title: { absolute: "Social Media & Content Agency in Hyderabad | Buzzly" },
  description: "Buzzly is a Hyderabad content studio: brand strategy, short-form video, social media and distribution under one roof, for our own ventures and ambitious brands.",
};

/**
 * Brand landing page, in conversion order: hero (result without the fear) →
 * visuals and client results → problem → solution and features → how it works
 * → FAQ → final call to action. Every CTA scrolls to the in-page form (#start-project).
 */
export default function Home() {
  return (
    <>
      <Splash />
      <div id="site">
        <HomeHeader />
        <main id="top">
          <Hero />
          <PhoneReelStory />
          <ClientProof />
          <ProblemSection />
          <ServiceBillboard />
          <ContentLine />
          <EcosystemSection />
          <HowItWorks />
          <LandingFaq />
          <HomeContact
            title={<>Still on<br /><em>the fence?</em></>}
            copy="One message, no commitment. Tell us where your brand is now and where you want it to be, and a person from our team will reply."
          />
        </main>
        <HomeFooter />
      </div>
    </>
  );
}
