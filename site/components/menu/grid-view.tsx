"use client";
import * as React from "react";
import { labelFor, rm, type Category, type Product } from "@/lib/menu-data";
import { Thumb } from "./thumb";

type Props = {
  cats: Category[];
  q: string;
  degraded: boolean;
  pulseId: string;
  onOpen: (p: Product) => void;
  onAdd: (p: Product) => void;
  onSpy: (id: string) => void;
  lockSpy: React.RefObject<boolean>;
  onClear: () => void;
};

function Card({ p, cat, pulse, onOpen, onAdd }: { p: Product; cat: Category; pulse: boolean; onOpen: (p: Product) => void; onAdd: (p: Product) => void }) {
  const tag = labelFor(p, cat);
  const needsModal = p.vars.length > 0;
  return (
    <article className={"card" + (p.out ? " out" : "") + (pulse ? " pulse" : "")} data-id={p.id}>
      <button className="thumb" onClick={() => onOpen(p)} aria-label={`View ${p.title}`} tabIndex={-1}>
        <Thumb src={p.img} alt={p.title} />
        {tag && <span className={"tag" + (tag === "Must Try" ? " alt" : "")}>{tag}</span>}
      </button>
      <div className="info">
        <button className="name" onClick={() => onOpen(p)}>{p.title}</button>
        {p.desc && <p className="desc">{p.desc}</p>}
        {needsModal && <span className="opts">{p.vars.map((v) => v.name.toLowerCase()).join(" · ")}</span>}
        <div className="row">
          <span className="price">{p.was && p.was > p.price ? <s>{rm(p.was)}</s> : null}{rm(p.price)}</span>
          {p.out ? <button className="add" disabled>Sold out</button>
            : <button className="add" onClick={() => onAdd(p)} aria-label={`${needsModal ? "Choose options for" : "Add"} ${p.title}`}>+</button>}
        </div>
      </div>
    </article>
  );
}

export function GridView({ cats, q, degraded, pulseId, onOpen, onAdd, onSpy, lockSpy, onClear }: Props) {
  const hits = React.useMemo(() => {
    if (!q) return [];
    const s = q.toLowerCase(), seen = new Set<string>(), out: [Product, Category][] = [];
    cats.forEach((cat) => cat.products.forEach((p) => { if (!seen.has(p.id) && p.title.toLowerCase().includes(s)) { seen.add(p.id); out.push([p, cat]); } }));
    return out;
  }, [cats, q]);

  React.useEffect(() => {
    if (q) return;
    const io = new IntersectionObserver((es) => {
      if (lockSpy.current) return;
      const v = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (v) onSpy((v.target as HTMLElement).dataset.sec!);
    }, { rootMargin: "-170px 0px -65% 0px" });
    document.querySelectorAll("[data-sec]").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [cats, q, onSpy, lockSpy]);

  if (q) {
    return hits.length ? (
      <section className="section">
        <h2>Results</h2>
        <div className="n">{hits.length} item{hits.length === 1 ? "" : "s"} matching “{q}”</div>
        <div className="grid">{hits.map(([p, cat]) => <Card key={p.id} p={p} cat={cat} pulse={pulseId === p.id} onOpen={onOpen} onAdd={onAdd} />)}</div>
      </section>
    ) : (
      <div className="empty"><h3>Nothing matches “{q}”</h3><p>Check the spelling or <button className="link" onClick={onClear}>clear the search</button> to see the full menu.</p></div>
    );
  }
  return (
    <>
      {degraded && <div className="banner">Showing the last saved menu. Live availability couldn’t be loaded in this view; prices are confirmed at checkout on Beepit.</div>}
      {cats.map((cat) => (
        <section className="section" id={"cat-" + cat.id} data-sec={cat.id} key={cat.id}>
          <h2>{cat.name}</h2>
          <div className="n">{cat.products.length} item{cat.products.length === 1 ? "" : "s"}</div>
          <div className="grid">{cat.products.map((p) => <Card key={p.id} p={p} cat={cat} pulse={pulseId === p.id} onOpen={onOpen} onAdd={onAdd} />)}</div>
        </section>
      ))}
    </>
  );
}
