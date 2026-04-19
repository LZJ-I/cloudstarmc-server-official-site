import fs from "node:fs";
import path from "node:path";
import url from "node:url";
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const p = path.join(__dirname, "../web/css/style.css");
let s = fs.readFileSync(p, "utf8");

const meteorBlock = `.hero__meteor {
  position: absolute;
  left: auto;
  right: -0.12em;
  top: -0.22em;
  width: clamp(40px, 10vw, 84px);
  height: 2px;
  margin: 0;
  padding: 0;
  display: block;
  border: 0;
  border-radius: 2px;
  transform-origin: 100% 50%;
  transform: rotate(-38deg) scaleX(0.2);
  background: linear-gradient(
    270deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.75) 14%,
    rgba(253, 186, 116, 0.98) 38%,
    rgba(251, 146, 60, 0.55) 68%,
    rgba(249, 115, 22, 0) 100%
  );
  box-shadow: 0 0 12px rgba(251, 146, 60, 0.38);
  opacity: 0;
  pointer-events: none;
  animation: heroMeteorTail 2.85s cubic-bezier(0.42, 0, 0.2, 1) infinite;
}
@keyframes heroMeteorTail {
  0%,
  10% {
    opacity: 0;
    transform: rotate(-38deg) translate(10%, -16%) scaleX(0.12);
    filter: blur(0.5px);
  }
  20% {
    opacity: 0.95;
    filter: blur(0);
  }
  44% {
    opacity: 1;
    transform: rotate(-38deg) translate(-8%, 12%) scaleX(1);
  }
  62% {
    opacity: 0.55;
    transform: rotate(-38deg) translate(-22%, 30%) scaleX(0.62);
  }
  82%,
  100% {
    opacity: 0;
    transform: rotate(-38deg) translate(-34%, 48%) scaleX(0.28);
    filter: blur(1px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .hero__meteor {
    animation: none;
    opacity: 0.42;
    transform: rotate(-38deg) translate(-8%, 12%) scaleX(0.78);
    filter: none;
  }
}
`;

const brandOld = `.hero__brand {
  display: inline-flex;
  align-items: baseline;
  gap: 0;
}
@media (prefers-contrast: more) {
  .hero__brand-star {
    filter: none;
    opacity: 1;
  }
  .hero__brand-pre,
  .hero__brand-tail {
    background: none !important;
    -webkit-background-clip: unset !important;
    background-clip: unset !important;
    color: #fff !important;
  }
}`;

const brandNew = `.hero__brand {
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

if (s.includes(brandOld)) {
  s = s.replace(brandOld, brandNew);
  fs.writeFileSync(p, s);
  console.log("css ok");
} else {
  console.log("patch-meteor: skip (brand block not in style.css)");
}
