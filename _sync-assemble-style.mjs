import fs from "node:fs";
const p = new URL("./scripts/assemble-style.mjs", import.meta.url);
let s = fs.readFileSync(p, "utf8");
const reps = [
  [
    ".star{position:absolute;width:2px;height:2px;border-radius:50%;background:rgba(255,255,255,.85);box-shadow:0 0 6px rgba(255,255,255,.35);animation:starTwinkle var(--d,3s) ease-in-out infinite;opacity:var(--o,.6)}",
    ".star{position:absolute;width:1.5px;height:1.5px;border-radius:50%;background:rgba(255,255,255,.45);box-shadow:0 0 4px rgba(255,255,255,.12);animation:starTwinkle var(--d,3s) ease-in-out infinite;opacity:var(--o,.35)}",
  ],
  [
    "@keyframes starTwinkle{0%,100%{opacity:.25;transform:scale(.85)}50%{opacity:1;transform:scale(1.1)}}",
    "@keyframes starTwinkle{0%,100%{opacity:.28;transform:scale(.88)}50%{opacity:.55;transform:scale(1)}}",
  ],
  [
    ".hero__content{position:relative;z-index:3;max-width:var(--max);width:100%;margin:0;text-align:left;padding:clamp(88px,14vh,136px) max(20px,env(safe-area-inset-right)) max(80px,env(safe-area-inset-bottom,0px)) max(20px,env(safe-area-inset-left))}",
    ".hero__content{position:relative;z-index:3;max-width:var(--max);width:100%;margin:0 auto;text-align:center;padding:clamp(88px,14vh,136px) max(24px,env(safe-area-inset-right)) max(80px,env(safe-area-inset-bottom,0px)) max(24px,env(safe-area-inset-left))}",
  ],
  [
    ".hero__lead{max-width:52ch;margin:0 0 28px;font-size:clamp(1rem,1.9vw,1.15rem);color:rgba(226,232,240,.88)}",
    ".hero__lead{max-width:52ch;margin:0 auto 28px;font-size:clamp(1rem,1.9vw,1.15rem);color:rgba(226,232,240,.88)}",
  ],
  [
    ".hero__actions{display:flex;flex-wrap:wrap;gap:12px;justify-content:flex-start;align-items:center;margin-bottom:8px}",
    ".hero__actions{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:center;margin-bottom:8px}",
  ],
  [
    ".hero__scroll{position:absolute;left:max(20px,env(safe-area-inset-left,0px));bottom:max(24px,env(safe-area-inset-bottom,0px));z-index:3;opacity:.55}",
    ".hero__scroll{position:absolute;left:50%;bottom:max(24px,env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:3;opacity:.55}",
  ],
  [
    ".tabs__btn{position:relative;z-index:1;padding:10px 16px;border-radius:999px;border:0;background:transparent;color:rgba(226,232,240,.78);font-weight:800;font-size:14px;cursor:pointer;transition:color .25s var(--ease),background .25s var(--ease)}",
    ".tabs__btn{position:relative;z-index:2;padding:10px 16px;border-radius:999px;border:0;background:transparent;color:rgba(226,232,240,.78);font-weight:800;font-size:14px;cursor:pointer;transition:color .25s var(--ease),background .25s var(--ease);-webkit-tap-highlight-color:transparent}",
  ],
  [
    ".tabs__indicator{position:absolute;pointer-events:none}",
    ".tabs__indicator{position:absolute;inset:0;pointer-events:none;z-index:0;border-radius:inherit}\n.tabs__indicator span{position:absolute;top:6px;bottom:6px;left:0;width:0;border-radius:999px;background:rgba(255,255,255,.07);transition:left .28s var(--ease),width .28s var(--ease)}",
  ],
  [
    ".tabs__panel{display:grid;min-height:0}",
    ".tabs__panel{display:grid;min-height:0}\n.tabs__panel[hidden]{display:none!important}\n.tabs__panel.is-active{display:grid!important}",
  ],
  [
    ".or-team__pix-chev{display:flex;gap:3px;align-items:center;justify-content:center}\n.or-team__pix-dot{width:5px;height:5px;border-radius:1px;background:rgba(253,186,116,.75)}",
    '.or-team__mc-chev{display:inline-grid;place-items:center;width:20px;height:28px;vertical-align:middle}\n.or-team__mc-chev::before{content:"";display:block;width:4px;height:4px;background:#fcd34d;box-shadow:0 4px 0 0 #fcd34d,4px 4px 0 0 #fcd34d,0 8px 0 0 #fcd34d,4px 8px 0 0 #fcd34d,8px 8px 0 0 #fcd34d,0 12px 0 0 #fcd34d,4px 12px 0 0 #fcd34d,8px 12px 0 0 #fcd34d,12px 12px 0 0 #fcd34d,0 16px 0 0 #fcd34d,4px 16px 0 0 #fcd34d,8px 16px 0 0 #fcd34d,0 20px 0 0 #fcd34d,4px 20px 0 0 #fcd34d,0 24px 0 0 #fcd34d;image-rendering:pixelated}\n.or-team__mc-chev--r{transform:scaleX(-1)}',
  ],
];
for (const [a, b] of reps) {
  if (!s.includes(a)) {
    console.error("skip or missing:", a.slice(0, 70));
    process.exit(1);
  }
  s = s.split(a).join(b);
}
const needle =
  "@media (prefers-reduced-motion:reduce){.reveal,.reveal.is-visible{transition-duration:.01ms!important;filter:none!important;transform:none!important;opacity:1!important}}\n`;";
const insert =
  "@media (prefers-reduced-motion:reduce){.reveal,.reveal.is-visible{transition-duration:.01ms!important;filter:none!important;transform:none!important;opacity:1!important}}\n.tabs.reveal,.tabs.reveal.is-visible{filter:none;will-change:opacity,transform;transition:opacity .6s var(--ease),transform .65s var(--ease)}\n.tabs.reveal:not(.is-visible){opacity:0;transform:translateY(16px)}\n.tabs.reveal.is-visible{opacity:1;transform:none}\n`;";
if (!s.includes(needle)) {
  console.error("needle missing");
  process.exit(1);
}
s = s.split(needle).join(insert);
fs.writeFileSync(p, s);
console.log("assemble-style synced");
