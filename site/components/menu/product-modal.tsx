"use client";
import * as React from "react";
import { defaultSel, missingOption, rm, toggleOpt, type Product, type Sel } from "@/lib/menu-data";
import { Thumb } from "./thumb";

export function ProductModal({ p, onClose, onAdd }: { p: Product; onClose: () => void; onAdd: (p: Product, sel: Sel, qty: number) => void }) {
  const [sel, setSel] = React.useState<Sel>(() => defaultSel(p));
  const [qty, setQty] = React.useState(1);
  const [err, setErr] = React.useState("");
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => { ref.current?.querySelector<HTMLElement>("input:checked, input, .m-x")?.focus(); }, []);

  const confirm = () => {
    const bad = missingOption(p, sel);
    if (bad) { setErr(`Please choose an option for ${bad.name}.`); return; }
    onAdd(p, sel, qty);
  };

  return (
    <div className="modal" ref={ref} role="dialog" aria-modal="true" aria-labelledby="mTitle">
      <div className="m-img"><Thumb src={p.img} alt={p.title} /><button className="m-x" onClick={onClose} aria-label="Close">×</button></div>
      <div className="m-body">
        <h2 id="mTitle">{p.title}</h2>
        <div className="price">{rm(p.price)}</div>
        {p.desc && <p>{p.desc}</p>}
        {p.vars.map((v) => {
          const single = v.type === "SingleChoice";
          return (
            <fieldset key={v.id}>
              <legend>{v.name}<em>{single ? "Choose 1" : v.max ? `Up to ${v.max}` : "Optional"}</em></legend>
              {v.opts.map((o) => (
                <label key={o.id} className={"opt" + (o.out ? " so" : "")}>
                  <input type={single ? "radio" : "checkbox"} name={v.id} value={o.id} checked={sel[v.id].includes(o.id)} disabled={o.out}
                    onChange={() => { setSel((s) => toggleOpt(p, s, v.id, o.id)); setErr(""); }} />
                  <span>{o.label}</span>
                  {o.out && <span className="em">Sold out</span>}
                </label>
              ))}
            </fieldset>
          );
        })}
        <div className="err" role="alert">{err}</div>
      </div>
      <div className="m-foot">
        <div className="qty">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
          <span aria-live="polite">{qty}</span>
          <button onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="Increase quantity">+</button>
        </div>
        <button className="cta" onClick={confirm}>Add to cart · {rm(p.price * qty)}</button>
      </div>
    </div>
  );
}
