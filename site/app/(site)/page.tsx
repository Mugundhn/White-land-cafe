import { SiteNav } from "@/components/site/site-nav";
import { Hero } from "@/components/site/hero";
import { About } from "@/components/site/about";
import { CoffeeSection } from "@/components/site/coffee-section";
import { Kitchen } from "@/components/site/kitchen";
import { Visit } from "@/components/site/visit";
import { GoogleReviews } from "@/components/site/google-reviews";
import { Favourites } from "@/components/site/favourites";
import { ScrollProgress } from "@/components/site/scroll-progress";
import { getFavourites } from "@/lib/menu";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <SiteNav />
      <main>
        <Hero />
        <About />
        <Favourites items={getFavourites(8)} />
        <CoffeeSection />
        <Kitchen />
        <GoogleReviews />
        <Visit />
      </main>
    </>
  );
}
