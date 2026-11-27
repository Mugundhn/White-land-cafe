"use client";
import * as React from "react";
import { MIN_ORDER, rm, type CartLine, type Product } from "@/lib/menu-data";

type Props = {
  cart: CartLine[];
  sheet: boolean;
  suggestions: Product[];
  onClose?: () => void;
  onInc: (i: number) => void;
  onDec: (i: number) => void;
  onRemove: (i: number) => void;
  onSuggest: (p: Product) => void;
  onCheckout: () => void;
};

export const cartTotal = (cart: CartLine[]) => cart.reduce((s, l) => s + l.price * l.qty, 0);
export const cartCount = (cart: CartLine[]) => cart.reduce((s, l) => s + l.qty, 0);

export function CartView({ cart, sheet, suggestions, onClose, onInc, onDec, onRemove, onSuggest, onCheckout }: Props) {
  const t = cartTotal(cart), n = cartCount(cart), short = Math.max(0, MIN_ORDER - t), ok = t >= MIN_ORDER;
  const head = (
    <div className="cart-h">
      <h3>Your order</h3>
      {sheet && <button onClick={onClose} aria-label="Close cart">×</button>}
    </div>
  );
  if (!n) {
    return (
      <div className="cart-in">
        {head}
        <div className="cart-empty">
          <div className="ce-ico" aria-hidden="true">☕</div>
          <h4>Your cart is empty</h4>
          <p>Pick something from the menu, or start with a favourite:</p>
          {suggestions.map((p) => (
            <button key={p.id} className="sug" onClick={() => onSuggest(p)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {p.img && <img src={p.img} alt="" loading="lazy" />}
              <span>{p.title}<em>{rm(p.price)}</em></span>
              <b>+</b>
            </button>
          ))}
          <p className="ce-min">Minimum order {rm(MIN_ORDER)}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="cart-in">
      {head}
      <div className="lines">
        {cart.map((l, i) => (
          <div className="line" key={l.key}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {l.img ? <img className="l-th" src={l.img} alt="" loading="lazy" /> : <div className="l-th ph2">WL</div>}
            <span className="l-name">{l.title}</span>
            <span className="l-price">{rm(l.price * l.qty)}</span>
            {l.choices.length > 0 && <span className="l-sub">{l.choices.join(", ")}</span>}
            <div className="l-qty">
              <div className="qty">
                <button onClick={() => onDec(i)} aria-label={`Decrease quantity of ${l.title}`}>−</button>
                <span aria-live="polite">{l.qty}</span>
                <button onClick={() => onInc(i)} aria-label={`Increase quantity of ${l.title}`}>+</button>
              </div>
              <button className="l-rm" onClick={() => onRemove(i)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-f">
        <div className="sub"><span>{n} item{n > 1 ? "s" : ""}</span><span></span></div>
        <div className="tot"><span>Subtotal</span><span>{rm(t)}</span></div>
        <div className={"min" + (ok ? " ok" : "")}>
          {ok ? "Minimum order met" : `Add ${rm(short)} more to reach the ${rm(MIN_ORDER)} minimum`}
          <div className="bar"><i style={{ width: `${Math.min(100, (t / MIN_ORDER) * 100)}%` }} /></div>
        </div>
        <button className="cta" onClick={onCheckout} disabled={!ok}>Continue to checkout</button>
        <p className="note">Delivery fee, time slot and payment are confirmed on Beepit.</p>
      </div>
    </div>
  );
}
