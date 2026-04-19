import fs from "node:fs";
import path from "node:path";
import url from "node:url";
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const p = path.join(__dirname, "../web/css/style.css");
let s = fs.readFileSync(p, "utf8");

const kfOld = /@keyframes heroPhotoReveal \{[\s\S]*?\n\}/;
const kfNew = `@keyframes heroPhotoReveal {
  0% {
    clip-path: circle(0% at 50% 44%);
    transform: scale(1.2);
    filter: blur(16px) saturate(1.1) brightness(0.92);
    opacity: 0.75;
  }
  18% {
    clip-path: circle(6% at 50% 44%);
    transform: scale(1.18);
    filter: blur(14px) saturate(1.08) brightness(0.94);
    opacity: 0.82;
  }
  42% {
    clip-path: circle(72% at 50% 44%);
    transform: scale(1.06);
    filter: blur(4px) saturate(1.04) brightness(1);
    opacity: 1;
  }
  62% {
    clip-path: circle(122% at 50% 44%);
    transform: scale(1.01);
    filter: blur(0.5px) saturate(1.01) brightness(1.02);
    opacity: 1;
  }
  82% {
    clip-path: circle(142% at 50% 44%);
    transform: scale(0.996);
    filter: blur(0) saturate(1) brightness(1);
    opacity: 1;
  }
  100% {
    clip-path: circle(152% at 50% 44%);
    transform: scale(1);
    filter: blur(0) saturate(1) brightness(1);
    opacity: 1;
  }
}`;
if (!kfOld.test(s)) throw new Error("keyframes not found");
s = s.replace(kfOld, kfNew);

s = s.replace(
  /animation: heroPhotoReveal [\d.]+s[^;]+;/,
  "animation: heroPhotoReveal 1.22s cubic-bezier(0.15, 0.85, 0.22, 1) forwards;"
);

const mqOld = `@media (prefers-reduced-motion: reduce) {
  .hero__gradient { animation: none; }
  .hero__photo { transition: none; }
  .hero__photo.is-loaded {
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.06),
      0 32px 80px rgba(0, 0, 0, 0.55),
      inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  }
  .hero__photo-img {
    transition: none !important;
    clip-path: none !important;
    transform: none !important;
    filter: none !important;
    opacity: 1 !important;
  }
}`;
const mqNew = `@media (prefers-reduced-motion: reduce) {
  .hero__gradient { animation: none; }
  .hero__photo { transition: none; }
  .hero__photo.is-loaded {
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.06),
      0 32px 80px rgba(0, 0, 0, 0.55),
      inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  }
  .hero__photo::after,
  .hero__photo.is-loaded::after {
    opacity: 0 !important;
    border-color: transparent !important;
    box-shadow: none !important;
    transition: none !important;
  }
  .hero__photo.is-loaded .hero__photo-img {
    animation: none !important;
  }
  .hero__photo-img {
    transition: none !important;
    clip-path: none !important;
    transform: none !important;
    filter: none !important;
    opacity: 1 !important;
  }
}`;
if (s.includes(mqOld)) {
  s = s.replace(mqOld, mqNew);
} else if (!s.includes(".hero__photo.is-loaded .hero__photo-img")) {
  throw new Error("mq block mismatch");
} else if (!s.includes("animation: none !important")) {
  s = s.replace(
    /(\.hero__photo\.is-loaded \{[\s\S]*?\})\s*(\.hero__photo-img \{)/,
    "$1\n  .hero__photo::after,\n  .hero__photo.is-loaded::after {\n    opacity: 0 !important;\n    border-color: transparent !important;\n    box-shadow: none !important;\n    transition: none !important;\n  }\n  .hero__photo.is-loaded .hero__photo-img {\n    animation: none !important;\n  }\n  $2"
  );
}

fs.writeFileSync(p, s);
console.log("updated");
