import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
function extractTemplate(src, varName) {
  const re = new RegExp(
    "const " + varName + " = `([\\s\\S]*?)`;",
    "m"
  );
  const m = src.match(re);
  return m ? m[1] : "";
}
const root = __dirname;
const ph = fs.readFileSync(path.join(root, "../web/css/style.css"), "utf8");
const perf = fs.readFileSync(path.join(root, "patch-hero-perf-aesthetic.mjs"), "utf8");
const insertAfter = ".hero__bg { position: absolute; inset: 0; }";
const insertBlock = extractTemplate(perf, "insertBlock");
const photoRe = /\.hero__photo \{[\s\S]*?@keyframes heroPhotoReveal \{[\s\S]*?\n\}/;
const perfPhotoMatch = perf.match(photoRe);
const perfPhoto = perfPhotoMatch ? perfPhotoMatch[0] : "";
const meteor = fs.readFileSync(path.join(root, "patch-meteor.mjs"), "utf8");
const meteorBlock = extractTemplate(meteor, "meteorBlock").replace(/^const meteorBlock = `/, "").replace(/`;$/, "");
const m2 = meteor.match(/const meteorBlock = `([\s\S]*?)`/);
const meteorCss = m2 ? m2[1] : "";
const patchCss = fs.readFileSync(path.join(root, "patch-css.mjs"), "utf8");
const m3 = patchCss.match(/const add = `([\s\S]*?)`;/);
const addCarousel = m3 ? m3[1] : "";
const reveal = `
.reveal{opacity:0;transform:translateY(18px);filter:blur(8px);transition:opacity .6s var(--ease),transform .65s var(--ease),filter .55s var(--ease);will-change:opacity,transform,filter}
.reveal.is-visible{opacity:1;transform:none;filter:blur(0)}
@media (prefers-reduced-motion:reduce){.reveal,.reveal.is-visible{transition-duration:.01ms!important;filter:none!important;transform:none!important;opacity:1!important}}
`;
const appMain = `
.app-main{display:grid;grid-template-columns:1fr;position:relative;isolation:isolate;overflow:hidden}
.app-main>.view{grid-area:1/1;min-width:0;z-index:0;will-change:opacity,transform,filter;transition:opacity .56s var(--ease),transform .64s cubic-bezier(.22,1,.36,1),filter .52s var(--ease)}
.app-main>.view:not(.view--active){opacity:0;pointer-events:none;transform:translate3d(52px,0,0) scale(.978);filter:blur(6px)}
.app-main>.view.view--active{opacity:1;pointer-events:auto;transform:translate3d(0,0,0) scale(1);filter:blur(0);z-index:2}
.app-main.view-state--wiki>.view--home:not(.view--active){transform:translate3d(-52px,0,0) scale(.978)}
.app-main.view-state--home>.view--wiki:not(.view--active){transform:translate3d(52px,0,0) scale(.978)}
@media (prefers-reduced-motion:reduce){.app-main>.view{transition-duration:.01ms!important;filter:none!important}.app-main>.view:not(.view--active){transform:none!important}}
`;
const wiki = `
.wiki-hero{padding-top:max(72px,calc(env(safe-area-inset-top,0px) + 56px));padding-bottom:48px}
.wiki-hero__inner{max-width:var(--max);margin:0 auto}
.wiki-hero__eyebrow{color:rgba(165,180,252,.9)}
.wiki-hero__title{font-size:clamp(2rem,5vw,3rem);margin:.35em 0 .25em;background:linear-gradient(135deg,#fff 0%,#c7d2fe 45%,#818cf8 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.wiki-hero__lead{max-width:52ch;font-size:1.05rem;margin:0}
.wiki-section__inner{max-width:var(--max);margin:0 auto}
.wiki-section--last{padding-bottom:max(72px,env(safe-area-inset-bottom))}
#wiki-top,#wiki-world,#wiki-rules,#wiki-economy,#wiki-faq{scroll-margin-top:72px}
`;
const loader = fs.readFileSync(path.join(root, "loader-snippet.css"), "utf8");
