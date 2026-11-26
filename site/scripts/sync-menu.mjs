// Copies the flip-book ordering menu (kept one level up, in D:\Nov) into public/menu so the site serves it at /menu/.
// The menu stays the single source of truth; run automatically before dev/build.
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "..", "..");
const out = join(here, "..", "public", "menu");

if (!existsSync(join(src, "index.html")) || !existsSync(join(src, "data", "menu.snapshot.json"))) {
  console.warn("[sync-menu] ../index.html or ../data not found; keeping existing public/menu");
  process.exit(0);
}
mkdirSync(out, { recursive: true });
for (const f of ["styles.css", "app.js"]) cpSync(join(src, f), join(out, f));
for (const d of ["data", "vendor"]) cpSync(join(src, d), join(out, d), { recursive: true });
// logo files only (skip the 2000px original and the build script)
cpSync(join(src, "assets"), join(out, "assets"), { recursive: true, filter: (f) => !/\.py$|white-land-logo\.png$/.test(f) });
// <base> lets /menu and /menu/ both resolve the relative asset paths.
let html = readFileSync(join(src, "index.html"), "utf8");
if (!html.includes("<base ")) html = html.replace("<head>", '<head>\n<base href="/menu/">');
// "Back to website" link, placed inside the announcement strip so it never covers the menu
if (!html.includes("back-home")) html = html.replace('<div class="promo" role="note">', '<div class="promo" role="note"><a class="back-home" href="/" style="color:#fff;text-decoration:underline;text-underline-offset:3px;font-weight:600">&larr; Back to website</a><i aria-hidden="true">&middot;</i>');
writeFileSync(join(out, "index.html"), html);
console.log("[sync-menu] public/menu updated");
