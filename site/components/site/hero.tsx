"use client";

import * as React from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { IMAGES, MENU_URL } from "@/lib/content";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * The signature scroll moment: "white" and "land" part like two walls while
 * a small window onto the room widens until you are standing inside it.
 */
export function Hero() {
  const ref = React.useRef<HTMLElement>(null);
  const reduce = useReducedMotion() ?? false;

  // 1 on tablet/desktop, 0 on phones: the starting window is shaped per screen.
  const wide = useMotionValue(1);
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => wide.set(mq.matches ? 1 : 0);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [wide]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const clipPath = useTransform([scrollYProgress, wide], ([p, w]: number[]) => {
    const t = easeOut(clamp01(p / 0.72));
    const v = (w ? 24 : 30) * (1 - t);
    const h = (w ? 31 : 9) * (1 - t);
    const r = 28 * (1 - t);
    return `inset(${v}% ${h}% ${v}% ${h}% round ${r}px)`;
  });
  const imageScale = useTransform(scrollYProgress, [0, 0.72], [1.22, 1]);
  const whiteX = useTransform(scrollYProgress, [0, 0.6], ["0vw", "-18vw"]);
  const whiteY = useTransform(scrollYProgress, [0, 0.6], ["0%", "-130%"]);
  const landX = useTransform(scrollYProgress, [0, 0.6], ["0vw", "18vw"]);
  const landY = useTransform(scrollYProgress, [0, 0.6], ["0%", "130%"]);
  const captionOpacity = useTransform(scrollYProgress, [0.66, 0.88], [0, 1]);
  const captionY = useTransform(scrollYProgress, [0.66, 0.88], [24, 0]);

  return (
    <section ref={ref} id="top" className={reduce ? "relative h-svh" : "relative h-[240vh]"}>
      <div className="sticky top-0 h-svh overflow-hidden bg-paper">
        <motion.div className="absolute inset-0 overflow-hidden" style={reduce ? undefined : { clipPath }}>
          <motion.div className="absolute inset-0" style={reduce ? undefined : { scale: imageScale }}>
            <Image
              src={IMAGES.hero.src}
              alt={IMAGES.hero.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover object-[50%_45%]"
            />
          </motion.div>
          <motion.div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink/75 via-ink/20 to-transparent"
            style={reduce ? undefined : { opacity: captionOpacity }}
          />
        </motion.div>

        <h1
          aria-label="White Land"
          className="pointer-events-none absolute inset-0 flex flex-col justify-between px-[4vw] pt-[11svh] pb-[5svh] font-wide text-[clamp(4.25rem,19vw,17rem)] leading-[0.8] font-black tracking-[-0.05em] text-white mix-blend-difference"
        >
          <motion.span aria-hidden className="block" style={reduce ? undefined : { x: whiteX, y: whiteY }}>
            white
          </motion.span>
          <motion.span aria-hidden className="block self-end" style={reduce ? undefined : { x: landX, y: landY }}>
            land
          </motion.span>
        </h1>

        <motion.div
          className="absolute bottom-[6svh] left-[4vw] max-w-md text-white"
          style={reduce ? undefined : { opacity: captionOpacity, y: captionY }}
        >
          <p className="text-[clamp(1.25rem,2.4vw,1.75rem)] leading-snug font-medium tracking-tight">
            A two-storey loft café at Centario, Pantai Hillpark.
          </p>
          <p className="mt-2 text-sm text-white/75">Coffee, bagels and pressed sandwiches. Kuala Lumpur.</p>
          <a
            href={MENU_URL}
            className="mt-5 inline-flex rounded-full bg-paper px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Order delivery or takeaway
          </a>
        </motion.div>
      </div>
    </section>
  );
}
