import snapshot from "@/data/menu.snapshot.json";

export const BEEP = "https://whiteland.beepit.com";
export const ORDER_URL = BEEP + "/ordering/?type=";
export const MIN_ORDER = 35;

export type Option = { id: string; label: string; out: boolean };
export type Variation = { id: string; name: string; type: string; min: number | null; max: number | null; opts: Option[] };
export type Product = { id: string; title: string; price: number; was: number | null; img: string; out: boolean; featured: boolean; desc: string; vars: Variation[] };
export type Category = { id: string; name: string; best: boolean; enabled: boolean; products: Product[] };
export type Sel = Record<string, string[]>;
export type CartLine = { key: string; id: string; title: string; price: number; qty: number; img: string; choices: string[] };

/* eslint-disable @typescript-eslint/no-explicit-any */
type SnapProduct = [string, string, number, number | null, string, boolean, boolean, string, [string, string, number | null, number | null, [string, string, boolean][]][]];
type SnapCat = [string, string, boolean, boolean, SnapProduct[]];

export function normSnap(arr: SnapCat[]): Category[] {
  return arr.map((c) => ({
    id: c[0],
    name: c[1].trim(),
    best: c[2],
    enabled: c[3],
    products: c[4].map((p) => ({
      id: p[0], title: p[1], price: p[2], was: p[3], img: p[4], out: p[5], featured: p[6], desc: p[7],
      vars: p[8].map((v, i) => ({
        id: p[0] + ":" + i, name: v[0], type: v[1], min: v[2], max: v[3],
        opts: v[4].map((o) => ({ id: o[0], label: o[1], out: o[2] })),
      })),
    })),
  }));
}

export function normLive(list: any[]): Category[] {
  return list.map((c) => ({
    id: c.id, name: (c.name || "").trim(), best: !!c.isBestSeller, enabled: c.isEnabled !== false,
    products: (c.products || []).map((p: any) => ({
      id: p.id, title: p.title, price: p.displayPrice, was: p.originalDisplayPrice ?? null, img: (p.images || [])[0] || "",
      out: !!p.markedSoldOut || (p.stockStatus && p.stockStatus !== "inStock"), featured: !!p.isFeaturedProduct,
      desc: p.descriptionPlainText || p.description || "",
      vars: (p.variations || []).map((v: any) => ({
        id: v.id, name: v.name, type: v.variationType, min: v.minSelectionAmount, max: v.maxSelectionAmount,
        opts: (v.optionValues || []).map((o: any) => ({ id: o.id, label: o.value, out: !!o.markedSoldOut })),
      })),
    })),
  }));
}

/** Hide disabled / empty / duplicate-named categories. */
export function cleanCats(cs: Category[]): Category[] {
  const seen = new Set<string>();
  return cs.filter((c) => c.enabled && c.products.length && !seen.has(c.name.toLowerCase()) && seen.add(c.name.toLowerCase()));
}

export const SNAPSHOT_CATS: Category[] = cleanCats(normSnap(snapshot.categories as unknown as SnapCat[]));

/** Try the live Beep menu; resolves null when it is unreachable (usually blocked by CORS off-site). */
export async function fetchLive(): Promise<Category[] | null> {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 4000);
    const r = await fetch(BEEP + "/api/gql/OnlineCategory", {
      method: "POST", signal: ctl.signal, headers: { "content-type": "application/json" },
      body: JSON.stringify({ operationName: "OnlineCategory", query: "query OnlineCategory($business:String!){onlineCategory(business:$business){id}}", variables: { business: "whiteland" } }),
    });
    clearTimeout(t);
    const j = await r.json();
    if (!j?.data?.onlineCategory?.length) return null;
    const cs = cleanCats(normLive(j.data.onlineCategory));
    return cs.length ? cs : null;
  } catch {
    return null;
  }
}

export const rm = (n: number) => "RM " + Number(n).toFixed(2);
export const labelFor = (p: Product, cat?: Category) => (cat?.best || p.featured ? "Best Seller" : cat && /must try/i.test(cat.name) ? "Must Try" : "");
export const defaultSel = (p: Product): Sel => {
  const sel: Sel = {};
  p.vars.forEach((v) => {
    sel[v.id] = [];
    if (v.type === "SingleChoice") { const f = v.opts.find((o) => !o.out); if (f) sel[v.id] = [f.id]; }
  });
  return sel;
};
export const toggleOpt = (p: Product, sel: Sel, vid: string, oid: string): Sel => {
  const v = p.vars.find((x) => x.id === vid)!;
  if (v.type === "SingleChoice") return { ...sel, [vid]: [oid] };
  const s = new Set(sel[vid]);
  if (s.has(oid)) s.delete(oid); else s.add(oid);
  if (v.max && s.size > v.max) s.delete(oid);
  return { ...sel, [vid]: [...s] };
};
export const missingOption = (p: Product, sel: Sel) => p.vars.find((v) => (v.min ?? 0) > 0 && (sel[v.id] || []).length < (v.min ?? 0));
