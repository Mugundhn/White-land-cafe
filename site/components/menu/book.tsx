"use client";
import * as React from "react";
import { createPortal } from "react-dom";
import type { PageFlip } from "page-flip";
import { defaultSel, labelFor, missingOption, rm, toggleOpt, type Category, type Product, type Sel } from "@/lib/menu-data";

export type BookItem = [Product, Category];

/* Pages are real DOM nodes turned by the page-flip engine (the same engine @vuvandinh203/react-flipbook wraps).
   Product i = page 2i (photo) + page 2i+1 (details). React renders each page's content into its node through a
   portal, so the engine can move the nodes freely while React keeps owning what is inside them. */

function LeftPage({ p, cat, near }: { p: Product; cat: Category; near: boolean }) {
  const [on, setOn] = React.useState(false);
  const [bad, setBad] = React.useState(false);
  React.useEffect(() => { if (near) setOn(true); }, [near]);
  const tag = labelFor(p, cat);
  return (
    <>
      <div className="l-img">
        {p.img && !bad ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={on ? p.img : undefined} alt={p.title} decoding="async" onError={() => setBad(true)} />
        ) : <div className="ph" aria-hidden="true">WL</div>}
      </div>
      {tag && <span className={"tag" + (tag === "Must Try" ? " alt" : "")}>{tag}</span>}
      <div className="l-cap"><span>{cat.name}</span><strong>{p.title}</strong></div>
    </>
  );
}

function DetailPage({ p, i, onAdd }: { p: Product; i: number; onAdd: (p: Product, sel: Sel, qty: number, now: boolean) => void }) {
  const [sel, setSel] = React.useState<Sel>(() => defaultSel(p));
  const [qty, setQty] = React.useState(1);
  const [err, setErr] = React.useState("");
  const [done, setDone] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  const add = (now: boolean) => {
    if (p.out) return;
    const bad = missingOption(p, sel);
    if (bad) { setErr(`Please choose an option for ${bad.name}.`); return; }
    onAdd(p, sel, qty, now);
    if (!now) { setDone(true); clearTimeout(timer.current); timer.current = setTimeout(() => setDone(false), 1400); }
  };

  return (
    <div className="d-in">
      <div className="d-k">{p.out ? "Currently unavailable" : "Details"}</div>
      <h2>{p.title}</h2>
      <div className="price big">{p.was && p.was > p.price ? <s>{rm(p.was)}</s> : null}{rm(p.price)}</div>
      {p.desc && <p className="d-desc">{p.desc}</p>}
      {p.vars.map((v) => {
        const single = v.type === "SingleChoice";
        return (
          <div className="grp" role={single ? "radiogroup" : "group"} aria-label={v.name} key={v.id}>
            <div className="lg">{v.name}<em>{single ? "Choose 1" : v.max ? `Up to ${v.max}` : "Optional"}</em></div>
            {v.opts.map((o) => {
              const on = sel[v.id].includes(o.id);
              return (
                <button type="button" key={o.id} className={"opt" + (on ? " on" : "") + (o.out ? " so" : "")} role={single ? "radio" : "checkbox"}
                  aria-checked={on} disabled={o.out} onClick={() => { setSel((s) => toggleOpt(p, s, v.id, o.id)); setErr(""); }}>
                  <span className={"ck" + (single ? "" : " sq")}></span><span>{o.label}</span>{o.out && <span className="em">Sold out</span>}
                </button>
              );
            })}
          </div>
        );
      })}
      <div className="err b-err" role="alert">{err}</div>
      <div className="d-act">
        <div className="qty">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
          <span className="b-qty" aria-live="polite">{qty}</span>
          <button type="button" onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="Increase quantity">+</button>
        </div>
        <span className="d-total b-tot">{rm(p.price * qty)}</span>
      </div>
      <div className="d-btns">
        <button type="button" className={"cta ghost" + (done ? " done" : "")} disabled={p.out} onClick={() => add(false)}>{done ? "Added ✓" : "Add to cart"}</button>
        <button type="button" className="cta" disabled={p.out} onClick={() => add(true)}>Get now</button>
      </div>
      <div className="folio">— {i + 1} —</div>
    </div>
  );
}

// Clicking a page must not turn it (people tap options), so click-to-flip is off. The engine's own
// flipPrev/flip(page) are rejected while it is off, so lift the guard only for the instant of the call.
function withFlip(pf: PageFlip, fn: () => void) {
  const s = pf.getSettings();
  const was = s.disableFlipByClick;
  s.disableFlipByClick = false;
  try { fn(); } finally { s.disableFlipByClick = was; }
}

type Props = {
  items: BookItem[];
  title: string;
  bi: number;
  setBi: (i: number) => void;
  onAdd: (p: Product, sel: Sel, qty: number, now: boolean) => void;
  keysActive: boolean;
};

export function Book({ items, title, bi, setBi, onAdd, keysActive }: Props) {
  const flipRef = React.useRef<HTMLDivElement>(null);
  const pf = React.useRef<PageFlip | null>(null);
  const [els, setEls] = React.useState<HTMLElement[]>([]);
  const [idx, setIdx] = React.useState(bi * 2);
  const [ready, setReady] = React.useState(false);
  const biRef = React.useRef(bi);
  biRef.current = bi;
  const setBiRef = React.useRef(setBi);
  setBiRef.current = setBi;

  // the page nodes the engine will turn
  React.useEffect(() => {
    const nodes: HTMLElement[] = [];
    items.forEach((_, i) => {
      (["l", "r"] as const).forEach((side) => {
        const d = document.createElement("div");
        d.className = `pf-page pf-${side}`;
        d.dataset.i = String(i);
        d.dataset.density = "soft";
        nodes.push(d);
      });
    });
    setEls(nodes);
  }, [items]);

  // start the engine once the nodes exist
  React.useEffect(() => {
    if (!els.length || !flipRef.current) return;
    let dead = false;
    let inst: PageFlip | null = null;
    import("page-flip").then(({ PageFlip: PF }) => {
      if (dead || !flipRef.current) return;
      inst = new PF(flipRef.current, {
        width: 460, height: 600, size: "stretch", minWidth: 230, maxWidth: 780, minHeight: 320, maxHeight: 1000,
        maxShadowOpacity: 0.45, showCover: false, flippingTime: 1100, usePortrait: true, startPage: biRef.current * 2, drawShadow: true,
        mobileScrollSupport: true, swipeDistance: 30, clickEventForward: true, useMouseEvents: true, showPageCorners: true,
        disableFlipByClick: true, autoSize: true,
      });
      inst.loadFromHTML(els);
      inst.on("flip", (e) => {
        const n = Number(e.data);
        setIdx(n);
        const i = Math.floor(n / 2);
        if (i !== biRef.current) setBiRef.current(i);
      });
      inst.on("changeOrientation", () => setIdx(inst!.getCurrentPageIndex()));
      pf.current = inst;
      setIdx(inst.getCurrentPageIndex());
      setReady(true);
    });
    return () => {
      dead = true;
      try { inst?.destroy(); } catch { /* already gone */ }
      pf.current = null;
      setReady(false);
    };
  }, [els]);

  // the page was changed from outside (thumbnail, "start with a favourite")
  React.useEffect(() => {
    const p = pf.current;
    if (!p || !ready) return;
    if (Math.floor(p.getCurrentPageIndex() / 2) !== bi) withFlip(p, () => p.flip(bi * 2, "bottom"));
  }, [bi, ready]);

  const go = React.useCallback((d: number) => {
    const p = pf.current;
    if (!p) return;
    withFlip(p, () => (d > 0 ? p.flipNext("bottom") : p.flipPrev("bottom")));
  }, []);

  React.useEffect(() => {
    if (!keysActive) return;
    const onKey = (e: KeyboardEvent) => {
      if (/INPUT|TEXTAREA/.test((document.activeElement as HTMLElement)?.tagName || "")) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [keysActive, go]);

  React.useEffect(() => {
    document.querySelector("#thumbs .th.on")?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [bi]);

  // phones show one page at a time (photo, then details), so the arrows step by page there
  const p = pf.current;
  const last = p ? p.getPageCount() - (p.getOrientation() === "portrait" ? 1 : 2) : items.length * 2 - 2;
  const page = Math.min(bi, items.length - 1);

  return (
    <div className="book" id="book">
      <div className="b-head"><h2 id="bHead">{title}</h2><span id="bCount">Page {page + 1} / {items.length}</span></div>
      <div className={"fb"} id="flip" ref={flipRef} />
      {els.length === items.length * 2 && els.map((el, k) => {
        const i = k >> 1;
        const [prod, cat] = items[i];
        return createPortal(
          k % 2 === 0 ? <LeftPage p={prod} cat={cat} near={i >= bi - 1 && i <= bi + 2} /> : <DetailPage p={prod} i={i} onAdd={onAdd} />,
          el,
          prod.id + (k % 2),
        );
      })}
      <div className="b-nav">
        <button className="arrow" onClick={() => go(-1)} disabled={idx <= 0} aria-label="Previous page">←</button>
        <div className="thumbs" id="thumbs" role="tablist">
          {items.map(([q], i) => (
            <button key={q.id} className={"th" + (i === page ? " on" : "")} aria-current={i === page} aria-label={q.title} title={q.title} onClick={() => setBi(i)}>
              {q.img ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={q.img} alt="" loading="lazy" /> : <span>WL</span>}
            </button>
          ))}
        </div>
        <button className="arrow" onClick={() => go(1)} disabled={idx >= last} aria-label="Next page">→</button>
      </div>
      <p className="b-hint"><span className="h-kb">Drag a page corner, use the arrows, or press ← →</span><span className="h-touch">Swipe or drag the page to turn it</span></p>
    </div>
  );
}
