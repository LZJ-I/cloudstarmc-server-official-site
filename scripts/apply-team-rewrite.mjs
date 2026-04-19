import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const web = path.join(root, "web");
const cssPath = path.join(web, "css", "style.css");
const idxPath = path.join(web, "index.html");
const jsPath = path.join(web, "js", "main.js");

const TEAM_CSS = `
.feature-card__sub { position: relative; margin: 10px 0 0; }
.team-showcase { max-width: var(--max); margin: 0 auto; padding: 0 4px; }
.team-showcase__box {
  border-radius: calc(var(--radius) + 4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 17, 23, 0.72);
  box-shadow: var(--shadow);
  overflow: hidden;
}
.team-showcase__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 42%);
  gap: 20px 28px;
  padding: 22px 22px 8px;
  align-items: end;
}
.team-showcase__copy h3 {
  margin: 0 0 8px;
  font-size: clamp(22px, 4vw, 30px);
  color: var(--text);
  font-family: Outfit, sans-serif;
  letter-spacing: -0.02em;
}
.team-showcase__role {
  margin: 0 0 12px;
  color: rgba(232, 184, 74, 0.95);
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.team-showcase__bio { margin: 0; font-size: 15px; line-height: 1.65; color: var(--muted); max-width: 52ch; }
.team-showcase__art { position: relative; min-height: 280px; }
.team-showcase__layers {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  pointer-events: none;
}
.team-showcase__layer {
  position: absolute;
  right: 0;
  bottom: 0;
  max-width: 100%;
  transform: translateX(0);
  opacity: 1;
  transition: transform 0.58s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.52s ease;
  will-change: transform, opacity;
}
.team-showcase__layer.is-top { z-index: 2; }
.team-showcase__layer.is-under { z-index: 1; }
.team-showcase__layer img {
  display: block;
  max-height: min(420px, 52vh);
  width: auto;
  max-width: 100%;
  object-fit: contain;
}
.team-showcase__layer.exiting { transform: translateX(33%); opacity: 0; }
.team-showcase__layer.enter-start {
  transition: none !important;
  transform: translateX(36%);
  opacity: 0;
}
.team-showcase__layer.enter-run {
  transition: transform 0.58s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.52s ease !important;
  transform: translateX(0) !important;
  opacity: 1 !important;
}
.team-showcase__row {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
  padding: 16px 16px 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.team-showcase__face {
  width: 56px;
  height: 56px;
  padding: 0;
  border-radius: 14px;
  border: 2px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.35);
  cursor: pointer;
  overflow: hidden;
  transform: scale(1);
  transition: transform 0.28s var(--ease), border-color 0.2s, box-shadow 0.2s;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}
.team-showcase__face img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: pixelated;
  display: block;
}
.team-showcase__face.is-active {
  transform: scale(1.22);
  border-color: rgba(249, 115, 22, 0.95);
  box-shadow: 0 10px 28px rgba(249, 115, 22, 0.25);
}
.team-showcase__track { height: 4px; background: rgba(255, 255, 255, 0.08); }
.team-showcase__fill {
  height: 100%;
  width: 100%;
  transform-origin: left center;
  transform: scaleX(0);
  background: #f97316;
  will-change: transform;
}
@media (max-width: 900px) {
  .team-showcase__grid { grid-template-columns: 1fr; padding: 18px 16px 6px; }
  .team-showcase__art { min-height: 240px; order: -1; }
  .team-showcase__layers { justify-content: center; }
  .team-showcase__layer img { max-height: min(320px, 42vh); margin: 0 auto; }
  .team-showcase__copy { text-align: center; }
  .team-showcase__bio { max-width: none; }
  .team-showcase__row {
    flex-wrap: nowrap;
    overflow-x: auto;
    justify-content: flex-start;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
    gap: 12px;
    padding-bottom: 12px;
  }
  .team-showcase__face { scroll-snap-align: center; }
}
`;

let css = fs.readFileSync(cssPath, "utf8");
const start = css.indexOf(".feature-card__sub { position: relative; margin: 10px 0 0; }");
const end = css.indexOf(".social { padding: 92px 20px; }");
if (start === -1 || end === -1) throw new Error("css slice markers missing");
css = css.slice(0, start) + TEAM_CSS + "\n" + css.slice(end);
fs.writeFileSync(cssPath, css);

const INDEX_SNIP = `<section class="section section--alt" id="team">
<div class="section__head reveal"><h2>认识我们的团队</h2><p>了解让「云星」保持运转的人们 — 布局与交互参考 <a href="https://originrealms.com/" rel="noopener noreferrer" target="_blank" style="color:var(--gold2)">Origin Realms</a> 成员区。</p></div>
<div class="team-showcase reveal" id="teamShowcase">
<div class="team-showcase__box" id="teamShowcaseBox">
<div class="team-showcase__grid">
<div class="team-showcase__copy">
<h3 id="teamCharName"></h3>
<p class="team-showcase__role" id="teamCharRole"></p>
<p class="team-showcase__bio" id="teamCharBio"></p>
</div>
<div class="team-showcase__art">
<div class="team-showcase__layers" id="teamLayers">
<div class="team-showcase__layer is-top" data-layer="0"><img alt="" decoding="async"/></div>
<div class="team-showcase__layer is-under" data-layer="1"><img alt="" decoding="async"/></div>
</div>
</div>
</div>
<div class="team-showcase__row" id="teamAvatars" role="tablist" aria-label="选择成员"></div>
<div class="team-showcase__track" aria-hidden="true"><div class="team-showcase__fill" id="teamProgressFill"></div></div>
</div>
</div>
</section>`;

let html = fs.readFileSync(idxPath, "utf8");
html = html.replace(/data-ip="[^"]*"/, 'data-ip="cloudstarmc.cn"');
html = html.replace(
  /<a class="btn btn--ghost" href="#social">加入 Discord<\/a>/,
  '<a class="btn btn--ghost" href="https://qm.qq.com/q/O79LWnwEAU" target="_blank" rel="noopener noreferrer">加入官方QQ群</a>'
);
html = html.replace(
  /<section class="section section--alt" id="team">[\s\S]*?<\/section>\s*<section class="section social"/,
  INDEX_SNIP + "\n<section class=\"section social\""
);
html = html.replace(/Discord 与游戏内频道联动/, "QQ 群与游戏内公告联动");
html = html.replace(
  /<div><h2>Let&#39;s Be Social!<\/h2><p>在云星，沟通是社区的核心。我们重视 Discord，也重视每一次反馈与相遇 — 来和我们一起，把故事写进同一片星空。<\/p><\/div>/,
  "<div><h2>加入官方 QQ 群</h2><p>在云星，沟通是社区的核心。我们重视官方 QQ 群，也重视每一次反馈与相遇 — 来和我们一起，把故事写进同一片星空。</p></div>"
);
html = html.replace(
  /<a class="btn btn--primary btn--lg" href="#" id="join">加入 Discord<\/a><p class="social__note">链接占位：替换为真实邀请地址。<\/p>/,
  '<a class="btn btn--primary btn--lg" href="https://qm.qq.com/q/O79LWnwEAU" target="_blank" rel="noopener noreferrer" id="join">加入官方QQ群</a>'
);
fs.writeFileSync(idxPath, html);

const MAIN = `const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const QQ_GROUP_URL = "https://qm.qq.com/q/O79LWnwEAU";
const TEAM_TICK_MS = 5000;
const team = [
  { name: "晨星", role: "服主 / 主策划", bio: "负责版本节奏与内容规划，把「每周都有新鲜事」当成默认承诺；不在线时多半在改任务线。", mcUser: "Notch" },
  { name: "深空", role: "技术负责人", bio: "插件栈、性能与发布流水线都归我管；目标是让你只感受到玩法，感受不到卡顿。", mcUser: "Dinnerbone" },
  { name: "琥珀", role: "美术总监", bio: "UI、宣发视觉与游戏内统一气质；坚持像素级一致，让自定义内容看起来像原版的一部分。", mcUser: "jeb_" },
  { name: "季风", role: "世界生成 / 地形", bio: "把群系、结构与探索节奏缝在一起；希望你出门冒险时，每一步都有理由。", mcUser: "Steve" },
  { name: "信标", role: "社区经理", bio: "连接玩家与团队：公告、活动与工单反馈；看到问题会追到底，看到建议也会认真归档。", mcUser: "Alex" },
  { name: "零号", role: "系统运维", bio: "备份、告警、扩容与事故演练；按钮很多，但只为一件事：服务器一直在线。", mcUser: "md_5" },
];
function headUrl(user, size = 128) {
  return "https://mc-heads.net/avatar/" + encodeURIComponent(user) + "/" + size;
}
function bodyPlaceholder(i) {
  const colors = ["#7c3aed", "#db2777", "#f97316", "#0ea5e9", "#22c55e", "#eab308"];
  const c = colors[i % colors.length];
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='360' height='480' viewBox='0 0 360 480'>" +
    "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
    "<stop stop-color='" +
    c +
    "' stop-opacity='0.95'/><stop offset='1' stop-color='#0f1117'/></linearGradient></defs>" +
    "<rect fill='url(#g)' width='360' height='480'/>" +
    "<ellipse cx='180' cy='110' rx='52' ry='58' fill='rgba(255,255,255,0.18)'/>" +
    "<rect x='118' y='185' width='124' height='210' rx='16' fill='rgba(255,255,255,0.12)'/>" +
    "<rect x='100' y='320' width='56' height='88' rx='10' fill='rgba(255,255,255,0.08)'/>" +
    "<rect x='204' y='320' width='56' height='88' rx='10' fill='rgba(255,255,255,0.08)'/></svg>";
  return "data:image/svg+xml," + encodeURIComponent(svg);
}
function bodyUrlFor(m, i) {
  if (m.bodyUrl) return m.bodyUrl;
  return bodyPlaceholder(i);
}
function seedStars() {
  const root = document.getElementById("stars");
  if (!root || prefersReducedMotion) return;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 120; i += 1) {
    const s = document.createElement("span");
    s.className = "star";
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 100 + "%";
    s.style.setProperty("--d", 2 + Math.random() * 4 + "s");
    s.style.setProperty("--o", String(0.2 + Math.random() * 0.8));
    frag.appendChild(s);
  }
  root.appendChild(frag);
}
function observeReveals(nodes) {
  if (prefersReducedMotion) {
    nodes.forEach((n) => n.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { root: null, threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  nodes.forEach((n) => io.observe(n));
}
function initNav() {
  const nav = document.getElementById("nav");
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("nav--scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}
function initNavMobile() {
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const drawer = document.getElementById("navDrawer");
  if (!nav || !toggle || !drawer) return;
  const setOpen = (open) => {
    nav.classList.toggle("nav--open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    document.body.style.overflow = open ? "hidden" : "";
  };
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    setOpen(!nav.classList.contains("nav--open"));
  });
  drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("click", (e) => {
    if (!nav.classList.contains("nav--open")) return;
    if (nav.contains(e.target)) return;
    setOpen(false);
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}
function initTabs() {
  const root = document.querySelector("[data-tabs]");
  if (!root) return;
  const buttons = [...root.querySelectorAll(".tabs__btn")];
  const panels = [...root.querySelectorAll(".tabs__panel")];
  const indicator = root.querySelector(".tabs__indicator span");
  const moveIndicator = (btn) => {
    if (!indicator) return;
    const track = indicator.parentElement;
    if (!track) return;
    const br = btn.getBoundingClientRect();
    const tr = track.getBoundingClientRect();
    const padL = parseFloat(window.getComputedStyle(track).paddingLeft) || 0;
    const borderL = parseFloat(window.getComputedStyle(track).borderLeftWidth) || 0;
    const x = br.left - tr.left - borderL - padL + track.scrollLeft;
    indicator.style.width = br.width + "px";
    indicator.style.transform = "none";
    indicator.style.left = x + "px";
  };
  const activate = (idx) => {
    buttons.forEach((b, i) => {
      const on = i === idx;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    panels.forEach((p, i) => {
      const on = i === idx;
      p.toggleAttribute("hidden", !on);
      p.classList.toggle("is-active", on);
    });
    moveIndicator(buttons[idx]);
  };
  buttons.forEach((btn, idx) => btn.addEventListener("click", () => activate(idx)));
  const list = root.querySelector(".tabs__list");
  list?.addEventListener("scroll", () => {
    const i = buttons.findIndex((b) => b.classList.contains("is-active"));
    if (i >= 0) moveIndicator(buttons[i]);
  });
  window.addEventListener("resize", () => {
    const i = buttons.findIndex((b) => b.classList.contains("is-active"));
    if (i >= 0) moveIndicator(buttons[i]);
  });
  activate(0);
}
function initCopyIp() {
  const btn = document.getElementById("copyIp");
  const hint = document.getElementById("copyHint");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    const ip = btn.getAttribute("data-ip") || "";
    try {
      await navigator.clipboard.writeText(ip);
      if (hint) {
        hint.hidden = false;
        setTimeout(() => {
          hint.hidden = true;
        }, 1600);
      }
    } catch {
      if (hint) {
        hint.textContent = "请手动复制：" + ip;
        hint.hidden = false;
      }
    }
  });
}
function initJoinLinks() {
  document.querySelectorAll("#join, .nav__cta").forEach((el) => {
    if (el && el.tagName === "A") {
      el.setAttribute("href", QQ_GROUP_URL);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    }
  });
}
function initTeamShowcase() {
  const box = document.getElementById("teamShowcaseBox");
  const nameEl = document.getElementById("teamCharName");
  const roleEl = document.getElementById("teamCharRole");
  const bioEl = document.getElementById("teamCharBio");
  const avRow = document.getElementById("teamAvatars");
  const fill = document.getElementById("teamProgressFill");
  const layers = [...document.querySelectorAll(".team-showcase__layer")].map((el) => ({
    el,
    img: el.querySelector("img"),
  }));
  if (!box || !nameEl || !roleEl || !bioEl || !avRow || !fill || layers.length !== 2) return;
  let charIndex = 0;
  let topIdx = 0;
  let faceButtons = [];
  let progressMs = 0;
  let paused = false;
  let lastTs = performance.now();
  const setText = () => {
    const m = team[charIndex];
    nameEl.textContent = m.name;
    roleEl.textContent = m.role;
    bioEl.textContent = m.bio;
    faceButtons.forEach((b, i) => b.classList.toggle("is-active", i === charIndex));
  };
  const resetProgress = () => {
    progressMs = 0;
    fill.style.transform = "scaleX(0)";
  };
  const swapImage = (nextIdx) => {
    const top = layers[topIdx];
    const bot = layers[1 - topIdx];
    const nextUrl = bodyUrlFor(team[nextIdx], nextIdx);
    const onEnd = (ev) => {
      if (ev.target !== top.el) return;
      top.el.removeEventListener("transitionend", onEnd);
      top.el.classList.remove("exiting");
      top.el.classList.remove("is-top");
      top.el.classList.add("is-under");
      bot.el.classList.remove("enter-run");
      bot.el.classList.remove("enter-start");
      bot.el.classList.remove("is-under");
      bot.el.classList.add("is-top");
      topIdx = 1 - topIdx;
    };
    bot.img.src = nextUrl;
    bot.img.alt = team[nextIdx].name + " 全身立绘";
    bot.el.classList.remove("exiting", "enter-run");
    bot.el.classList.add("enter-start");
    void bot.el.offsetWidth;
    top.el.classList.add("exiting");
    bot.el.classList.remove("enter-start");
    bot.el.classList.add("enter-run");
    top.el.addEventListener("transitionend", onEnd);
  };
  const goTo = (nextIdx, opts) => {
    const o = opts || {};
    if (nextIdx === charIndex && !o.force) return;
    const prev = charIndex;
    charIndex = (nextIdx + team.length) % team.length;
    if (!prefersReducedMotion && prev !== charIndex) swapImage(charIndex);
    else {
      layers[topIdx].img.src = bodyUrlFor(team[charIndex], charIndex);
      layers[topIdx].img.alt = team[charIndex].name + " 全身立绘";
    }
    setText();
    if (!o.keepProgress) resetProgress();
  };
  layers[0].img.src = bodyUrlFor(team[0], 0);
  layers[0].img.alt = team[0].name + " 全身立绘";
  layers[1].img.src = bodyUrlFor(team[1], 1);
  layers[1].img.alt = team[1].name + " 全身立绘";
  team.forEach((m, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "team-showcase__face";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", i === 0 ? "true" : "false");
    b.setAttribute("aria-label", m.name);
    const im = document.createElement("img");
    im.src = headUrl(m.mcUser, 64);
    im.alt = "";
    im.width = 56;
    im.height = 56;
    im.loading = "lazy";
    b.appendChild(im);
    b.addEventListener("click", () => goTo(i, {}));
    avRow.appendChild(b);
    faceButtons.push(b);
  });
  setText();
  const tick = (ts) => {
    const dt = ts - lastTs;
    lastTs = ts;
    if (!paused && !prefersReducedMotion) {
      progressMs += dt;
      const p = Math.min(1, progressMs / TEAM_TICK_MS);
      fill.style.transform = "scaleX(" + p + ")";
      if (progressMs >= TEAM_TICK_MS) {
        goTo(charIndex + 1, { keepProgress: true });
        resetProgress();
      }
    }
    requestAnimationFrame(tick);
  };
  box.addEventListener("mouseenter", () => {
    paused = true;
  });
  box.addEventListener("mouseleave", () => {
    paused = false;
    lastTs = performance.now();
  });
  if (!prefersReducedMotion) requestAnimationFrame(tick);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) paused = true;
    else {
      paused = false;
      lastTs = performance.now();
    }
  });
}
seedStars();
initTeamShowcase();
initNav();
initNavMobile();
initTabs();
initCopyIp();
initJoinLinks();
observeReveals(document.querySelectorAll(".reveal"));
`;

fs.writeFileSync(jsPath, MAIN);
console.log("patched css, index.html, main.js");
