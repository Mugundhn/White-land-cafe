# White Land website

Next.js (App Router) + TypeScript + Tailwind CSS v4 + shadcn project structure,
with a scroll-driven hero and the Coffee Pour Menu component.

## Run it

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Starting from your own project instead

If you already have a project that is missing a piece, add it like this:

```bash
# New project with TypeScript + Tailwind
npx create-next-app@latest white-land --typescript --tailwind --app --eslint

# shadcn structure (creates components.json, lib/utils.ts, the @/ alias)
npx shadcn@latest init

# Dependencies the component and site use
npm install motion lucide-react
```

Then copy `components/ui/coffee-pour-menu.tsx`, `components/site/*`, `lib/content.ts`
and `app/*` from this folder.

## Where things live

| Path | What |
| --- | --- |
| `components/ui/coffee-pour-menu.tsx` | The pour menu, copied unchanged |
| `components/demos/coffee-pour-menu-demo.tsx` | The original demo, for reference |
| `components/site/` | Page sections: nav, hero, about, coffee, kitchen, visit |
| `lib/content.ts` | All copy, hours, phone, ordering link, drinks and image URLs |
| `lib/utils.ts` | shadcn's `cn()` helper, which the component imports |
| `app/globals.css` | Tailwind import and the White Land palette |

### Why `/components/ui`?

shadcn's CLI writes every component to the `ui` alias in `components.json`
(`@/components/ui`). Keeping third-party and shadcn primitives there means
`npx shadcn add ...` lands next to them, imports such as
`@/components/ui/coffee-pour-menu` resolve the same way in every project, and your
own page sections (`components/site`) stay separate from reusable building blocks.
If your project uses a different folder (for example `src/components`), update the
`aliases` in `components.json` and the `@/*` path in `tsconfig.json` to match.

## Component notes

- **Props:** `items` (drinks), `defaultValue` or `value` + `onValueChange` (controlled),
  `className`. Drinks are defined in `lib/content.ts`; each one picks a `vessel`
  (`demitasse`, `glass-mug`, `cup`, `tall-glass`) and a list of `layers` that pour in order.
- **State:** self-contained. No context providers needed. Use `value`/`onValueChange`
  if another part of the page should know which drink is selected.
- **Assets:** none; the cups are drawn in SVG.
- **Responsive:** two-column on `sm` and up, a 2x2 button grid above the stage on phones.
- **Motion:** respects `prefers-reduced-motion` (cups fade in pre-filled). The hero and
  the lit paragraph also switch to static layouts.

## Before launch

- Online ordering goes to Beep (`ORDER_URL` in `lib/content.ts`). It appears in the nav,
  hero, coffee, kitchen and visit sections.

- Confirm hours, phone and the menu descriptions with the café (`lib/content.ts`).
  The dish notes are placeholders.
- Replace the Unsplash placeholders with the café's own photos: put files in
  `/public` and change the `src` values in `IMAGES`.

## Added in this build
- **Scroll effects:** hero window that opens (existing), lit-up paragraph (existing), plus a top scroll-progress line, a pinned **Favourites** section that slides sideways as you scroll (`components/site/favourites.tsx`, photos and prices read from the menu snapshot via `lib/menu.ts`), parallax photos (`parallax.tsx`) and fade-up reveals (`reveal.tsx`). All respect reduced-motion.
- **Ordering:** every "Order" link now opens the flip-book menu at `/menu/` (`MENU_URL` in `lib/content.ts`); its checkout continues on Beep. `scripts/sync-menu.mjs` copies the menu from the folder above (`D:\Nov`) into `public/menu` before `dev`/`build`, so edit the menu there, not in `public/menu`.
- **Dependencies:** `next` bumped to 15.1.12 (15.1.6 has a published security advisory).
