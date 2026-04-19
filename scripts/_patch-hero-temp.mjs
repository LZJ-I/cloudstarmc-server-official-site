import fs from "node:fs";
import path from "node:path";
import url from "node:url";
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const p = path.join(__dirname, "patch-hero-perf-aesthetic.mjs");
let s = fs.readFileSync(p, "utf8");
const oldMain = /\.hero__photo \{[\s\S]*?transition: box-shadow 0\.55s var\(--ease\);\n\}/;
s = s.replace(
  oldMain,
  `.hero__photo {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: 0;
  overflow: hidden;
  background: #070712;
  box-shadow: none;
  transition: box-shadow 0.55s var(--ease);
}`
);
const oldLoaded = /\.hero__photo\.is-loaded \{[\s\S]*?\n\}/;
s = s.replace(
  oldLoaded,
  `.hero__photo.is-loaded {
  box-shadow: inset 0 0 120px rgba(0, 0, 0, 0.35);
}`
);
s = s.replace(/object-position: 50% 44%;/g, "object-position: 50% 42%;");
s = s.replace(/transform-origin: 50% 44%;/g, "transform-origin: 50% 42%;");
s = s.replace(/at 50% 44%/g, "at 50% 42%");
s = s.replace(/scale\(1\.06\)/g, "scale(1.05)");
fs.writeFileSync(p, s);
console.log("ok");
