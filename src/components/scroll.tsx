import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
export function useScrollEffect(callback: () => void) {
  const latest = useRef(callback)
  latest.current = callback
  useEffect(() => {
    let frame = 0
    const update = () => { frame = 0; latest.current() }
    const request = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request)
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    media.addEventListener('change', request)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', request); window.removeEventListener('resize', request); media.removeEventListener('change', request) }
  }, [])
}
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)
  useScrollEffect(() => { if (ref.current) ref.current.style.transform = `scaleX(${clamp01(window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight))})` })
  return <div ref={ref} className="scroll-progress" aria-hidden="true" />
}
export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { el.classList.remove('reveal-wait'); observer.unobserve(el) } }), { rootMargin: '0px 0px -8% 0px' })
    // Content stays visible if script or IntersectionObserver is unavailable.
    if (el.getBoundingClientRect().top > window.innerHeight) el.classList.add('reveal-wait')
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}s` }}>{children}</div>
}
export function Parallax({ children, className = '', range = 9 }: { children: ReactNode; className?: string; range?: number }) {
  const root = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  useScrollEffect(() => {
    if (!root.current || !inner.current) return
    const box = root.current.getBoundingClientRect()
    const p = clamp01((window.innerHeight - box.top) / (window.innerHeight + box.height))
    inner.current.style.transform = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'none' : `translateY(${(p * 2 - 1) * range}%)`
  })
  return <div ref={root} className={`relative overflow-hidden bg-plaster ${className}`}><div ref={inner} className="absolute -inset-[12%]">{children}</div></div>
}
export function ScrollLitText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  useScrollEffect(() => {
    const el = ref.current
    if (!el) return
    const box = el.getBoundingClientRect()
    const p = clamp01((window.innerHeight * .85 - box.top) / Math.max(1, window.innerHeight * .35 + box.height))
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    Array.from(el.children).forEach((node, i, arr) => { (node as HTMLElement).style.opacity = String(reduce ? 1 : .14 + .86 * clamp01((p - i / arr.length) * arr.length / 2)) })
  })
  return <p ref={ref} className={className}>{text.split(' ').map((word, i) => <span key={i}>{word} </span>)}</p>
}
