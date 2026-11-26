# White Land ordering redesign: testing report

Files: `index.html`, `styles.css`, `app.js`, `data/menu.snapshot.json`, `TESTING.md`.
Run: `python -m http.server 5173` in this folder, open http://localhost:5173/.

## Architecture
- Menu: tries the live Beepit `OnlineCategory` endpoint, then falls back to `data/menu.snapshot.json` (captured 2026-11-26 from that endpoint). Categories, prices, images and options are read from data; nothing is hardcoded in markup.
- Cart: local (localStorage). Checkout opens the Beepit ordering page.
- Payment, delivery fee, store/time-slot logic: not touched, still on Beepit.

## Passed (browser-tested, desktop 1440 + mobile 375)
- Categories built from data, de-duplicated, empty ones hidden (FILTER COFFEE); sticky nav, smooth scroll, active indicator.
- Grid: 4 cols desktop, 2 cols mobile; image placeholders for products without photos.
- Add simple item; option item opens modal (MILK/OATSIDE preselected); qty changes the button price live.
- Cart: totals, +/- quantity, remove at 0, persistence across reload.
- RM35 minimum: RM30 -> checkout disabled with "Add RM 5.00 more"; RM48 -> enabled.
- Search: instant filter, no-results state, clear button.
- Mobile: sticky bottom cart bar, bottom-sheet cart, no horizontal scroll.

## Known limits (need your decision)
1. **CORS blocks live data and cart.** Beepit's API doesn't allow requests from other origins (confirmed in console), so this page runs on the snapshot and can't create a Beepit cart. Checkout therefore opens Beepit's own page with an empty cart; items must be re-added there. A true cart handoff needs either hosting this UI on the whiteland.beepit.com origin (Beepit custom CSS/JS) or a Beepit-provided API/deep link.
2. Store, location and time-slot chips link to Beepit; they aren't implemented here (no store/slot data accessed).
3. The menu data only offers milk option and bean size. Hot/iced, sugar, size, extras, shots and special instructions are not in the data, so they are not built. Option prices aren't exposed either (OATSIDE shows no surcharge).
4. Product photos are ~2800px originals from Beepit's CDN: slow to load. Ask Beepit for resized variants.
5. Not tested: real checkout, store selection, time slots, tablet widths, other browsers.

## Book view (added)
Default view; a Book/Grid toggle sits beside search.
- Left page: image + name + label (fixed per product). Right page: price, options (milk / bean size), quantity, **Add to cart** and **Get now** (adds, then opens the cart).
- One chapter per category; category tabs switch chapters. Page turn via arrows, thumbnails, keyboard arrows or swipe (mobile). Search results become their own book.
- Mobile: image page on top, details below.
- Tested in browser: chapter switch, page turn, option + quantity pricing, Add to cart, Get now, arrow keys, search, Grid toggle; no console errors. (superseded by page-flip below) Page turn was a 1.7 s 3D flip (desktop); checked by seeking the animation to a mid-frame. Clicks are ignored while a page is mid-turn. Mobile and reduced-motion use a simple slide.

## Responsive pass
Book height, type, grid columns and cart width now scale with the screen (vw/dvh/clamp), up to 2200px containers on large monitors.
Measured, no horizontal scroll at any size: 1920x1080 and 1366x768 (book + arrows fit on screen), 768x1024 tablet (fits), 375x812 phone (stacked pages), 844x390 phone landscape (two pages, details scroll inside the page; the arrow row sits ~60px below the fold, so the page scrolls slightly).
Not tested on real devices or 4K.

## Page-turn smoothing
Fixes for the "flash" look: photos preloaded/decoded before the turn starts and not lazy inside the turning page; the page that was swapped at the end is swapped while the leaf still covers it; shadows fade by opacity only (no gradient jumps); symmetric ease, 1.9 s, light sweep across the paper. Verified by sampling the animation at 0/475/950/1425/1900 ms (rotation -0° → -45° → -90° → -135° → -180°, shadow 0 → 1 → 0), both forward and back, no leftover elements, no console errors. Real-time smoothness on your GPU not measured.

## Friendliness / visual pass
Announcement strip (minimum order, delivery/takeaway); category counts; paper-style book (stacked page edges, curled corner, spine, page numbers, accent rule); option cards with clear selected state; "Add to cart" turns green "Added ✓"; toast with a View cart shortcut; cart badge bump; cart lines with photos; empty cart shows three one-tap suggestions; page-turn hint (keys on desktop, swipe on touch). Checked: empty-cart suggestions, suggestion add, Added ✓ state, page numbers, hint, desktop screenshot at 1500px. Not re-tested on mobile after this pass.

## Flip engine swap (page-flip)
The hand-made CSS turn was replaced by the `page-flip` engine (MIT, the engine @vuvandinh203/react-flipbook wraps; saved as `vendor/page-flip.browser.js`, v2.0.7). Photo + details are real pages (product i = pages 2i, 2i+1); curl, shadows, drag-a-corner and swipe come from the engine. Options are buttons so clicks work inside pages; click-to-flip is off so tapping text/options never turns the page.
Verified in the browser: next/prev/jump (thumbnails) forward and back, real mouse click on an option (selects, no flip), qty/price, add to cart, phone portrait mode (photo page then details page, arrows step per page). Page-turn smoothness itself could not be judged here (preview pane runs animations at ~2 fps); please check on your screen.
