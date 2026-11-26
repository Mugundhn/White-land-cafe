import Image from "next/image";
import { IMAGES, MENU_URL } from "@/lib/content";
import { Parallax } from "./parallax";
import { Reveal } from "./reveal";

const dishes = [
  { name: "Smoked salmon bagel", note: "Cream cheese, capers, red onion, dill." },
  { name: "Cubano sandwich", note: "Roast pork, ham, Swiss, pickles, mustard, pressed hot." },
];

export function Kitchen() {
  return (
    <section id="kitchen" className="scroll-mt-16 bg-paper px-[4vw] py-[8svh]">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <h2 className="font-wide text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.9] font-bold tracking-[-0.04em] text-ink">
            From the kitchen
          </h2>
          <dl className="mt-12 divide-y divide-concrete/40 border-y border-concrete/40">
            {dishes.map((d) => (
              <div key={d.name} className="py-6">
                <dt className="text-2xl font-medium tracking-tight text-ink">{d.name}</dt>
                <dd className="mt-1 text-base text-ink/65">{d.note}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 max-w-[36ch] text-sm leading-relaxed text-ink/60">
            The rest of the menu changes with the season. See what&rsquo;s on today and order it to your door.
          </p>
          <a
            href={MENU_URL}
            className="mt-5 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            See the full menu and order
          </a>
        </div>
        <div className="relative grid grid-cols-5 gap-4 md:col-span-6 md:col-start-7">
          <Parallax className="col-span-5 aspect-[4/3]">
            <Image src={IMAGES.sandwich.src} alt={IMAGES.sandwich.alt} fill sizes="(min-width: 768px) 48vw, 92vw" className="object-cover" />
          </Parallax>
          <Reveal className="relative col-span-3 col-start-3 aspect-square" delay={0.15}>
            <Image src={IMAGES.coffee.src} alt={IMAGES.coffee.alt} fill sizes="(min-width: 768px) 28vw, 55vw" className="object-cover" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
