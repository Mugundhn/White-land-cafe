import snapshot from "../data/menu.snapshot.json";

export type Favourite = { id: string; title: string; price: number; img: string; category: string };

type Row = [string, string, number, number | null, string, boolean, boolean, string, unknown[]];

/** Product photos and prices come straight from the menu snapshot (data/menu.snapshot.json), not retyped here. */
export function getFavourites(max = 8): Favourite[] {
  const seen = new Set<string>();
  const out: Favourite[] = [];
  for (const c of snapshot.categories as unknown as [string, string, boolean, boolean, Row[]][]) {
    for (const p of c[4]) {
      if (!p[4] || p[5] || seen.has(p[0])) continue;
      seen.add(p[0]);
      out.push({ id: p[0], title: p[1], price: p[2], img: p[4], category: c[1].trim() });
    }
  }
  return out.slice(0, max);
}
