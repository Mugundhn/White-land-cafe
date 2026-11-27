import { Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUpRight, Camera as Instagram, Coffee, MapPin, Menu, Phone, ShoppingBag, Star, X } from 'lucide-react'
import { CAFE, DRINKS, GOOGLE, IMAGES, INSTAGRAM_URL, ORDER_URL } from '@/lib/content'
import type { Favourite } from '@/lib/menu'
import { CoffeePourMenu } from './coffee-pour-menu'
import { Parallax, Reveal, ScrollLitText, clamp01, useScrollEffect } from './scroll'

export function Wordmark({ className = '' }: { className?: string }) { return <img className={`wordmark ${className}`} src={IMAGES.logo.src} alt={IMAGES.logo.alt} /> }
const navigation = [
  { id: 'favourites', label: 'Favourites' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'journal', label: 'In pictures' },
  { id: 'visit', label: 'Visit' },
]
export function SiteNav({ home = false }: { home?: boolean }) {
  const [solid, setSolid] = useState(!home)
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  useEffect(() => { const on = () => setSolid(!home || window.scrollY > 60); on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on) }, [home])
  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); toggle.current?.focus() } }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open])
  return <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${solid || open ? 'bg-paper/95 text-ink shadow-[0_1px_0_#00000014] backdrop-blur-md' : 'bg-ink/55 text-white'}`}>
    <nav className={`flex min-w-0 items-center justify-between gap-3 px-[4vw] transition-[padding] ${solid ? 'py-2.5' : 'py-5'}`} aria-label="Main">
      <Link to="/" hash="top" aria-label="White Land, back to top" onClick={() => setOpen(false)} className="shrink-0"><Wordmark /></Link>
      <div className="flex min-w-0 items-center gap-3 text-sm sm:gap-5 lg:gap-6">
        {navigation.map(link => <Link key={link.id} to="/" hash={link.id} className="hidden underline-offset-4 hover:underline lg:inline">{link.label}</Link>)}
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="White Land on Instagram" className="hidden min-h-11 min-w-11 items-center justify-center sm:inline-flex"><Instagram size={19} strokeWidth={1.6} /></a>
        <a href={ORDER_URL} target="_blank" rel="noopener noreferrer" aria-label="Order online on Beep (opens in a new tab)" className={`whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-medium sm:text-sm ${solid || open ? 'bg-ink text-paper hover:bg-neutral-700' : 'bg-white text-black hover:bg-neutral-100'}`}>Order online</a>
        <button ref={toggle} type="button" onClick={() => setOpen(!open)} aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="mobile-nav" className={`-mr-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full lg:hidden ${solid || open ? 'text-ink' : 'text-white'}`}>{open ? <X size={21} /> : <Menu size={21} />}</button>
      </div>
    </nav>
    {open && <nav id="mobile-nav" aria-label="Mobile" className="grid max-h-[calc(100svh-6rem)] gap-1 overflow-y-auto border-t border-concrete/30 bg-paper px-[4vw] py-4 text-ink lg:hidden">
      {navigation.map(link => <Link key={link.id} to="/" hash={link.id} onClick={() => setOpen(false)} className="py-2.5 text-lg">{link.label}</Link>)}
      <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="mt-3 flex items-center justify-between border-t border-concrete/40 py-4 text-sm text-ink"><span className="inline-flex items-center gap-2"><Instagram size={17} /> @white_land_</span><ArrowUpRight size={17} /></a>
    </nav>}
  </header>
}
export function Hero() {
  const ref = useRef<HTMLElement>(null), picture = useRef<HTMLDivElement>(null), image = useRef<HTMLImageElement>(null), white = useRef<HTMLSpanElement>(null), land = useRef<HTMLSpanElement>(null), caption = useRef<HTMLDivElement>(null), tint = useRef<HTMLDivElement>(null)
  useScrollEffect(() => {
    if (!ref.current || !picture.current || !image.current || !white.current || !land.current || !caption.current || !tint.current) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const p = clamp01(-ref.current.getBoundingClientRect().top / Math.max(1, ref.current.offsetHeight - window.innerHeight))
    const t = 1 - Math.pow(1 - clamp01(p / .72), 3), wide = window.innerWidth >= 768
    const move = clamp01(p / .6), opacity = reduce ? 1 : clamp01((p - .66) / .22)
    picture.current.style.clipPath = reduce ? 'none' : `inset(${(wide ? 24 : 30) * (1 - t)}% ${(wide ? 31 : 9) * (1 - t)}% round ${28 * (1 - t)}px)`
    image.current.style.transform = reduce ? 'none' : `scale(${1.22 - .22 * clamp01(p / .72)})`
    white.current.style.transform = reduce ? 'none' : `translate(${-18 * move}vw,${-130 * move}%)`
    land.current.style.transform = reduce ? 'none' : `translate(${18 * move}vw,${130 * move}%)`
    caption.current.style.opacity = String(opacity)
    caption.current.style.transform = `translateY(${24 * (1 - opacity)}px)`
    caption.current.style.visibility = opacity > .05 ? 'visible' : 'hidden'
    tint.current.style.opacity = String(opacity)
  })
  return <section ref={ref} id="top" className="hero relative h-[240vh]">
    <div className="sticky top-0 h-svh overflow-hidden bg-paper">
      <div ref={picture} className="hero-picture absolute inset-0 overflow-hidden bg-plaster"><img ref={image} src={IMAGES.hero.src} alt={IMAGES.hero.alt} className="h-full w-full object-cover object-[50%_45%]" fetchPriority="high" /><div ref={tint} className="hero-tint absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" /></div>
      <h1 aria-label="White Land" className="pointer-events-none absolute inset-0 flex flex-col justify-between px-[4vw] pb-[5svh] pt-[14svh] font-wide text-[clamp(4.25rem,19vw,17rem)] font-black leading-[.8] tracking-[-.05em] text-white mix-blend-difference"><span ref={white} aria-hidden="true">white</span><span ref={land} className="self-end" aria-hidden="true">land</span></h1>
      <div ref={caption} className="hero-caption absolute bottom-[6svh] left-[4vw] right-[4vw] max-w-md text-white"><p className="text-[clamp(1.25rem,2.4vw,1.75rem)] font-medium leading-snug tracking-tight">A two-storey loft café at Centario, Pantai Hillpark.</p><p className="mt-2 text-sm text-white/90">Coffee, bagels and pressed sandwiches. Kuala Lumpur.</p><a href={ORDER_URL} target="_blank" rel="noopener noreferrer" aria-label="Order delivery or takeaway on Beep (opens in a new tab)" className="mt-5 inline-flex rounded-full bg-paper px-5 py-3 text-sm font-medium text-ink hover:bg-white">Order delivery or takeaway</a></div>
      <span className="hero-scroll absolute bottom-[47%] left-[4vw] hidden items-center gap-3 text-[10px] uppercase tracking-[.2em] text-ink/70 md:flex" aria-hidden="true">A little further <ArrowDown size={13} /></span>
    </div>
  </section>
}
export function About() { return <section className="bg-paper px-[4vw] py-[9svh]">
  <ScrollLitText className="max-w-[22ch] text-[clamp(2rem,5.2vw,4.75rem)] font-medium leading-[1.04] tracking-[-.03em] text-ink" text="Up the stairs in an apartment block, two floors of white walls, light wood and bare concrete. A few bright prints overhead. Plenty in the cup." />
  <div className="mt-[6svh] grid gap-6 md:grid-cols-12"><div className="md:col-span-5 md:col-start-7"><Parallax className="aspect-[4/5]"><img src={IMAGES.room.src} alt={IMAGES.room.alt} loading="lazy" className="h-full w-full object-cover" /></Parallax></div><Reveal className="self-end md:col-span-4 md:col-start-1 md:row-start-1"><p className="max-w-[38ch] text-base leading-relaxed text-ink/70">White Land keeps the room quiet so the light can do the work. Come for a slow morning, stay for lunch, and take a seat upstairs if you want the window.</p></Reveal></div>
</section> }
export function Favourites({ items }: { items: Favourite[] }) {
  const root = useRef<HTMLElement>(null), track = useRef<HTMLDivElement>(null), bar = useRef<HTMLDivElement>(null)
  useScrollEffect(() => {
    if (!root.current || !track.current || !bar.current) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const p = clamp01(-root.current.getBoundingClientRect().top / Math.max(1, root.current.offsetHeight - window.innerHeight))
    const travel = Math.max(0, track.current.scrollWidth - window.innerWidth)
    const fraction = clamp01((p - .05) / .9)
    track.current.style.transform = reduce ? 'none' : `translateX(${-travel * fraction}px)`
    bar.current.style.transform = `scaleX(${fraction})`
  })
  if (!items.length) return <section id="favourites" className="scroll-mt-20 bg-paper px-[4vw] py-[7svh]"><div className="flex flex-wrap items-end justify-between gap-6"><h2 className="section-title">Favourites</h2><Link to="/menu" className="inline-flex items-center gap-3 text-sm underline underline-offset-4">See the whole menu <ArrowUpRight size={16} /></Link></div><div className="mt-10 grid gap-6 border-y border-concrete/40 py-10 sm:grid-cols-[1fr_auto] sm:items-center"><div><span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-concrete/40"><Coffee size={19} strokeWidth={1.3} /></span><h3 className="text-2xl font-medium tracking-tight">A fresh start at the counter.</h3><p className="mt-2 max-w-lg text-sm leading-relaxed text-ink/65">The menu hasn’t been imported yet. No products or prices have been copied. In the meantime, explore how we build our coffee below.</p></div><span className="text-[11px] uppercase tracking-[.15em] text-ink/60">Menu coming soon</span></div></section>
  return <section ref={root} id="favourites" className="favourites-track relative bg-paper" style={{ height: `${Math.max(220, 120 + items.length * 26)}vh` }}><div className="favourites-sticky sticky top-0 flex h-svh flex-col justify-center overflow-hidden"><div className="mb-8 flex items-end justify-between gap-6 px-[4vw]"><h2 className="section-title">Favourites</h2><p className="hidden max-w-[34ch] text-ink/65 md:block">What our regulars order most. Keep scrolling, then tap one to start your order.</p></div><div ref={track} className="favourites-cards flex w-max gap-[3vw] px-[4vw]">{items.map((p, i) => <Link to="/menu" key={p.id} className="group block w-[min(72vw,calc((100svh-300px)*.8))] shrink-0 sm:w-[min(38vw,calc((100svh-300px)*.8))] lg:w-[min(26vw,calc((100svh-300px)*.8))]"><div className="relative aspect-[4/5] overflow-hidden bg-plaster"><img src={p.img} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /><span className="absolute left-3 top-3 rounded-full bg-paper/95 px-3 py-1 text-[11px] text-ink">{p.category}</span></div><div className="mt-4 flex items-baseline justify-between gap-4"><h3 className="text-lg font-medium uppercase leading-tight tracking-tight">{p.title}</h3><span className="shrink-0 text-ink/65">RM {p.price.toFixed(2)}</span></div><span className="text-xs text-ink/60">0{i + 1}</span></Link>)}<Link to="/menu" className="flex w-[72vw] shrink-0 flex-col justify-between rounded-[28px] bg-ink p-8 text-paper sm:w-[30vw] lg:w-[22vw]"><span className="font-wide text-4xl font-bold leading-none">See the whole menu</span><span className="mt-10 inline-flex w-fit items-center gap-2 rounded-full bg-paper px-5 py-3 text-sm font-medium text-ink">Order online →</span></Link></div><div className="mx-[4vw] mt-8 h-px bg-concrete/40" aria-hidden="true"><div ref={bar} className="h-full origin-left bg-ink" /></div></div></section>
}
export function CoffeeSection() { return <section id="coffee" className="scroll-mt-16 bg-[#e4cdb0] px-[4vw] py-[8svh] text-[#3a271d]"><div className="mx-auto max-w-6xl"><div className="mb-10 grid gap-4 md:grid-cols-2 md:items-end"><h2 className="section-title text-[#3a271d]">At the counter</h2><p className="max-w-[40ch] leading-relaxed text-[#604834] md:justify-self-end">Hover or tap a drink to see how it is built, shot by shot. The full list, including iced and non-coffee drinks, is on our <Link to="/menu" className="font-medium text-[#3a271d] underline underline-offset-4">online menu</Link>.</p></div><CoffeePourMenu items={DRINKS} defaultValue="flat-white" /></div></section> }
export function Kitchen() { return <section id="kitchen" className="scroll-mt-16 bg-paper px-[4vw] py-[8svh]"><div className="grid gap-10 md:grid-cols-12"><div className="min-w-0 md:col-span-5"><h2 className="section-title">From the kitchen</h2><dl className="mt-12 divide-y divide-concrete/40 border-y border-concrete/40">{[{ name: 'Smoked salmon bagel', note: 'Cream cheese, capers, red onion, dill.' }, { name: 'Cubano sandwich', note: 'Roast pork, ham, Swiss, pickles, mustard, pressed hot.' }].map(d => <div key={d.name} className="py-6"><dt className="text-2xl font-medium tracking-tight">{d.name}</dt><dd className="mt-1 text-ink/65">{d.note}</dd></div>)}</dl><p className="mt-6 max-w-[36ch] text-sm leading-relaxed text-ink/65">The rest of the menu changes with the season. See what’s on today and order it to your door.</p><a href={ORDER_URL} target="_blank" rel="noopener noreferrer" aria-label="See the full menu and order on Beep (opens in a new tab)" className="mt-5 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper hover:bg-neutral-700">See the full menu and order</a></div><div className="relative grid min-w-0 grid-cols-5 gap-4 md:col-span-6 md:col-start-7"><Parallax className="col-span-5 aspect-[4/3]"><img src={IMAGES.room.src} alt={IMAGES.room.alt} loading="lazy" className="h-full w-full object-cover" /></Parallax><Reveal className="col-span-3 col-start-3 aspect-square bg-plaster" delay={.15}><img src={IMAGES.entrance.src} alt={IMAGES.entrance.alt} loading="lazy" className="h-full w-full object-cover" /></Reveal></div></div></section> }
export function GoogleReviews() { return <section id="reviews" className="scroll-mt-16 bg-plaster px-[4vw] py-[8svh] text-ink"><div className="grid gap-10 md:grid-cols-12 md:items-end"><Reveal className="md:col-span-7"><h2 className="section-title">What people say</h2></Reveal><Reveal className="md:col-span-5 md:justify-self-end"><a href={GOOGLE.url} target="_blank" rel="noopener noreferrer" className="inline-flex flex-wrap items-center gap-5 rounded-[28px] bg-paper px-6 py-5 text-ink hover:bg-white"><span className="font-wide text-6xl font-black leading-none tracking-[-.05em]">{GOOGLE.rating.toFixed(1)}</span><span><span className="inline-flex gap-0.5" role="img" aria-label="4.7 out of 5 stars">{[0, 1, 2, 3, 4].map(i => <Star key={i} size={17} className="fill-ink text-ink" />)}</span><span className="mt-1 block text-sm text-ink/65">{GOOGLE.count} reviews on Google</span><span className="mt-1 block text-sm font-medium">Read them on Google →</span></span></a></Reveal></div><p className="mt-8 text-xs text-ink/65">Historical source rating from Google Maps, checked {GOOGLE.checked}. Not live. No individual reviews have been imported.</p></section> }
export function Visit({ year }: { year: number }) { return <section id="visit" className="scroll-mt-16 bg-plaster px-[4vw] pb-10 pt-[8svh] text-ink"><h2 className="font-wide text-[clamp(3rem,9vw,8.5rem)] font-black leading-[.86] tracking-[-.05em]">Find us at Centario</h2><div className="mt-16 grid gap-12 md:grid-cols-3"><address className="min-w-0 not-italic"><p className="text-sm text-ink/65">Address</p><p className="mt-2 text-xl font-medium leading-snug tracking-tight">{CAFE.address.map(line => <span key={line} className="block">{line}</span>)}</p><a href={CAFE.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper hover:bg-neutral-700"><MapPin size={16} /> Get directions</a></address><div className="min-w-0"><p className="text-sm text-ink/65">Hours</p><dl className="mt-2 space-y-1 text-xl font-medium tracking-tight">{CAFE.hours.map(h => <div key={h.days} className="flex flex-wrap gap-x-3"><dt>{h.days}</dt><dd className="text-ink/65">{h.time}</dd></div>)}</dl><p className="mt-3 text-sm text-ink/65">Holiday hours go up on Instagram first.</p><p className="mt-2 text-xs text-ink/60">Source hours and phone; please confirm before visiting.</p></div><div className="min-w-0"><p className="text-sm text-ink/65">Say hello</p><ul className="mt-2 space-y-3 text-lg font-medium tracking-tight"><li><a href={CAFE.phoneHref} className="inline-flex items-center gap-2 hover:underline"><Phone size={16} />{CAFE.phone}</a></li><li><a href={ORDER_URL} target="_blank" rel="noopener noreferrer" aria-label="Order delivery or takeaway on Beep (opens in a new tab)" className="inline-flex items-center gap-2 hover:underline"><ShoppingBag size={16} className="shrink-0" />Order delivery or takeaway</a></li><li><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:underline"><Instagram size={16} />@white_land_</a></li></ul></div></div><footer className="mt-[7svh] flex flex-wrap items-center justify-between gap-6 border-t border-concrete/50 pt-6 text-sm text-ink/65"><span className="flex items-center gap-4"><Wordmark className="text-ink" /><span>© {year} White Land</span></span><div className="flex flex-wrap gap-5"><a href="/migration-handoff.txt" download className="underline underline-offset-4">Migration handoff</a><span>Pantai Hillpark, Kuala Lumpur</span></div></footer></section> }
