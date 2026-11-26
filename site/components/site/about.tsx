import Image from "next/image";
import { IMAGES } from "@/lib/content";
import { ScrollLitText } from "./scroll-lit-text";
import { Parallax } from "./parallax";
import { Reveal } from "./reveal";

export function About() {
  return (
    <section className="bg-paper px-[4vw] py-[9svh]">
      <ScrollLitText
        className="max-w-[22ch] text-[clamp(2rem,5.2vw,4.75rem)] leading-[1.04] font-medium tracking-[-0.03em] text-ink"
        text="Up the stairs in an apartment block, two floors of white walls, light wood and bare concrete. A few bright prints overhead. Plenty in the cup."
      />
      <div className="mt-[6svh] grid gap-6 md:grid-cols-12">
        <Parallax className="aspect-[4/5] md:col-span-5 md:col-start-7">
          <Image src={IMAGES.room.src} alt={IMAGES.room.alt} fill sizes="(min-width: 768px) 40vw, 92vw" className="object-cover" />
        </Parallax>
        <Reveal className="self-end md:col-span-4 md:col-start-1 md:row-start-1">
        <p className="max-w-[38ch] text-base leading-relaxed text-ink/70">
          White Land keeps the room quiet so the light can do the work. Come for a slow
          morning, stay for lunch, and take a seat upstairs if you want the window.
        </p>
        </Reveal>
      </div>
    </section>
  );
}
