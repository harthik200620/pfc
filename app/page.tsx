import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Ticker } from "@/components/Ticker";
import { TreatBand } from "@/components/TreatBand";
import { MenuSection } from "@/components/menu/MenuSection";
import { Spotlight } from "@/components/Spotlight";
import { DeliveryRing } from "@/components/DeliveryRing";
import { Reserve } from "@/components/Reserve";
import { Reviews } from "@/components/Reviews";
import { Gallery } from "@/components/Gallery";
import { Visit } from "@/components/Visit";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Ticker />
        <TreatBand />
        <MenuSection />
        <Spotlight />
        <DeliveryRing />
        <Reserve />
        <Reviews />
        <Gallery />
        <Visit />
      </main>
      <Footer />
    </>
  );
}
