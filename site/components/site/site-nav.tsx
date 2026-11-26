"use client";

import * as React from "react";
import Image from "next/image";
import { Instagram } from "lucide-react";
import { INSTAGRAM_URL, MENU_URL } from "@/lib/content";

const links = [
  { href: "#favourites", label: "Favourites" },
  { href: "#coffee", label: "Coffee" },
  { href: "#kitchen", label: "Kitchen" },
  { href: "#visit", label: "Visit" },
];

/** Difference blending keeps the bar legible over white walls and photos alike. */
export function SiteNav() {
  const [solid, setSolid] = React.useState(false);
  React.useEffect(() => {
    const on = () => setSolid(window.scrollY > 60);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={"fixed inset-x-0 top-0 z-50 transition-colors duration-300 " + (solid ? "bg-paper/90 text-ink shadow-[0_1px_0_rgba(0,0,0,.08)] backdrop-blur-md" : "text-white mix-blend-difference")}>
      <nav className={"flex items-center justify-between px-[4vw] transition-[padding] duration-300 " + (solid ? "py-2.5" : "py-5")} aria-label="Main">
        <a href="#top" aria-label="White Land, back to top" className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          <Image src={solid ? "/logo-dark.png" : "/logo-white.png"} alt="White Land" width={530} height={900} priority className={"w-auto transition-[height] duration-300 " + (solid ? "h-9" : "h-11")} />
        </a>
        <div className="flex items-center gap-6 text-sm">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hidden underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:inline"
            >
              {l.label}
            </a>
          ))}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="White Land on Instagram"
            className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <Instagram className="size-5" strokeWidth={1.6} />
          </a>
          <a
            href={MENU_URL}
            className={"rounded-full px-4 py-2 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white " + (solid ? "bg-ink text-paper" : "bg-white text-black")}
          >
            Order online
          </a>
        </div>
      </nav>
    </header>
  );
}
