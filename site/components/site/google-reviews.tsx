import { GOOGLE, REVIEWS } from "@/lib/content";
import { Reveal } from "./reveal";

function Stars({ value, className = "size-4" }: { value: number; className?: string }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <svg key={i} viewBox="0 0 20 20" className={className} aria-hidden>
            <defs>
              <linearGradient id={`g${value}-${i}`}>
                <stop offset={`${fill * 100}%`} stopColor="#22211e" />
                <stop offset={`${fill * 100}%`} stopColor="#cfcdc6" />
              </linearGradient>
            </defs>
            <path fill={`url(#g${value}-${i})`} d="M10 1.5l2.6 5.5 6 .8-4.4 4.1 1.1 5.9L10 14.9 4.7 17.8l1.1-5.9L1.4 7.8l6-.8L10 1.5z" />
          </svg>
        );
      })}
    </span>
  );
}

/** Google rating from the public listing, plus any hand-picked reviews added in lib/content.ts. */
export function GoogleReviews() {
  return (
    <section id="reviews" className="scroll-mt-16 bg-plaster px-[4vw] py-[8svh] text-ink">
      <div className="grid gap-10 md:grid-cols-12 md:items-end">
        <Reveal className="md:col-span-7">
          <h2 className="font-wide text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.9] font-bold tracking-[-0.04em]">What people say</h2>
        </Reveal>
        <Reveal className="md:col-span-5 md:justify-self-end" delay={0.1}>
          <a
            href={GOOGLE.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-5 rounded-[28px] bg-paper px-6 py-5 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <span className="font-wide text-6xl leading-none font-black tracking-[-0.05em]">{GOOGLE.rating.toFixed(1)}</span>
            <span>
              <Stars value={GOOGLE.rating} className="size-5" />
              <span className="mt-1 block text-sm text-ink/65">{GOOGLE.count} reviews on Google</span>
              <span className="mt-1 block text-sm font-medium underline-offset-4 group-hover:underline">Read them on Google &rarr;</span>
            </span>
          </a>
        </Reveal>
      </div>

      {REVIEWS.length > 0 && (
        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <li key={r.name + i}>
              <Reveal delay={i * 0.08} className="h-full">
                <figure className="flex h-full flex-col justify-between rounded-[24px] bg-paper p-6">
                  <div>
                    <Stars value={r.rating} />
                    <blockquote className="mt-4 text-lg leading-snug tracking-tight">&ldquo;{r.text}&rdquo;</blockquote>
                  </div>
                  <figcaption className="mt-6 text-sm text-ink/60">
                    {r.name}
                    {r.when ? ` · ${r.when}` : ""} · Google review
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-8 text-xs text-ink/45">Rating from Google Maps, checked {GOOGLE.checked}.</p>
    </section>
  );
}
