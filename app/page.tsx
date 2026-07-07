import { StructuredData } from "@/components/site/structured-data";
import { SiteNav } from "@/components/site/nav";
import { Hero } from "@/components/site/hero";
import { BackedBand } from "@/components/site/backed-band";
import { ContrastBand } from "@/components/site/contrast-band";
import { Chuhaicha } from "@/components/site/chuhaicha";
import { Bridge } from "@/components/site/bridge";
import { FlowSection } from "@/components/site/flow-section";
import { Founder } from "@/components/site/founder";
import { Waitlist } from "@/components/site/waitlist";
import { SiteFooter } from "@/components/site/footer";

export default function Home() {
  return (
    <>
      <StructuredData />
      <SiteNav />
      <main>
        <Hero />
        <BackedBand />
        <ContrastBand />
        <Chuhaicha />
        <Bridge />
        <FlowSection />
        <Founder />
        <Waitlist />
      </main>
      <SiteFooter />
    </>
  );
}
