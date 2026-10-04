import { StructuredData } from "@/components/site/structured-data";
import { SiteNav } from "@/components/site/nav";
import { Hero } from "@/components/site/hero";
import { BackedBand } from "@/components/site/backed-band";
import { UnderstandSection } from "@/components/site/understand-section";
import { ExploreSection } from "@/components/site/explore-section";
import { AccountSection } from "@/components/site/account-section";
import { SourceSection } from "@/components/site/source-section";
import { CrmSection } from "@/components/site/crm-section";
import { WhySection } from "@/components/site/why-section";
import { Chuhaicha } from "@/components/site/chuhaicha";
import { Founder } from "@/components/site/founder";
import { Waitlist } from "@/components/site/waitlist";
import { SiteFooter } from "@/components/site/footer";
import { LandingProvider } from "@/components/site/landing-context";

export default function Home() {
  return (
    <>
      <StructuredData />
      <SiteNav />
      <LandingProvider>
        <main>
          <Hero />
          <BackedBand />
          <UnderstandSection />
          <ExploreSection />
          <AccountSection />
          <SourceSection />
          <CrmSection />
          <WhySection />
          <Chuhaicha />
          <Founder />
          <Waitlist />
        </main>
      </LandingProvider>
      <SiteFooter />
    </>
  );
}
