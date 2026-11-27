import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { DRINKS } from '@/lib/content'
import type { CoffeeItem, CoffeeVessel } from '@/lib/content'
export type { CoffeeItem, CoffeeVessel, CoffeeLiquid } from '@/lib/content'

interface Profile { top: number; r: number; bot: number; rb: number; c: number }
const P = .34
const GEO: Record<CoffeeVessel, { outer: Profile; inner: Profile; glass: boolean; handle?: string; handleW?: number; saucer?: number }> = {
  demitasse: { outer: { top: -86, r: 46, bot: -14, rb: 27, c: 53 }, inner: { top: -86, r: 41, bot: -60, rb: 33, c: 42 }, glass: false, handle: 'M41 -74C66 -80 76 -56 60 -44C52 -38 42 -37 34 -39', handleW: 8, saucer: 90 },
  'glass-mug': { outer: { top: -170, r: 58, bot: 0, rb: 52, c: 55 }, inner: { top: -170, r: 53.5, bot: -16, rb: 46.5, c: 50 }, glass: true, handle: 'M55 -148C94 -148 98 -130 98 -100C98 -64 92 -42 53 -40', handleW: 13 },
  cup: { outer: { top: -114, r: 80, bot: -16, rb: 38, c: 95 }, inner: { top: -114, r: 74.5, bot: -76, rb: 57, c: 74 }, glass: false, handle: 'M75 -98C112 -106 126 -68 98 -52C88 -46 78 -45 66 -47', handleW: 11, saucer: 132 },
  'tall-glass': { outer: { top: -238, r: 48, bot: 0, rb: 39, c: 43.5 }, inner: { top: -238, r: 44.5, bot: -24, rb: 35, c: 39.8 }, glass: true },
}
const f1 = (n: number) => Math.round(n * 10) / 10
const wallR = (p: Profile, t: number) => (1 - t) * (1 - t) * p.r + 2 * t * (1 - t) * p.c + t * t * p.rb
function silhouette(p: Profile) { const m = (p.top + p.bot) / 2; return `M${-p.r} ${p.top}A${p.r} ${f1(p.r * P)} 0 0 1 ${p.r} ${p.top}Q${p.c} ${m} ${p.rb} ${p.bot}A${p.rb} ${f1(p.rb * P)} 0 0 1 ${-p.rb} ${p.bot}Q${-p.c} ${m} ${-p.r} ${p.top}Z` }
function bodyPath(p: Profile) { const m = (p.top + p.bot) / 2; return `M${-p.r} ${p.top}Q${-p.c} ${m} ${-p.rb} ${p.bot}A${p.rb} ${f1(p.rb * P)} 0 0 0 ${p.rb} ${p.bot}Q${p.c} ${m} ${p.r} ${p.top}A${p.r} ${f1(p.r * P)} 0 0 1 ${-p.r} ${p.top}Z` }

// Vessel geometry and recipe amounts are retained. Native animation replaces the unavailable motion runtime.
function CupView({ item, progress = 1, prefix }: { item: CoffeeItem; progress?: number; prefix: string }) {
  const g = GEO[item.vessel], o = g.outer, inner = g.inner
  const total = item.layers.reduce((sum, layer) => sum + layer.amount, 0)
  const filled = total * progress
  const height = inner.bot - inner.top
  const y = inner.bot - height * filled
  const r = wallR(inner, 1 - filled)
  let sum = 0
  const visibleLayers = item.layers.map(layer => {
    const start = sum
    sum += layer.amount
    return { ...layer, start, visible: Math.max(0, Math.min(layer.amount, filled - start)) }
  })
  const current = visibleLayers.find(layer => filled < layer.start + layer.amount)
  const palette = { espresso: '#4c2815', water: '#b5cbd0', milk: '#f6ecdb' }
  const topLayer = [...visibleLayers].reverse().find(layer => layer.visible > 0)
  const mixed = topLayer?.type === 'milk' && (item.blend ?? 1) > .5
  return <g>
    <defs>
      <clipPath id={`${prefix}-clip`}><path d={silhouette(inner)} /></clipPath>
      <linearGradient id={`${prefix}-body`}><stop stopColor={item.vessel === 'demitasse' ? '#b96b38' : '#d7c9b5'} /><stop offset=".4" stopColor={item.vessel === 'demitasse' ? '#e6ae79' : '#fffaf0'} /><stop offset="1" stopColor={item.vessel === 'demitasse' ? '#a66035' : '#c6b69e'} /></linearGradient>
      <linearGradient id={`${prefix}-liquid`} x1="0" x2="0" y1="1" y2="0"><stop stopColor="#482713" /><stop offset=".5" stopColor="#a2683d" /><stop offset="1" stopColor="#d8b18a" /></linearGradient>
      <radialGradient id={`${prefix}-shadow`}><stop stopColor="#51351d" stopOpacity=".25" /><stop offset="1" stopColor="#51351d" stopOpacity="0" /></radialGradient>
    </defs>
    <ellipse cx="8" cy="10" rx={g.saucer ? g.saucer + 20 : 90} ry="29" fill={`url(#${prefix}-shadow)`} />
    {g.saucer && <><ellipse cy="-3" rx={g.saucer} ry={g.saucer * P} fill="#e2d3bb" /><ellipse cy="-7" rx={g.saucer} ry={g.saucer * P} fill="#fbf5e8" stroke="#cbb99e" /><ellipse cy="-7" rx={g.saucer * .8} ry={g.saucer * .8 * P} fill="none" stroke="#d2c3ac" /></>}
    {g.handle && <path d={g.handle} fill="none" stroke={g.glass ? '#f4ead9' : `url(#${prefix}-body)`} strokeWidth={g.handleW} />}
    <path d={silhouette(o)} fill={g.glass ? '#ffffff28' : `url(#${prefix}-body)`} stroke="#8f745742" />
    <ellipse cy={o.top} rx={o.r} ry={o.r * P} fill={g.glass ? '#fff9ed33' : '#fbf6eb'} stroke="#9d7b5740" />
    <path d={silhouette(inner)} fill="#9d775733" />
    <g clipPath={`url(#${prefix}-clip)`}>
      {visibleLayers.map((layer, index) => layer.visible > 0 && <rect key={`${layer.type}-${index}`} x={-inner.r - 10} y={inner.bot - height * (layer.start + layer.visible)} width={inner.r * 2 + 20} height={height * layer.visible + 1} fill={palette[layer.type]} opacity={layer.type === 'water' ? .7 : 1} />)}
      {mixed && <rect x={-inner.r - 10} y={y} width={inner.r * 2 + 20} height={inner.bot - y + 1} fill={`url(#${prefix}-liquid)`} opacity={Math.min(1, (filled - (topLayer?.start ?? 0)) / .12)} />}
      {filled > 0 && <ellipse cy={y} rx={r} ry={r * P} fill={mixed ? '#d3a675' : palette[topLayer?.type ?? 'espresso']} />}
      {item.crema && filled > 0 && <ellipse cy={y} rx={r * .94} ry={r * P * .88} fill="none" stroke="#d4a260" strokeWidth="3" opacity={progress} />}
      {item.foam && progress > .85 && <ellipse cy={y - 1} rx={r * .98} ry={r * P * .95} fill="#faf3e5" opacity={(progress - .85) / .15} />}
      {item.art === 'heart' && progress > .9 && <path transform={`translate(0 ${y}) scale(23 9)`} d="M0 .78C-.5 .36 -.98 .02 -.68 -.48C-.46 -.82 -.1 -.74 0 -.4C.1 -.74 .46 -.82 .68 -.48C.98 .02 .5 .36 0 .78Z" fill="#b88755" opacity={(progress - .9) * 10} />}
    </g>
    {!g.glass && <path d={bodyPath(o)} fill={`url(#${prefix}-body)`} />}
    <path d={`M${-o.r} ${o.top}A${o.r} ${o.r * P} 0 0 0 ${o.r} ${o.top}`} fill="none" stroke="#fef9ef" strokeWidth="3" />
    {g.glass && <><path d={bodyPath(o)} fill="#fffcf210" stroke="#fff9e5aa" strokeWidth="2" /><path d={`M${-o.r * .77} ${o.top + 9}L${-o.rb * .77} ${o.bot - 17}`} stroke="white" strokeWidth="4" strokeOpacity=".6" strokeLinecap="round" /></>}
    {progress > 0 && progress < .995 && <path d={`M8 -350Q${5 + Math.sin(progress * 45) * 3} -230 8 ${y}`} fill="none" stroke={palette[current?.type ?? 'espresso']} strokeWidth={current?.type === 'milk' ? 6 : 3.5} strokeLinecap="round" />}
  </g>
}
export function CoffeePourMenu({ items = DRINKS, defaultValue, value, onValueChange, className = '' }: { items?: CoffeeItem[]; defaultValue?: string; value?: string; onValueChange?: (id: string) => void; className?: string }) {
  const [inner, setInner] = useState(defaultValue ?? items[0]?.id)
  const selectedId = value ?? inner
  const selected = items.find(i => i.id === selectedId) ?? items[0]
  const [previous, setPrevious] = useState<CoffeeItem | null>(null)
  const last = useRef(selected)
  const [progress, setProgress] = useState(1)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const prefix = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  useEffect(() => {
    if (!selected) return
    if (last.current?.id !== selected.id) setPrevious(last.current ?? null)
    last.current = selected
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setProgress(1); setPrevious(null); return }
    let frame = 0
    const start = performance.now()
    setProgress(0)
    // The vessel arrives first, then each ingredient pours in recipe order.
    const tick = (now: number) => {
      const p = Math.max(0, Math.min(1, (now - start - 450) / 2200))
      setProgress(p)
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [selected])
  const select = (id: string) => { if (id === selectedId) return; if (value === undefined) setInner(id); onValueChange?.(id) }
  function onKeyDown(e: KeyboardEvent) {
    if (!items.length) return
    const i = items.findIndex(it => it.id === selectedId)
    const n = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? (i + 1) % items.length : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? (i - 1 + items.length) % items.length : e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : -1
    if (n < 0) return
    e.preventDefault(); select(items[n].id); buttons.current[n]?.focus()
  }
  if (!selected) return <p>No drinks to show.</p>
  return <div className={`grid min-w-0 items-center gap-5 rounded-[32px] bg-[#e4cdb0] p-4 text-[#3a271d] sm:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] sm:gap-10 sm:p-10 ${className}`}>
    <div role="radiogroup" aria-label="Coffee menu" onKeyDown={onKeyDown} className="grid min-w-0 grid-cols-2 gap-1.5 sm:flex sm:flex-col sm:gap-1">{items.map((it, i) => <button type="button" key={it.id} ref={el => { buttons.current[i] = el }} role="radio" aria-checked={selected.id === it.id} tabIndex={selected.id === it.id ? 0 : -1} onPointerEnter={e => { if (e.pointerType === 'mouse') select(it.id) }} onFocus={() => select(it.id)} onClick={() => select(it.id)} className={`min-w-0 rounded-2xl px-3.5 py-3 text-left text-[#3a271d] transition-colors sm:px-6 sm:py-4 ${selected.id === it.id ? 'bg-[#f7ecdd] shadow-[0_14px_30px_-16px_#5a371940,inset_0_0_0_1px_#b97a4552]' : 'bg-transparent hover:bg-[#ead8c1]'}`}><span className="block text-[19px] font-medium leading-tight tracking-[-.025em] sm:text-[34px]">{it.name}</span><span className="mt-1 block text-[11.5px] leading-snug text-[#765036] sm:text-[13px]">{it.subtitle}</span></button>)}</div>
    <div className="relative aspect-[9/10] min-w-0 overflow-hidden rounded-[26px] bg-[radial-gradient(80%_62%_at_50%_42%,#fbf1e3_0%,#f0dcc2_45%,#e2c6a3_80%,#d6b791_100%)] shadow-[inset_0_1px_0_#ffffffb3,0_30px_60px_-30px_#5a371980]">
      <svg viewBox="0 0 360 400" className="absolute inset-0 h-full w-full" aria-hidden="true"><path d="M0 294H360V400H0Z" fill="#8c55290b" />{previous && <g key={previous.id} className="cup-fall" onAnimationEnd={() => setPrevious(null)}><g transform="translate(180 330)"><CupView item={previous} prefix={`${prefix}-old`} /></g></g>}<g key={selected.id} className="cup-enter"><g transform="translate(180 330)"><CupView item={selected} progress={progress} prefix={`${prefix}-new`} /></g></g></svg>
    </div>
    <p className="sr-only" aria-live="polite">{selected.name}: {selected.description ?? selected.subtitle ?? ''}</p>
  </div>
}
