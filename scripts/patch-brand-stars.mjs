import fs from "node:fs";
import path from "node:path";
import url from "node:url";
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const p = path.join(__dirname, "../web/css/style.css");
let s = fs.readFileSync(p, "utf8");

const bodyInsert = `body {
  margin: 0;
  overflow-x: clip;
  font-family: proxima-nova, "Proxima Nova", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  background:
    radial-gradient(ellipse 100% 70% at 50% -15%, rgba(249, 115, 22, 0.07), transparent 52%),
    radial-gradient(ellipse 80% 50% at 100% 40%, rgba(99, 102, 241, 0.04), transparent 45%),
    linear-gradient(180deg, var(--bg0) 0%, #000 38%, #000 100%);
  color: var(--muted);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}`;
const bodyWithStars = `body {
  margin: 0;
  overflow-x: clip;
  font-family: proxima-nova, "Proxima Nova", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  position: relative;
  background:
    radial-gradient(ellipse 100% 70% at 50% -15%, rgba(249, 115, 22, 0.07), transparent 52%),
    radial-gradient(ellipse 80% 50% at 100% 40%, rgba(99, 102, 241, 0.04), transparent 45%),
    linear-gradient(180deg, var(--bg0) 0%, #000 38%, #000 100%);
  color: var(--muted);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.11;
  background-image:
    radial-gradient(1px 1px at 12% 18%, rgba(255, 255, 255, 0.55), transparent),
    radial-gradient(1px 1px at 62% 42%, rgba(255, 255, 255, 0.35), transparent),
    radial-gradient(1px 1px at 88% 12%, rgba(255, 255, 255, 0.4), transparent),
    radial-gradient(1px 1px at 34% 76%, rgba(255, 255, 255, 0.3), transparent),
    radial-gradient(1px 1px at 78% 68%, rgba(255, 255, 255, 0.38), transparent),
    radial-gradient(1px 1px at 8% 52%, rgba(255, 255, 255, 0.28), transparent),
    radial-gradient(1px 1px at 48% 8%, rgba(253, 186, 116, 0.25), transparent),
    radial-gradient(1px 1px at 92% 88%, rgba(165, 180, 252, 0.22), transparent);
  background-size: 280px 320px, 340px 380px, 260px 300px, 300px 340px, 320px 360px, 290px 310px, 310px 350px, 330px 370px;
  background-position: 0 0, 40px 60px, 120px 20px, 200px 140px, 60px 200px, 240px 80px, 160px 260px, 20px 180px;
  mix-blend-mode: screen;
}
@media (prefers-reduced-motion: reduce) {
  body::before { opacity: 0.09; }
}`;
if (s.includes("body::before") && s.includes("mix-blend-mode: screen")) {
  console.log("body stars skip");
} else if (s.includes(bodyInsert)) {
  s = s.replace(bodyInsert, bodyWithStars);
  console.log("body stars ok");
} else {
  console.log("body block mismatch");
}

const starOld = `.hero__brand-star {
  display: inline-block;
  width: 0.28em;
  height: 0.28em;
  margin-left: 0.06em;
  vertical-align: 0.12em;
  background: radial-gradient(circle, #fff 0%, #fde68a 45%, transparent 70%);
  clip-path: polygon(50% 0%, 63% 38%, 100% 38%, 69% 59%, 82% 100%, 50% 75%, 18% 100%, 31% 59%, 0% 38%, 37% 38%);
  opacity: 0.92;
  filter: drop-shadow(0 0 6px rgba(251, 146, 60, 0.55));
  animation: heroBrandStar 4.5s ease-in-out infinite;
}
@keyframes heroBrandStar {
  0%, 100% { opacity: 0.75; transform: scale(0.92) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.05) rotate(72deg); }
}
@media (prefers-reduced-motion: reduce) {
  .hero__brand-star { animation: none; opacity: 0.9; transform: none; }
}`;

const starNew = `.hero__brand-pre,
.hero__brand-tail {
  background: linear-gradient(105deg, #fff 0%, #fde68a 42%, #fb923c 88%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.hero__brand-tail {
  position: relative;
  display: inline-block;
}
.hero__brand-star {
  position: absolute;
  right: -0.02em;
  top: -0.26em;
  width: clamp(0.34em, 2.4vw, 0.52em);
  height: clamp(0.34em, 2.4vw, 0.52em);
  margin: 0;
  display: block;
  background:
    radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.95) 0%, transparent 45%),
    radial-gradient(circle at 50% 50%, #fde68a 0%, #fb923c 55%, #ea580c 100%);
  clip-path: polygon(50% 0%, 63% 36%, 100% 36%, 69% 58%, 82% 100%, 50% 74%, 18% 100%, 31% 58%, 0% 36%, 37% 36%);
  opacity: 0.94;
  filter: drop-shadow(0 0 8px rgba(251, 146, 60, 0.5)) drop-shadow(0 0 14px rgba(249, 115, 22, 0.22));
  animation: heroBrandStar 5.2s ease-in-out infinite;
}
@keyframes heroBrandStar {
  0%, 100% { opacity: 0.82; transform: scale(0.94) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.08) rotate(72deg); }
}
@media (prefers-reduced-motion: reduce) {
  .hero__brand-star { animation: none; opacity: 0.95; transform: none; }
}`;

if (s.includes(".hero__brand-pre,")) {
  console.log("brand star block skip");
} else if (s.includes(".hero__brand-star {\n  display: inline-block;")) {
  s = s.replace(starOld, starNew);
  console.log("star block ok");
} else {
  console.log("star block mismatch");
}

const brandOld = `.hero__brand {
  position: relative;
  display: inline-block;
  background: linear-gradient(105deg, #fff 0%, #fde68a 42%, #fb923c 88%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
@media (prefers-contrast: more) {
  .hero__brand {
    background: none;
    -webkit-background-clip: unset;
    background-clip: unset;
    color: #fff;
  }
}`;
const brandNew = `.hero__brand {
  display: inline-flex;
  align-items: baseline;
  gap: 0;
}
@media (prefers-contrast: more) {
  .hero__brand-pre,
  .hero__brand-tail {
    background: none !important;
    -webkit-background-clip: unset !important;
    background-clip: unset !important;
    color: #fff !important;
  }
}`;
if (s.includes("display: inline-flex;\n  align-items: baseline;")) {
  console.log("brand block skip");
} else if (s.includes(".hero__brand {\n  position: relative;")) {
  s = s.replace(brandOld, brandNew);
  console.log("brand block ok");
} else {
  console.log("brand block mismatch");
}

fs.writeFileSync(p, s);
