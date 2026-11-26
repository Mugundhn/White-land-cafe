import Image from "next/image";
import { Instagram, MapPin, Phone, ShoppingBag } from "lucide-react";
import { CAFE, INSTAGRAM_URL, MENU_URL } from "@/lib/content";

export function Visit() {
  return (
    <section id="visit" className="scroll-mt-16 bg-plaster px-[4vw] pt-[8svh] pb-10 text-ink">
      <h2 className="font-wide text-[clamp(3rem,9vw,8.5rem)] leading-[0.86] font-black tracking-[-0.05em]">
        Find us at Centario
      </h2>

      <div className="mt-16 grid gap-12 md:grid-cols-3">
        <address className="not-italic">
          <p className="text-sm text-ink/55">Address</p>
          <p className="mt-2 text-xl leading-snug font-medium tracking-tight">
            {CAFE.address.map((line) => (
              <span key={line} className="block">{line}</span>
            ))}
          </p>
          <a
            href={CAFE.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <MapPin className="size-4" /> Get directions
          </a>
        </address>

        <div>
          <p className="text-sm text-ink/55">Hours</p>
          <dl className="mt-2 space-y-1 text-xl font-medium tracking-tight">
            {CAFE.hours.map((h) => (
              <div key={h.days} className="flex flex-wrap gap-x-3">
                <dt>{h.days}</dt>
                <dd className="text-ink/60">{h.time}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-sm text-ink/55">Holiday hours go up on Instagram first.</p>
        </div>

        <div>
          <p className="text-sm text-ink/55">Say hello</p>
          <ul className="mt-2 space-y-3 text-xl font-medium tracking-tight">
            <li>
              <a href={CAFE.phoneHref} className="inline-flex items-center gap-2 underline-offset-4 hover:underline">
                <Phone className="size-4" /> {CAFE.phone}
              </a>
            </li>
            <li>
              <a href={MENU_URL} className="inline-flex items-center gap-2 underline-offset-4 hover:underline">
                <ShoppingBag className="size-4" /> Order delivery or takeaway
              </a>
            </li>
            <li>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 underline-offset-4 hover:underline">
                <Instagram className="size-4" /> @white_land_
              </a>
            </li>
          </ul>
        </div>
      </div>

      <footer className="mt-[7svh] flex flex-wrap justify-between gap-4 border-t border-concrete/50 pt-6 text-sm text-ink/55">
        <span className="flex items-center gap-4">
          <Image src="/logo-dark.png" alt="White Land" width={530} height={900} className="h-14 w-auto" />
          <span>&copy; {new Date().getFullYear()} White Land</span>
        </span>
        <span>Pantai Hillpark, Kuala Lumpur</span>
      </footer>
    </section>
  );
}
