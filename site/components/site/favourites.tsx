"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { MENU_URL } from "@/lib/content";
import type { Favourite } from "@/lib/menu";

/**
 * Scroll down and the cards travel sideways: the section stays pinned while a
 * long row of favourites slides past, with a progress line underneath.
 */
export function Favourites({ items }: { items: Favourite[] }) {
  const ref = React.useRef<HTMLElement>(null);
  const track = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const [dist, setDist] = React.useState(0);

  React.useEffect(() => {
    const measure = () => {
      if (track.current) setDist(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    const t = window.setTimeout(measure, 600); // after images settle
    return () => {
      window.removeEventListener("resize", measure);
      window.clearTimeout(t);
    };
  }, [items.length]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0.05, 0.95], [0, -dist]);
  const bar = useTransform(scrollYProgress, [0.05, 0.95], [0, 1]);

  const cards = (
    <>
      {items.map((p, i) => (
        <a key={p.id} href={MENU_URL} className="group relative block w-[min(72vw,calc((100svh_-_300px)_*_0.8))] shrink-0 sm:w-[min(38vw,calc((100svh_-_300px)_*_0.8))] lg:w-[min(26vw,calc((100svh_-_300px)_*_0.8))] xl:w-[min(22vw,calc((100svh_-_300px)_*_0.8))]">
          <div className="relative aspect-[4/5] overflow-hidden bg-plaster">
            <Image
              src={p.img}
              alt={p.title}
              fill
              sizes="(min-width:1024px) 26vw, (min-width:640px) 38vw, 72vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <span className="absolute top-3 left-3 rounded-full bg-paper/90 px-3 py-1 text-[11px] font-medium tracking-wide text-ink">{p.category}</span>
          </div>
          <div className="mt-4 flex items-baseline justify-between gap-4">
            <h3 className="text-lg leading-tight font-medium tracking-tight text-ink uppercase">{p.title}</h3>
            <span className="shrink-0 text-base text-ink/60">RM {p.price.toFixed(0)}</span>
          </div>
          <span className="text-xs text-ink/40">0{i + 1}</span>
        </a>
      ))}
      <a href={MENU_URL} className="flex w-[72vw] shrink-0 flex-col justify-between rounded-[28px] bg-ink p-8 text-paper sm:w-[30vw] lg:w-[22vw]">
        <span className="font-wide text-[clamp(1.75rem,3.2vw,3rem)] leading-[0.95] font-bold tracking-[-0.03em]">See the whole menu</span>
        <span className="mt-10 inline-flex w-fit items-center gap-2 rounded-full bg-paper px-5 py-3 text-sm font-medium text-ink">Order online &rarr;</span>
      </a>
    </>
  );

  if (reduce) {
    return (
      <section id="favourites" className="scroll-mt-16 bg-paper py-[7svh]">
        <h2 className="mb-10 px-[4vw] font-wide text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.9] font-bold tracking-[-0.04em] text-ink">Favourites</h2>
        <div className="flex gap-[3vw] overflow-x-auto px-[4vw] pb-6">{cards}</div>
      </section>
    );
  }

  return (
    <section ref={ref} id="favourites" className="relative bg-paper" style={{ height: `${Math.max(220, 120 + items.length * 26)}vh` }}>
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <div className="mb-8 flex items-end justify-between gap-6 px-[4vw]">
          <h2 className="font-wide text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.9] font-bold tracking-[-0.04em] text-ink">Favourites</h2>
          <p className="hidden max-w-[34ch] text-base leading-relaxed text-ink/60 md:block">What our regulars order most. Keep scrolling, then tap one to start your order.</p>
        </div>
        <motion.div ref={track} style={{ x }} className="flex w-max gap-[3vw] px-[4vw] will-change-transform">
          {cards}
        </motion.div>
        <div className="mx-[4vw] mt-8 h-px bg-concrete/40" aria-hidden>
          <motion.div className="h-full origin-left bg-ink" style={{ scaleX: bar }} />
        </div>
      </div>
    </section>
  );
}
