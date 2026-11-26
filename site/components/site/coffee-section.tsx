import { CoffeePourMenu } from "@/components/ui/coffee-pour-menu";
import { DRINKS, MENU_URL } from "@/lib/content";

/** The one warm room on the page: the counter, where the pour menu lives. */
export function CoffeeSection() {
  return (
    <section id="coffee" className="scroll-mt-16 bg-[#e4cdb0] px-[4vw] py-[8svh] text-[#3a271d]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 grid gap-4 md:grid-cols-2 md:items-end">
          <h2 className="font-wide text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.9] font-bold tracking-[-0.04em]">
            At the counter
          </h2>
          <p className="max-w-[40ch] text-base leading-relaxed text-[#3a271d]/75 md:justify-self-end">
            Hover or tap a drink to see how it is built, shot by shot. The full list,
            including iced and non-coffee drinks, is on our{" "}
            <a href={MENU_URL} className="font-medium text-[#3a271d] underline underline-offset-4">
              online menu
            </a>
            .
          </p>
        </div>
        <CoffeePourMenu items={DRINKS} defaultValue="flat-white" />
      </div>
    </section>
  );
}
