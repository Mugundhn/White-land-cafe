// Builds a static copy of the site into ./out for Firebase Hosting.
import { spawnSync } from "node:child_process";
const r = spawnSync("npx", ["next", "build"], { stdio: "inherit", shell: true, env: { ...process.env, STATIC_EXPORT: "1" } });
process.exit(r.status ?? 1);
