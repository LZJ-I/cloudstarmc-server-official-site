import fs from "node:fs";
import path from "path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cssPath = path.join(__dirname, "../web/css/style.css");
const jsPath = path.join(__dirname, "../web/js/main.js");

const insertBlock = ``;

const perfPhoto = `.hero__photo {
  position: absolute;
  inset: clamp(40px, 10vmin, 128px);
  z-index: 0;
  border-radius: 0;
  overflow: hidden;
  background: #000;
  box-shadow: none;
  transition: none;
}
.hero__photo.is-loaded {
  box-shadow: none;
}
.hero__photo::after {
  display: none;
  content: none;
}
.hero__photo.is-loaded::after {
  display: none;
}
.hero__photo-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 42%;
  transform: scale(1.05);
  transform-origin: 50% 42%;
  opacity: 0.82;
  clip-path: circle(0% at 50% 42%);
  will-change: clip-path, transform;
}
.hero__photo.is-loaded .hero__photo-img {
  animation: heroPhotoReveal 0.78s cubic-bezier(0.2, 0.85, 0.25, 1) forwards;
}
@keyframes heroPhotoReveal {
  0% {
    clip-path: circle(0% at 50% 42%);
    transform: scale(1.05);
    opacity: 0.82;
  }
  22% {
    clip-path: circle(8% at 50% 42%);
    transform: scale(1.04);
    opacity: 0.9;
  }
  48% {
    clip-path: circle(78% at 50% 42%);
    transform: scale(1.015);
    opacity: 1;
  }
  72% {
    clip-path: circle(128% at 50% 42%);
    transform: scale(0.998);
    opacity: 1;
  }
  100% {
    clip-path: circle(118% at 50% 42%);
    transform: scale(0.96);
    opacity: 0.94;
  }
}
@media (prefers-reduced-motion: reduce) {
  .hero__photo.is-loaded .hero__photo-img {
    animation: none !important;
    clip-path: circle(130% at 50% 42%);
    opacity: 0.94;
    transform: scale(0.96);
  }
}
}`;

let s = fs.readFileSync(cssPath, "utf8");
const insertAfter = ".hero__bg { position: absolute; inset: 0; }";

if (!s.includes(".hero__sparkles")) {
  if (!s.includes(insertAfter)) throw new Error("marker missing");
  s = s.replace(insertAfter, insertAfter + insertBlock);
}

const photoRe = /\.hero__photo \{[\s\S]*?@keyframes heroPhotoReveal \{[\s\S]*?\n\}/;
if (!photoRe.test(s)) throw new Error("hero photo block regex failed");
s = s.replace(photoRe, perfPhoto);

fs.writeFileSync(cssPath, s);

let js = fs.readFileSync(jsPath, "utf8");
js = js.replace("for (var i = 0; i < 120; i += 1)", "for (var i = 0; i < 38; i += 1)");
js = js.replace("for (var i = 0; i < 72; i += 1)", "for (var i = 0; i < 38; i += 1)");
fs.writeFileSync(jsPath, js);

console.log("done");
