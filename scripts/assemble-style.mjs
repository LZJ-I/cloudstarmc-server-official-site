import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
function tpl(src, name) {
  const m = src.match(new RegExp("(?:const|let) " + name + " = `([\\s\\S]*?)`;"));
  return m ? m[1] : "";
}
const root = __dirname;
const out = path.join(root, "../web/css/style.css");
const ph = `html{-webkit-text-size-adjust:100%;text-size-adjust:100%;scroll-padding-top:96px}
:root{color-scheme:dark;--bg0:#030308;--bg1:#06060c;--bg2:#0b0b12;--line:rgba(255,255,255,.09);--gold:#f97316;--gold2:#fdba74;--text:#f4f4f8;--muted:#a8b0c0;--shadow:0 24px 80px rgba(0,0,0,.58),0 0 0 1px rgba(255,255,255,.03);--radius:18px;--max:1120px;--ease:cubic-bezier(.2,.9,.2,1);scroll-behavior:smooth}
*{box-sizing:border-box}
html,body{height:100%}
.font-proxima,body.font-proxima{font-family:proxima-nova,"Proxima Nova",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{margin:0;overflow-x:clip;position:relative;background:radial-gradient(ellipse 100% 70% at 50% -15%,rgba(249,115,22,.07),transparent 52%),radial-gradient(ellipse 80% 50% at 100% 40%,rgba(99,102,241,.04),transparent 45%),linear-gradient(180deg,var(--bg0) 0%,#000 38%,#000 100%);color:var(--muted);text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased}
body::before{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(1200px 800px at 50% -20%,rgba(249,115,22,.06),transparent 55%);opacity:.9}
.noise{position:fixed;inset:0;z-index:1;pointer-events:none;opacity:.045;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")}
a{color:inherit;text-decoration:none}
p{line-height:1.65;color:var(--muted)}
h1,h2,h3{font-family:proxima-nova,"Proxima Nova",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;letter-spacing:-.02em;font-weight:700;color:var(--text)}`;
const perfPath = path.join(root, "patch-hero-perf-aesthetic.mjs");
const perf = fs.readFileSync(perfPath, "utf8");
const insertBlock = tpl(perf, "insertBlock");
const perfPhoto = tpl(perf, "perfPhoto");
const insertAfter = ".hero__bg { position: absolute; inset: 0; }";
const meteorSrc = fs.readFileSync(path.join(root, "patch-meteor.mjs"), "utf8");
const meteorBlock = tpl(meteorSrc, "meteorBlock");
const patchCss = fs.readFileSync(path.join(root, "patch-css.mjs"), "utf8");
const addM = patchCss.match(/const add = `([\s\S]*?)`;/);
const addCarousel = addM ? addM[1] : "";
const loader = `
html.is-booting,body.is-booting{overflow:hidden;height:100%}
.page-loader{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;pointer-events:auto}
.page-loader.is-exit{opacity:0;visibility:hidden;pointer-events:none;filter:blur(10px);transition:opacity .65s var(--ease),visibility 0s linear .65s,filter .55s var(--ease)}
.page-loader.is-exit .page-loader__content{transform:translateY(12px) scale(.97);opacity:0}
.page-loader__backdrop{position:absolute;inset:0;background:radial-gradient(ellipse 90% 55% at 50% 20%,rgba(249,115,22,.12),transparent 55%),radial-gradient(ellipse 70% 45% at 80% 60%,rgba(99,102,241,.08),transparent 50%),linear-gradient(165deg,#030308 0%,#06060c 42%,#020204 100%)}
.page-loader__content{position:relative;text-align:center;padding:clamp(28px,5vw,48px) clamp(32px,6vw,56px);border-radius:24px;border:1px solid rgba(255,255,255,.1);background:rgba(10,10,18,.55);box-shadow:var(--shadow),inset 0 1px 0 rgba(255,255,255,.06);backdrop-filter:blur(20px) saturate(1.2);transition:transform .6s var(--ease),opacity .55s var(--ease)}
.page-loader__mark{font-size:clamp(2rem,6vw,2.75rem);font-weight:800;letter-spacing:.12em;margin:0 0 1.25rem;background:linear-gradient(135deg,#fff 0%,#fdba74 40%,#ea580c 100%);-webkit-background-clip:text;background-clip:text;color:transparent;animation:pageLoaderPulse 2.2s ease-in-out infinite}
.page-loader__orbit{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:1.25rem}
.page-loader__orbit span{width:8px;height:8px;border-radius:50%;background:linear-gradient(145deg,#fb923c,#ea580c);box-shadow:0 0 14px rgba(234,88,12,.55);animation:pageLoaderDot 1.1s ease-in-out infinite}
.page-loader__orbit span:nth-child(2){animation-delay:.15s}
.page-loader__orbit span:nth-child(3){animation-delay:.3s}
.page-loader__bar{height:3px;width:min(220px,52vw);margin:0 auto 1rem;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden}
.page-loader__bar-fill{display:block;height:100%;width:38%;border-radius:inherit;background:linear-gradient(90deg,#fb923c,#ea580c);animation:pageLoaderBar 1.1s ease-in-out infinite alternate}
.page-loader__hint{margin:0;font-size:13px;letter-spacing:.08em;color:rgba(226,232,240,.55)}
@keyframes pageLoaderPulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.08)}}
@keyframes pageLoaderDot{0%,100%{transform:translateY(0);opacity:.55}50%{transform:translateY(-4px);opacity:1}}
@keyframes pageLoaderBar{0%{transform:translateX(-30%)}100%{transform:translateX(190%)}}
@media (prefers-reduced-motion:reduce){.page-loader__mark,.page-loader__orbit span,.page-loader__bar-fill{animation:none!important}.page-loader__bar-fill{width:72%;transform:none;margin:0 auto}.page-loader.is-exit{transition-duration:.2s!important}}
`;
const nav = `.nav{z-index:100;position:fixed;inset:0 0 auto 0;transition:background .35s var(--ease),border-color .35s var(--ease),box-shadow .35s var(--ease);border-bottom:1px solid transparent}
.nav--scrolled{background:rgba(6,6,12,.82);border-color:var(--line);box-shadow:0 18px 60px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.04);backdrop-filter:blur(16px) saturate(1.15)}
.nav__inner{max-width:min(var(--max),100vw);margin:0 auto;padding:12px clamp(16px,4vw,28px);display:flex;align-items:flex-start;justify-content:center;position:relative;min-height:52px;column-gap:12px}
.nav__spacer,.nav__spacer--tail{display:none}
.nav__burger{position:absolute;top:50%;right:max(12px,env(safe-area-inset-right,0px));transform:translateY(-50%);z-index:5;display:none;width:44px;height:44px;flex-shrink:0;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);align-items:center;justify-content:center;flex-direction:column;gap:5px;cursor:pointer;padding:0}
.nav__burger-line{display:block;width:18px;height:2px;border-radius:2px;background:rgba(244,241,234,.9);transition:transform .3s var(--ease),opacity .3s var(--ease)}
.nav--open .nav__burger-line:nth-child(1){transform:translateY(7px) rotate(45deg)}
.nav--open .nav__burger-line:nth-child(2){opacity:0}
.nav--open .nav__burger-line:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
.nav__drawer{flex:0 1 auto;max-width:min(920px,calc(100vw - 56px));display:flex;align-items:center;justify-content:center;min-width:0}
.nav__links{display:flex;flex-direction:column;align-items:center;gap:10px;min-width:0;width:100%}
.nav__links a{position:relative;padding:10px 10px;color:#f3f4f6;font-weight:900;font-size:clamp(16px,1.75vw,21px);white-space:nowrap}
.nav__links a::after{content:"";position:absolute;left:10px;right:10px;bottom:4px;height:2px;border-radius:2px;background:linear-gradient(90deg,rgba(253,186,116,.2),rgba(249,115,22,.85));transform:scaleX(0);transform-origin:left center;transition:transform .35s var(--ease)}
.nav__links a:hover::after,.nav__links a.is-active::after{transform:scaleX(1)}
.nav__primary{display:flex;align-items:center;justify-content:center;gap:4px;padding:5px;border-radius:999px;background:rgba(0,0,0,.42);border:1px solid rgba(255,255,255,.09);box-shadow:inset 0 1px 0 rgba(255,255,255,.05);flex-wrap:nowrap}
.nav__route--main{font-size:clamp(14px,1.55vw,17px)!important;font-weight:800!important;letter-spacing:.06em;padding:9px 18px!important;border-radius:999px;color:rgba(226,232,240,.78)!important;white-space:nowrap}
.nav__links .nav__route--main::after{display:none!important}
.nav__links .nav__route--main.is-active{color:#fff!important;background:linear-gradient(145deg,rgba(251,146,60,.5),rgba(234,88,12,.35));box-shadow:0 0 0 1px rgba(249,115,22,.42),0 10px 32px rgba(234,88,12,.2)}
.nav__links .nav__route--main:not(.is-active):hover{color:#f8fafc!important;background:rgba(255,255,255,.07)}
`;
const heroShell = `.hero{position:relative;min-height:100svh;min-height:100dvh;padding:0;padding-left:clamp(48px,12vw,216px);padding-right:clamp(24px,4vw,48px);display:flex;align-items:center;justify-content:flex-start;overflow:hidden}
.hero__gradient{position:absolute;inset:0;z-index:1;background:radial-gradient(120% 85% at 50% 0%,rgba(249,115,22,.22),transparent 58%),linear-gradient(180deg,rgba(3,3,8,.38) 0%,rgba(3,3,8,.62) 38%,rgba(0,0,0,.82) 68%,rgba(0,0,0,.96) 100%)}
.hero__cubes{position:absolute;right:4%;bottom:10%;width:min(340px,42vw);aspect-ratio:1;z-index:2;pointer-events:none;opacity:.55}
.hero__cubes span{position:absolute;display:block;width:18%;height:18%;border-radius:4px;background:linear-gradient(145deg,rgba(255,255,255,.12),rgba(249,115,22,.15));box-shadow:0 12px 40px rgba(0,0,0,.35)}
.hero__cubes span:nth-child(1){left:10%;top:20%;transform:rotate(12deg)}
.hero__cubes span:nth-child(2){left:38%;top:8%;transform:rotate(-8deg);opacity:.75}
.hero__cubes span:nth-child(3){right:18%;top:28%;transform:rotate(6deg);opacity:.65}
.hero__cubes span:nth-child(4){right:8%;bottom:12%;transform:rotate(-14deg);opacity:.5}
.hero__stars{position:absolute;inset:0;z-index:2;pointer-events:none}
.star{position:absolute;width:1.5px;height:1.5px;border-radius:50%;background:rgba(255,255,255,.45);box-shadow:0 0 4px rgba(255,255,255,.12);animation:starTwinkle var(--d,3s) ease-in-out infinite;opacity:var(--o,.35)}
@keyframes starTwinkle{0%,100%{opacity:.28;transform:scale(.88)}50%{opacity:.55;transform:scale(1)}}
.hero__content{position:relative;z-index:3;flex:0 1 min(var(--max),48rem);max-width:min(var(--max),48rem);width:100%;margin:0;text-align:left;padding:clamp(96px,15vh,150px) max(24px,env(safe-area-inset-right)) max(80px,env(safe-area-inset-bottom,0px)) max(24px,env(safe-area-inset-left));box-sizing:border-box}
.eyebrow{display:inline-block;font-size:12px;font-weight:800;letter-spacing:.28em;text-transform:uppercase;color:rgba(253,186,116,.75);margin:0 0 14px}
.hero__title{font-size:clamp(2.45rem,5.6vw,4.1rem);line-height:1.06;margin:0 0 16px;color:var(--text)}
.hero__lead{max-width:54ch;margin:0 0 28px;font-size:clamp(1.05rem,2vw,1.22rem);color:rgba(226,232,240,.9)}
.hero__actions{display:flex;flex-wrap:wrap;gap:12px;justify-content:flex-start;align-items:center;margin-bottom:8px}
.hero__hint{margin:12px 0 0;font-size:13px;color:rgba(253,186,116,.75)}
.hero__scroll{position:absolute;left:clamp(64px,12vw,224px);bottom:max(24px,env(safe-area-inset-bottom,0px));transform:none;z-index:3;opacity:.55}
.hero__scroll span{display:block;width:22px;height:36px;border:2px solid rgba(255,255,255,.25);border-radius:12px;position:relative}
.hero__scroll span::after{content:"";position:absolute;left:50%;top:8px;width:4px;height:8px;margin-left:-2px;border-radius:2px;background:rgba(255,255,255,.55);animation:scrollDot 1.6s ease-in-out infinite}
@keyframes scrollDot{0%,100%{opacity:.35;transform:translateY(0)}50%{opacity:1;transform:translateY(8px)}}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 20px;border-radius:999px;font-weight:800;font-size:15px;border:1px solid transparent;cursor:pointer;transition:transform .2s var(--ease),background .25s var(--ease),border-color .25s var(--ease),box-shadow .25s var(--ease)}
.btn--primary{background:linear-gradient(145deg,rgba(251,146,60,.95),rgba(234,88,12,.92));color:#0b0b10;border-color:rgba(249,115,22,.45);box-shadow:0 14px 40px rgba(234,88,12,.28)}
.btn--primary:hover{transform:translateY(-1px)}
.btn--ghost{background:rgba(255,255,255,.06);color:#f8fafc;border-color:rgba(255,255,255,.14)}
.btn--ghost:hover{background:rgba(255,255,255,.1)}
.btn--lg{padding:14px 22px;font-size:16px;width:100%}
`;
const sections = `
.section{padding:92px 20px;position:relative;z-index:2}
.section--alt{background:linear-gradient(180deg,rgba(255,255,255,.02),transparent 40%)}
.section__head{max-width:var(--max);margin:0 auto 40px;text-align:center}
.section__head h2{font-size:clamp(28px,4vw,44px);margin:0 0 12px}
.section__head p{max-width:62ch;margin:0 auto}
.tabs{max-width:var(--max);margin:0 auto}
.tabs__list{position:relative;display:flex;flex-wrap:wrap;gap:8px;justify-content:center;padding:6px;margin:0 0 18px;border-radius:999px;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.08)}
.tabs__btn{position:relative;z-index:2;padding:10px 16px;border-radius:999px;border:0;background:transparent;color:rgba(226,232,240,.78);font-weight:800;font-size:14px;cursor:pointer;transition:color .25s var(--ease),background .25s var(--ease);-webkit-tap-highlight-color:transparent}
.tabs__btn.is-active{color:#0b0b10;background:linear-gradient(145deg,#fff,#fde68a)}
.tabs__indicator{position:absolute;inset:0;pointer-events:none;z-index:0;border-radius:inherit}
.tabs__indicator span{position:absolute;top:6px;bottom:6px;left:0;width:0;border-radius:999px;background:rgba(255,255,255,.07);transition:left .28s var(--ease),width .28s var(--ease)}
.tabs__panels{display:grid}
.tabs__panel{display:grid;min-height:0}
.tabs__panel[hidden]{display:none!important}
.tabs__panel.is-active{display:grid!important}
.feature-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px;align-items:stretch}
.feature-grid h3{margin:0 0 10px;font-size:22px;color:var(--text)}
.feature-grid p{margin:0 0 12px}
.ticks{margin:0;padding-left:1.1em;color:rgba(226,232,240,.82)}
.ticks li{margin:6px 0}
.feature-card{position:relative;padding:22px;border-radius:calc(var(--radius) + 4px);border:1px solid rgba(255,255,255,.1);background:rgba(15,17,23,.65);box-shadow:var(--shadow);overflow:hidden}
.feature-card__glow{position:absolute;inset:-40%;background:radial-gradient(circle at 30% 20%,rgba(249,115,22,.25),transparent 55%);opacity:.55;pointer-events:none}
.feature-card__kicker{margin:0 0 8px;font-size:12px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:rgba(253,186,116,.75)}
.feature-card__big{margin:0;font-size:clamp(36px,6vw,56px);font-weight:900;color:#fff}
.feature-card__sub{margin:10px 0 0;font-size:14px;color:rgba(226,232,240,.78)}
.feature-card--alt .feature-card__glow{background:radial-gradient(circle at 70% 30%,rgba(99,102,241,.28),transparent 55%)}
`;
const socialFooter = `
.social{padding:92px 20px;position:relative;z-index:2}
.social__inner{max-width:var(--max);margin:0 auto;display:flex;flex-direction:column;align-items:flex-start;gap:20px;padding:26px;border-radius:calc(var(--radius) + 8px);border:1px solid rgba(249,115,22,.22);background:linear-gradient(155deg,rgba(255,255,255,.04) 0%,transparent 45%),radial-gradient(900px 360px at 10% 0%,rgba(249,115,22,.1),transparent 62%),rgba(10,11,16,.78);box-shadow:var(--shadow);backdrop-filter:blur(12px) saturate(1.08)}
.social__inner>div:first-child{width:100%;max-width:72ch}
.social__inner h2{margin:0 0 10px;font-size:clamp(28px,4vw,44px);color:var(--text)}
.social__cta{display:grid;gap:10px;justify-items:stretch;width:100%;align-self:stretch}
.footer{padding:34px 20px 44px;border-top:1px solid var(--line);position:relative;z-index:2}
.footer__inner{max-width:var(--max);margin:0 auto;display:flex;gap:16px;align-items:center;justify-content:space-between;color:rgba(244,241,234,.55);font-size:14px}
.footer a{color:rgba(244,241,234,.72);font-weight:700}
.footer a:hover{color:var(--gold2)}
`;
const orTeam = `
.or-team-section{padding-top:72px;padding-bottom:72px}
.or-team{max-width:var(--max);margin:0 auto;padding:0 4px}
.or-team__parchment{border-radius:calc(var(--radius) + 6px);border:1px solid rgba(255,255,255,.1);background:rgba(10,11,16,.78);box-shadow:var(--shadow);overflow:hidden;position:relative}
.or-team__parchment::before{content:"";position:absolute;inset:0;background:linear-gradient(125deg,rgba(255,255,255,.05),transparent 45%,rgba(249,115,22,.04) 100%);pointer-events:none;z-index:1}
.or-team__grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(240px,.9fr);gap:0;min-height:min(520px,70vh);position:relative;z-index:2}
.or-team__left{padding:clamp(22px,3vw,34px);display:flex;flex-direction:column;gap:18px;border-right:1px solid rgba(255,255,255,.08)}
.or-team__title{font-size:clamp(22px,3vw,30px);font-weight:900;color:var(--text);letter-spacing:-.02em}
.or-team__subtitle{margin:0;color:rgba(226,232,240,.78);font-size:15px;line-height:1.6}
.or-team__fade-wrap{position:relative;min-height:min(200px,28vh);margin-top:clamp(24px,4vw,40px)}
.or-team__slide-stack{position:relative;min-height:180px}
.or-team__slide-pane{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-start;gap:10px;transition:opacity .52s var(--ease),transform .56s cubic-bezier(.22,1,.36,1),filter .45s var(--ease)}
.or-team__slide-pane--current{position:relative;opacity:1;transform:translate(0,0);z-index:2;filter:blur(0)}
.or-team__slide-pane--wait{opacity:0;pointer-events:none;filter:blur(3px)}
.or-team__grid[data-or-team-dir="next"] .or-team__slide-pane--wait{transform:translate(12%,0)}
.or-team__grid[data-or-team-dir="next"] .or-team__slide-pane--out{opacity:0;transform:translate(-10%,0);filter:blur(4px)}
.or-team__grid[data-or-team-dir="prev"] .or-team__slide-pane--wait{transform:translate(-12%,0)}
.or-team__grid[data-or-team-dir="prev"] .or-team__slide-pane--out{opacity:0;transform:translate(10%,0);filter:blur(4px)}
.or-team__slide-pane--in{opacity:1;transform:translate(0,0);z-index:3;filter:blur(0)}
.or-team__headline{display:flex;flex-wrap:wrap;align-items:baseline;gap:10px 14px;font-size:clamp(20px,2.6vw,26px);margin:0;color:var(--text)}
.or-team__name{font-weight:900;letter-spacing:-.02em;line-height:1.15}
.or-team__title-pill{display:inline-flex;align-items:center;padding:5px 12px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);font-size:13px;font-weight:700;color:rgba(226,232,240,.92)}
.or-team__title-text{line-height:1.2}
.or-team__bio{margin:0;font-size:15px;line-height:1.65;color:rgba(226,232,240,.82)}
.or-team__controls{display:grid;grid-template-columns:44px minmax(0,1fr) 44px;align-items:center;column-gap:8px;margin-top:auto;padding-top:8px;width:100%;min-width:0;box-sizing:border-box}
.or-team__strip-wrap{min-width:0;max-width:100%;display:flex;align-items:center;justify-content:center;box-sizing:border-box}
.or-team__strip{position:relative;min-width:0;box-sizing:border-box;overflow-x:auto;overflow-y:hidden;padding:0 10px;scroll-padding-inline:10px;scroll-behavior:auto;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;scrollbar-width:thin;width:100%;max-width:100%;isolation:isolate;--strip-fade:40px;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}
.or-team__strip[data-strip-fade="none"]{-webkit-mask-image:none;mask-image:none}
.or-team__strip[data-strip-fade="r"]{-webkit-mask-image:linear-gradient(90deg,#000 0,#000 calc(100% - var(--strip-fade)),transparent 100%);mask-image:linear-gradient(90deg,#000 0,#000 calc(100% - var(--strip-fade)),transparent 100%)}
.or-team__strip[data-strip-fade="l"]{-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 var(--strip-fade),#000 100%);mask-image:linear-gradient(90deg,transparent 0,#000 var(--strip-fade),#000 100%)}
.or-team__strip[data-strip-fade="lr"]{-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 var(--strip-fade),#000 calc(100% - var(--strip-fade)),transparent 100%);mask-image:linear-gradient(90deg,transparent 0,#000 var(--strip-fade),#000 calc(100% - var(--strip-fade)),transparent 100%)}
.or-team__strip-track{display:flex;flex-wrap:nowrap;gap:14px;justify-content:flex-start;align-items:center;width:max-content;box-sizing:border-box;padding:16px 40px 16px 6px;min-height:0}
.or-team__face{flex:0 0 auto;width:52px;height:52px;padding:0;border-radius:14px;border:2px solid rgba(255,255,255,.12);background:rgba(0,0,0,.4);cursor:pointer;overflow:visible;transition:border-color .2s var(--ease),box-shadow .2s var(--ease),transform .2s var(--ease);transform:scale(1);transform-origin:50% 50%}
.or-team__face:hover{border-color:rgba(255,255,255,.2)}
.or-team__face.is-active{z-index:2;border-color:rgba(253,186,116,.95);box-shadow:inset 0 0 0 1px rgba(0,0,0,.45),0 0 0 1px rgba(251,146,60,.4),0 2px 10px rgba(0,0,0,.35);transform:scale(1.04)}
.or-team__face img{width:100%;height:100%;object-fit:contain;object-position:center;background:rgba(0,0,0,.2);display:block;border-radius:12px}
.or-team__icon-btn{width:44px;height:44px;border-radius:10px;border:0;background:transparent;cursor:pointer;display:grid;place-items:center;flex-shrink:0;transition:transform .16s cubic-bezier(.2,.9,.2,1),opacity .15s ease;-webkit-tap-highlight-color:transparent}
.or-team__icon-btn:hover{opacity:.9}
.or-team__icon-btn:active{transform:scale(.84)}
.or-team__pix3{position:relative;display:inline-block;width:12px;height:14px;vertical-align:middle}
.or-team__pix3 i{position:absolute;width:4px;height:4px;border-radius:0;background:#fcd34d;image-rendering:pixelated}
.or-team__pix3--l i:nth-child(1){left:0;bottom:0}
.or-team__pix3--l i:nth-child(2){left:5px;bottom:4px}
.or-team__pix3--l i:nth-child(3){left:0;bottom:8px}
.or-team__pix3--r i:nth-child(1){right:0;bottom:0}
.or-team__pix3--r i:nth-child(2){right:5px;bottom:4px}
.or-team__pix3--r i:nth-child(3){right:0;bottom:8px}
.or-team__right{padding:clamp(16px,2vw,22px);display:flex;align-items:stretch;justify-content:center;background:radial-gradient(800px 500px at 80% 20%,rgba(249,115,22,.14),transparent 55%),rgba(6,7,12,.65)}
.or-team__portrait-stack{position:relative;width:100%;min-height:320px;border-radius:18px;overflow:hidden;border:none;background:transparent;box-shadow:none}
.or-team__portrait-pane{position:absolute;inset:0;transition:opacity .52s var(--ease),transform .56s cubic-bezier(.22,1,.36,1),filter .45s var(--ease)}
.or-team__portrait-img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center;background:transparent}
.or-team__portrait-pane--current{opacity:1;transform:scale(1) translateY(0);z-index:2;filter:blur(0)}
.or-team__portrait-pane--wait{opacity:0;transform:scale(1.05);z-index:0;filter:blur(6px);pointer-events:none}
.or-team__portrait-pane--out{opacity:0;transform:scale(1.04) translateY(10px);z-index:1;filter:blur(5px)}
.or-team__portrait-pane--in{opacity:1;transform:scale(1) translateY(0);z-index:3;filter:blur(0)}
.or-team__grid[data-or-team-dir="prev"] .or-team__portrait-pane--wait{transform:scale(1.05) translateY(-10px)}
.or-team__progress{height:4px;background:rgba(255,255,255,.08)}
.or-team__progress-bar{height:100%;width:0%;background:linear-gradient(90deg,#fb923c,#ea580c);transition:width .08s linear}
@media (max-width:900px){.or-team__grid{grid-template-columns:1fr;min-height:0}.or-team__left{border-right:0;border-bottom:1px solid rgba(255,255,255,.08)}.or-team__right{order:-1;min-height:260px}.or-team__controls{column-gap:8px;grid-template-columns:40px minmax(0,1fr) 40px}.or-team__strip{padding:0 8px;scroll-padding-inline:8px;--strip-fade:32px}.or-team__strip-track{padding:12px 32px 12px 4px;gap:12px}}
`;
const appWikiReveal = `
.app-main{display:grid;grid-template-columns:1fr;position:relative;isolation:isolate;overflow:hidden}
.app-main>.view{grid-area:1/1;min-width:0;width:100%}
.app-main>.view:not(.view--active){position:absolute;left:0;right:0;top:0;width:100%;height:0;min-height:0;overflow:hidden;margin:0;padding:0;border:0;opacity:0;visibility:hidden;pointer-events:none;transform:none;filter:none;transition:none;z-index:0}
.app-main>.view.view--active{position:relative;opacity:1;visibility:visible;pointer-events:auto;transform:none;filter:none;transition:none;z-index:2}
@keyframes app-view-enter-home{from{opacity:0;transform:translate3d(-14px,0,0)}to{opacity:1;transform:none}}
@keyframes app-view-enter-wiki{from{opacity:0;transform:translate3d(14px,0,0)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:no-preference){
.app-main.view-state--home>.view--home.view--active.view--enter{animation:app-view-enter-home .42s cubic-bezier(.22,1,.36,1) both}
.app-main.view-state--wiki>.view--wiki.view--active.view--enter{animation:app-view-enter-wiki .42s cubic-bezier(.22,1,.36,1) both}
}
.wiki-hero{padding-top:max(88px,calc(env(safe-area-inset-top,0px) + 60px));padding-bottom:48px}
.wiki-hero__inner{max-width:var(--max);margin:0 auto}
.wiki-hero__eyebrow{color:rgba(165,180,252,.9)}
.wiki-hero__title{font-size:clamp(2rem,5vw,3rem);margin:.35em 0 .25em;background:linear-gradient(135deg,#fff 0%,#c7d2fe 45%,#818cf8 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.wiki-hero__lead{max-width:52ch;font-size:1.05rem;margin:0}
.wiki-section__inner{max-width:var(--max);margin:0 auto}
.wiki-section--last{padding-bottom:max(72px,env(safe-area-inset-bottom))}
#wiki-top,#wiki-world,#wiki-rules,#wiki-economy,#wiki-faq{scroll-margin-top:96px}
.reveal{opacity:0;transform:translateY(18px);filter:blur(8px);transition:opacity .6s var(--ease),transform .65s var(--ease),filter .55s var(--ease);will-change:opacity,transform,filter}
.reveal.is-visible{opacity:1;transform:none;filter:blur(0)}
@media (prefers-reduced-motion:reduce){.reveal,.reveal.is-visible{transition-duration:.01ms!important;filter:none!important;transform:none!important;opacity:1!important}}
.tabs.reveal,.tabs.reveal.is-visible{filter:none;will-change:opacity,transform;transition:opacity .6s var(--ease),transform .65s var(--ease)}
.tabs.reveal:not(.is-visible){opacity:0;transform:translateY(16px)}
.tabs.reveal.is-visible{opacity:1;transform:none}
`;
const mq = `@media (max-width:900px){
.nav{padding-top:env(safe-area-inset-top,0)}
.nav__inner{display:flex;justify-content:flex-end;align-items:center;position:relative;padding:10px max(16px,env(safe-area-inset-right)) 10px max(16px,env(safe-area-inset-left));column-gap:12px}
.nav__spacer,.nav__spacer--tail{display:none}
.nav__burger{display:inline-flex;-webkit-tap-highlight-color:transparent}
.nav__drawer{position:absolute;left:0;right:0;top:100%;margin-left:0;flex:none;width:100%;flex-direction:column;align-items:stretch;gap:0;justify-content:flex-start;max-height:0;overflow:hidden;opacity:0;pointer-events:none;transition:max-height .35s var(--ease),opacity .22s var(--ease);background:rgba(6,6,12,.96);border-bottom:1px solid var(--line);backdrop-filter:blur(16px) saturate(1.12);box-shadow:0 20px 48px rgba(0,0,0,.45);border-radius:0 0 16px 16px}
.nav--open .nav__drawer{max-height:min(88vh,900px);opacity:1;pointer-events:auto;padding-bottom:12px;z-index:200}
.nav__shell{flex-direction:column;align-items:stretch;gap:0;max-width:none;width:100%}
.nav__primary{flex-direction:row;justify-content:center}
.nav__route--main{flex:1;text-align:center;justify-content:center}
.feature-grid{grid-template-columns:1fr}
.hero{min-height:100svh;min-height:100dvh;padding-left:clamp(26px,6vw,56px);padding-right:clamp(16px,4vw,32px)}
.hero__content{padding:max(104px,calc(env(safe-area-inset-top,0px) + 72px)) max(24px,env(safe-area-inset-right)) max(88px,env(safe-area-inset-bottom,0px)) max(24px,env(safe-area-inset-left));max-width:min(100%,48rem);margin-left:0;margin-right:auto;box-sizing:border-box}
.hero__cubes{right:0;bottom:6%;width:min(280px,70vw);opacity:.55}
.hero__lead{font-size:16px}
.hero__actions{flex-direction:column;align-items:stretch}
.hero__actions .btn{width:100%;justify-content:center}
.section{padding:56px 16px}
.section__head{margin-bottom:20px}
.tabs__list{flex-direction:column;align-items:stretch;flex-wrap:nowrap;display:flex;overflow:visible;gap:8px;padding:10px;border-radius:18px;-webkit-overflow-scrolling:touch;scroll-snap-type:none}
.tabs__btn{flex:0 0 auto;width:100%;text-align:center;scroll-snap-align:none;white-space:normal;padding:12px 14px;font-size:14px}.tabs__indicator{display:none!important}
.feature-card__big{font-size:34px}
.social{padding:56px 16px}
.social__inner{padding:18px}
.footer__inner{flex-direction:column;align-items:flex-start;gap:10px}
}
`;
const mqDesktop = `
@media (min-width:901px){
.nav__inner{align-items:center}
.nav__drawer{flex:1 1 auto;width:100%;max-width:min(var(--max),100%);min-width:0;position:relative;display:block}
.nav__links.nav__shell{display:flex;flex-direction:row;flex-wrap:nowrap;align-items:center;justify-content:center;gap:12px;width:100%;max-width:none;margin:0;min-height:0;position:relative}
.nav__primary{position:static;left:auto;top:auto;transform:none;z-index:3;flex:0 0 auto;width:auto;margin:0}
}
`;
const assembled =
  ph +
  "\n" +
  loader +
  nav +
  appWikiReveal +
  heroShell +
  insertAfter +
  insertBlock +
  perfPhoto +
  meteorBlock +
  sections +
  orTeam +
  socialFooter +
  addCarousel +
  mq +
  mqDesktop;
fs.writeFileSync(out, assembled);
console.log("bytes", assembled.length, "path", out);
