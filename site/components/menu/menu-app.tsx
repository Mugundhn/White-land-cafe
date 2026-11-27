"use client";
import * as React from "react";
import {
  MIN_ORDER, ORDER_URL, SNAPSHOT_CATS, fetchLive, rm,
  type CartLine, type Category, type Product, type Sel,
} from "@/lib/menu-data";
import { Book, type BookItem } from "./book";
import { CartView, cartCount, cartTotal } from "./cart-view";
import { GridView } from "./grid-view";
import { ProductModal } from "./product-modal";

type Mode = "delivery" | "takeaway";
type View = "book" | "grid";

const store = {
  get<T>(k: string, d: T): T {
    try { const v = localStorage.getItem(k); return v === null ? d : (JSON.parse(v) as T) ?? d; } catch { return d; }
  },
  set(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } },
};

export function MenuApp() {
  const [cats, setCats] = React.useState<Category[]>(SNAPSHOT_CATS);
  const [degraded, setDegraded] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>("delivery");
  const [view, setView] = React.useState<View>("book");
  const [cart, setCart] = React.useState<CartLine[]>([]);
  const [q, setQ] = React.useState("");
  const [bookCat, setBookCat] = React.useState(SNAPSHOT_CATS[0].id);
  const [bi, setBi] = React.useState(0);
  const [spy, setSpy] = React.useState("all");
  const [sheet, setSheet] = React.useState(false);
  const [modal, setModal] = React.useState<Product | null>(null);
  const [toast, setToast] = React.useState<{ msg: string; on: boolean }>({ msg: "", on: false });
  const [pulseId, setPulseId] = React.useState("");
  const [bump, setBump] = React.useState(0);
  const [stuck, setStuck] = React.useState(false);
  const topRef = React.useRef<HTMLElement>(null);
  const lockSpy = React.useRef(false);
  const lastFocus = React.useRef<HTMLElement | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  /* ---------- load saved choices + live menu ---------- */
  React.useEffect(() => {
    setMode(store.get<Mode>("wl.mode", "delivery"));
    setView(store.get<View>("wl.view", "book"));
    setCart(store.get<CartLine[]>("wl.cart", []));
    setMounted(true);
    fetchLive().then((cs) => { if (cs) { setCats(cs); setDegraded(false); } });
  }, []);
  React.useEffect(() => { if (mounted) store.set("wl.mode", mode); }, [mode, mounted]);
  React.useEffect(() => { if (mounted) store.set("wl.view", view); }, [view, mounted]);
  React.useEffect(() => { if (mounted) store.set("wl.cart", cart); }, [cart, mounted]);

  const products = React.useMemo(() => {
    const m = new Map<string, Product>();
    cats.forEach((c) => c.products.forEach((p) => m.set(p.id, p)));
    return m;
  }, [cats]);

  // drop stale cart lines whose product no longer exists
  React.useEffect(() => {
    if (!mounted) return;
    setCart((c) => (c.every((l) => products.has(l.id)) ? c : c.filter((l) => products.has(l.id))));
  }, [products, mounted]);

  /* ---------- sticky header ---------- */
  React.useEffect(() => {
    const top = topRef.current;
    if (!top) return;
    const set = () => document.documentElement.style.setProperty("--top-h", top.offsetHeight + "px");
    const onScroll = () => { setStuck(window.scrollY > 40); set(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", set);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(set) : null;
    ro?.observe(top);
    set(); onScroll();
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", set); ro?.disconnect(); };
  }, []);

  /* ---------- book list ---------- */
  const bookCatId = bookCat === "all" || cats.some((c) => c.id === bookCat) ? bookCat : cats[0].id;
  const items = React.useMemo<BookItem[]>(() => {
    const seen = new Set<string>(), out: BookItem[] = [];
    if (q) {
      const s = q.toLowerCase();
      cats.forEach((cat) => cat.products.forEach((p) => { if (!seen.has(p.id) && p.title.toLowerCase().includes(s)) { seen.add(p.id); out.push([p, cat]); } }));
      return out;
    }
    if (bookCatId === "all") {
      cats.forEach((cat) => cat.products.forEach((p) => { if (!seen.has(p.id)) { seen.add(p.id); out.push([p, cat]); } }));
      return out;
    }
    const cat = cats.find((c) => c.id === bookCatId) || cats[0];
    return cat.products.map((p) => [p, cat] as BookItem);
  }, [cats, q, bookCatId]);
  const bookTitle = q ? `Results for “${q}”` : bookCatId === "all" ? "All Items" : (cats.find((c) => c.id === bookCatId) || cats[0]).name;
  const active = view === "book" ? bookCatId : spy;

  React.useEffect(() => {
    document.querySelector(".cat[aria-current=true]")?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [active]);

  /* ---------- cart ---------- */
  const total = cartTotal(cart), count = cartCount(cart);
  const showToast = (msg: string) => {
    setToast({ msg, on: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, on: false })), 3200);
  };
  const addLine = (p: Product, sel: Sel, qty: number) => {
    const key = p.id + "|" + Object.values(sel).flat().sort().join(",");
    const choices = p.vars.flatMap((v) => (sel[v.id] || []).map((oid) => v.opts.find((o) => o.id === oid)?.label).filter((x): x is string => !!x));
    setCart((c) => {
      const ex = c.find((l) => l.key === key);
      if (ex) return c.map((l) => (l === ex ? { ...l, qty: l.qty + qty } : l));
      return [...c, { key, id: p.id, title: p.title, price: p.price, qty, img: p.img, choices }];
    });
    showToast(`${p.title} added to cart`);
    setBump((b) => b + 1);
    setPulseId(p.id);
    setTimeout(() => setPulseId(""), 700);
  };
  const openSheet = () => { lastFocus.current = document.activeElement as HTMLElement; setSheet(true); };
  const closeAll = React.useCallback(() => {
    setSheet(false); setModal(null);
    lastFocus.current?.focus?.();
  }, []);
  const openModal = (p: Product) => { lastFocus.current = document.activeElement as HTMLElement; setModal(p); };
  const checkout = () => { if (total >= MIN_ORDER) window.open(ORDER_URL + mode, "_blank", "noopener"); };

  React.useEffect(() => {
    document.body.style.overflow = modal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modal]);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeAll(); };
    document.addEventListener("keydown", onKey);
    const mq = matchMedia("(min-width:1100px)");
    mq.addEventListener("change", closeAll);
    return () => { document.removeEventListener("keydown", onKey); mq.removeEventListener("change", closeAll); };
  }, [closeAll]);

  const suggestions = React.useMemo(() => [...products.values()].filter((p) => !p.out && (p.featured || p.img)).slice(0, 3), [products]);
  const suggest = (p: Product) => {
    if (!p.vars.length) return addLine(p, {}, 1);
    if (view !== "book") return openModal(p);
    const cat = cats.find((c) => c.products.some((x) => x.id === p.id))!;
    closeAll(); setQ(""); setBookCat(cat.id); setBi(cat.products.findIndex((x) => x.id === p.id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------- navigation ---------- */
  const goCat = (id: string) => {
    if (view === "book") {
      setQ("");
      if (id !== bookCatId || q) { setBookCat(id); setBi(0); }
      return window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (q) setQ("");
    lockSpy.current = true; setSpy(id);
    window.setTimeout(() => {
      if (id === "all") window.scrollTo({ top: 0, behavior: "smooth" });
      else document.getElementById("cat-" + id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, q ? 50 : 0);
    window.setTimeout(() => { lockSpy.current = false; }, 800);
  };
  const changeView = (v: View) => { setView(v); setBi(0); setSpy("all"); window.scrollTo({ top: 0 }); };
  const onSpy = React.useCallback((id: string) => setSpy(id), []);
  const setQuery = (v: string) => { setQ(v.trim()); setBi(0); };

  const cartProps = {
    cart, suggestions,
    onInc: (i: number) => setCart((c) => c.map((l, j) => (j === i ? { ...l, qty: l.qty + 1 } : l))),
    onDec: (i: number) => setCart((c) => (c[i].qty > 1 ? c.map((l, j) => (j === i ? { ...l, qty: l.qty - 1 } : l)) : c.filter((_, j) => j !== i))),
    onRemove: (i: number) => setCart((c) => c.filter((_, j) => j !== i)),
    onSuggest: suggest, onCheckout: checkout,
  };

  return (
    <>
      <a className="skip" href="#menu">Skip to menu</a>

      <div className="promo" role="note">
        <a className="back-home" href="/" style={{ color: "#fff", textDecoration: "underline", textUnderlineOffset: 3, fontWeight: 600 }}>&larr; Back to website</a><i aria-hidden="true">·</i>
        <span>Freshly roasted specialty coffee</span><i aria-hidden="true">·</i><span>Minimum order RM 35</span><i aria-hidden="true">·</i><span>Delivery &amp; takeaway</span>
      </div>

      <header className={"top" + (stuck ? " stuck" : "")} ref={topRef}>
        <div className="top-row">
          <a className="brand" href="/menu/" aria-label="White Land Specialty Coffee">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="brand-logo" src="/logo-dark.png" width={530} height={900} alt="White Land" />
            <span className="brand-sub">SPECIALTY<br />COFFEE</span>
          </a>
          <div className="modes" role="group" aria-label="Order type">
            {(["delivery", "takeaway"] as const).map((m) => (
              <button key={m} className="mode" aria-pressed={mode === m} onClick={() => setMode(m)}>{m === "delivery" ? "Delivery" : "Takeaway"}</button>
            ))}
          </div>
          <button className="cart-btn" onClick={openSheet} aria-label="Open cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></svg>
            {count > 0 && <span className="badge bump" key={bump}>{count}</span>}
          </button>
        </div>
        <div className="chips">
          <a className="chip" href={ORDER_URL + mode} target="_blank" rel="noopener"><b>Store</b><span>Select store</span></a>
          {mode === "delivery" && <a className="chip" href={ORDER_URL + mode} target="_blank" rel="noopener"><b>Location</b><span>Select location</span></a>}
          <a className="chip" href={ORDER_URL + mode} target="_blank" rel="noopener"><b>Time</b><span>Select time slot</span></a>
        </div>
      </header>

      <div className="subbar" id="subbar">
        <nav className="cats" id="cats" aria-label="Menu categories">
          {[{ id: "all", name: "All Items", n: 0 }, ...cats.map((c) => ({ id: c.id, name: c.name, n: c.products.length }))].map((c) => (
            <button key={c.id} className="cat" aria-current={active === c.id} onClick={() => goCat(c.id)}>{c.name}{c.n > 0 && <sup>{c.n}</sup>}</button>
          ))}
        </nav>
        <div className="views" role="group" aria-label="View">
          <button className="vw" aria-pressed={view === "book"} onClick={() => changeView("book")}>Book</button>
          <button className="vw" aria-pressed={view === "grid"} onClick={() => changeView("grid")}>Grid</button>
        </div>
        <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4-4" /></svg>
          <input id="q" type="search" placeholder="Search the menu" aria-label="Search the menu" autoComplete="off" value={q} onChange={(e) => setQuery(e.target.value)} />
          {q && <button type="button" id="qClear" aria-label="Clear search" onClick={() => setQuery("")}>×</button>}
        </form>
      </div>

      <div className="layout">
        <main id="menu" tabIndex={-1}>
          <div id="status" role="status" className="sr">{view === "book" && items.length ? `${bookTitle}, ${items.length} items` : ""}</div>
          <div id="content">
            {!mounted ? (
              <section className="section">
                <div className="sk" style={{ height: 30, width: 220, marginBottom: 20 }} />
                <div className="grid">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i}><div className="sk" style={{ aspectRatio: "4/5" }} /><div className="sk" style={{ height: 14, marginTop: 10, width: "80%" }} /><div className="sk" style={{ height: 14, marginTop: 8, width: "30%" }} /></div>
                  ))}
                </div>
              </section>
            ) : view === "book" ? (
              items.length ? (
                <Book key={q + "|" + bookCatId} items={items} title={bookTitle} bi={Math.min(bi, items.length - 1)} setBi={setBi}
                  onAdd={(p, sel, qty, now) => { addLine(p, sel, qty); if (now) openSheet(); }} keysActive={!modal && !sheet} />
              ) : (
                <div className="empty"><h3>Nothing matches “{q}”</h3><p>Check the spelling or <button className="link" onClick={() => setQuery("")}>clear the search</button> to see the full menu.</p></div>
              )
            ) : (
              <GridView cats={cats} q={q} degraded={degraded} pulseId={pulseId} onOpen={openModal}
                onAdd={(p) => (p.vars.length ? openModal(p) : addLine(p, {}, 1))} onSpy={onSpy} lockSpy={lockSpy} onClear={() => setQuery("")} />
            )}
          </div>
        </main>
        <aside className="cart-panel" id="cartPanel" aria-label="Your order"><CartView {...cartProps} sheet={false} /></aside>
      </div>

      <div className="mobile-bar" hidden={count === 0}>
        <button onClick={openSheet}><span className="mb-count">{count}</span><span>View cart</span><strong>{rm(total)}</strong></button>
      </div>

      {(sheet || modal) && <div className={"scrim" + (sheet ? " for-sheet" : "")} onClick={closeAll} />}
      {sheet && (
        <div className="sheet" role="dialog" aria-modal="true" aria-label="Your order">
          <CartView {...cartProps} sheet onClose={closeAll} />
        </div>
      )}
      {modal && <ProductModal p={modal} onClose={closeAll} onAdd={(p, sel, qty) => { addLine(p, sel, qty); closeAll(); }} />}

      <div className={"toast" + (toast.on ? " on" : "")} role="status" aria-live="polite" style={{ pointerEvents: toast.on ? "auto" : "none" }}>
        <span>✓ {toast.msg}</span>
        <button onClick={() => { setToast((t) => ({ ...t, on: false })); if (matchMedia("(min-width:1100px)").matches) document.getElementById("cartPanel")?.scrollIntoView({ behavior: "smooth", block: "nearest" }); else openSheet(); }}>View cart</button>
      </div>
    </>
  );
}
