import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Camera, Expand, X } from 'lucide-react'
import { IMAGES, INSTAGRAM_URL } from '@/lib/content'
import { Reveal } from './scroll'

const photographs = [
  { ...IMAGES.entrance, title: 'A little way up.', detail: 'The entrance at White Land', number: '01' },
  { ...IMAGES.room, title: 'Room to slow down.', detail: 'Light, wood and a seat upstairs', number: '02' },
]

export function PhotoJournal() {
  const [selected, setSelected] = useState<number | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const photograph = photographs[selected ?? 0]!

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (selected !== null && !element.open) element.showModal()
    if (selected === null && element.open) element.close()
  }, [selected])

  const move = (direction: number) => setSelected(current => current === null ? null : (current + direction + photographs.length) % photographs.length)
  const close = () => setSelected(null)

  return (
    <section id="journal" aria-labelledby="journal-heading" className="scroll-mt-24 bg-ink px-[4vw] py-[9svh] text-paper">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-5 border-b border-paper/25 pb-5">
          <span className="text-[11px] uppercase tracking-[.2em] text-paper/70">White Land, in the light</span>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm text-paper underline-offset-4 hover:underline">
            <Camera size={16} strokeWidth={1.5} aria-hidden="true" /> @white_land_ <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
        <div className="mb-12 mt-9 grid min-w-0 gap-6 md:grid-cols-12 md:items-end">
          <h2 id="journal-heading" className="section-title min-w-0 md:col-span-8">A little look<br />inside.</h2>
          <p className="max-w-[32ch] text-sm leading-relaxed text-paper/70 md:col-span-4 md:justify-self-end">Two floors. White walls. A slower kind of morning. A few glimpses of our corner of Pantai Hillpark.</p>
        </div>
      </Reveal>
      <div className="grid min-w-0 gap-10 md:grid-cols-12 md:gap-[5vw]">
        {photographs.map((photo, index) => (
          <Reveal key={photo.src} className={`min-w-0 ${index === 0 ? 'md:col-span-7' : 'md:col-span-5 md:pt-[16vh]'}`} delay={index * 0.1}>
            <figure className="min-w-0">
              <button
                type="button"
                aria-label={`Enlarge photo: ${photo.detail}`}
                aria-haspopup="dialog"
                className={`group relative block w-full overflow-hidden bg-plaster text-ink ${index === 0 ? 'aspect-[4/5] sm:aspect-[5/6]' : 'aspect-[4/5]'}`}
                onClick={event => { trigger.current = event.currentTarget; setSelected(index) }}
              >
                <img src={photo.src} alt={photo.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035] group-focus-visible:scale-[1.035]" />
                <span aria-hidden="true" className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-paper text-ink transition-colors group-hover:bg-white"><Expand size={18} strokeWidth={1.5} /></span>
              </button>
              <figcaption className="mt-5 flex min-w-0 justify-between gap-4 border-t border-paper/25 pt-4">
                <div className="min-w-0"><h3 className="text-xl font-medium tracking-tight sm:text-2xl">{photo.title}</h3><p className="mt-1 text-xs text-paper/65">{photo.detail}</p></div>
                <span className="text-[11px] text-paper/60">{photo.number}</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
      <div className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-paper/25 pt-7">
        <div><h3 className="text-xl font-medium tracking-tight">See you around the corner.</h3><p className="mt-2 max-w-md text-sm leading-relaxed text-paper/70">For more moments from the café, find us on Instagram.</p></div>
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-5 rounded-full bg-paper px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-white">Follow @white_land_ <ArrowUpRight size={17} aria-hidden="true" /></a>
      </div>
      <dialog
        ref={dialog}
        aria-labelledby="photo-viewer-title"
        aria-describedby="photo-viewer-description"
        className="photo-viewer m-auto w-[calc(100%-2rem)] max-w-5xl overflow-auto border-0 bg-ink p-0 text-paper shadow-2xl backdrop:bg-black/85"
        onCancel={close}
        onClose={() => { setSelected(null); trigger.current?.focus() }}
        onClick={event => { if (event.target === event.currentTarget) close() }}
        onKeyDown={event => {
          if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1) }
          if (event.key === 'ArrowRight') { event.preventDefault(); move(1) }
        }}
      >
        <div className="relative min-w-0" onClick={event => event.stopPropagation()}>
          <div className="flex min-w-0 items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <p id="photo-viewer-title" className="text-sm">White Land <span className="ml-2 text-paper/60">{(selected ?? 0) + 1} / {photographs.length}</span></p>
            <button type="button" autoFocus onClick={close} aria-label="Close photo viewer" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper text-ink hover:bg-white"><X size={19} /></button>
          </div>
          <div className="flex aspect-[4/5] max-h-[65svh] min-h-0 items-center justify-center bg-black/20 sm:aspect-[3/2]">
            <img src={photograph.src} alt={photograph.alt} className="h-full w-full object-contain" />
          </div>
          <div className="flex min-w-0 items-center justify-between gap-4 p-4 sm:p-6">
            <div className="min-w-0"><p id="photo-viewer-description" className="text-sm font-medium">{photograph.detail}</p><p className="mt-1 text-xs text-paper/65">Photographs from White Land</p></div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => move(-1)} aria-label="Previous photograph" className="flex h-11 w-11 items-center justify-center rounded-full bg-paper text-ink hover:bg-white"><ArrowLeft size={18} /></button>
              <button type="button" onClick={() => move(1)} aria-label="Next photograph" className="flex h-11 w-11 items-center justify-center rounded-full bg-paper text-ink hover:bg-white"><ArrowRight size={18} /></button>
            </div>
          </div>
        </div>
      </dialog>
    </section>
  )
}
