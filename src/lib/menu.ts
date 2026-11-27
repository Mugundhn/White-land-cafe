export interface MenuRow { id: string; title: string; priceMinor: number; imageUrl: string; categoryId: string; category: string; hidden: boolean }
export type Favourite = { id: string; title: string; price: number; img: string; category: string }
/** Same snapshot traversal, hidden/image/duplicate filters and limit as the source; prices are stored in sen. */
export function getFavourites(rows: MenuRow[], max = 8): Favourite[] {
  const seen = new Set<string>()
  const out: Favourite[] = []
  for (const p of rows) {
    if (!p.imageUrl || p.hidden || seen.has(p.id)) continue
    seen.add(p.id)
    out.push({ id: p.id, title: p.title, price: p.priceMinor / 100, img: p.imageUrl, category: p.category.trim() })
  }
  return out.slice(0, max)
}
