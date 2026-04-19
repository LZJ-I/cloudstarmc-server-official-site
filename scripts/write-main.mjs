import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const target = join(__dirname, "..", "web", "js", "main.js");

const code = `const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("nav--open")));
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

function initTeamCarousel() {
  const headEl = document.getElementById("teamHead");
  const nameEl = document.getElementById("teamName");
  const roleEl = document.getElementById("teamRole");
  const bioEl = document.getElementById("teamBio");
  const thumbsEl = document.getElementById("teamThumbs");
  const dotsEl = document.getElementById("teamDots");
  const prevBtn = document.getElementById("teamPrev");
  const nextBtn = document.getElementById("teamNext");
  const card = document.getElementById("teamCard");
  if (!headEl || !nameEl || !roleEl || !bioEl || !thumbsEl || !dotsEl || !prevBtn || !nextBtn || !card) return;

  let index = 0;
  let autoTimer = null;
  const AUTO_MS = 6500;
  const thumbButtons = [];
  const dotButtons = [];

  const renderChrome = () => {
    thumbsEl.innerHTML = "";
    dotsEl.innerHTML = "";
    team.forEach((m, i) => {
      const tb = document.createElement("button");
      tb.type = "button";
      tb.className = "team-carousel__thumb";
      tb.setAttribute("role", "tab");
      tb.setAttribute("aria-selected", i === 0 ? "true" : "false");
      tb.setAttribute("aria-label", m.name);
      const im = document.createElement("img");
      im.src = headUrl(m.mcUser, 64);
      im.alt = "";
      im.width = 52;
      im.height = 52;
      im.loading = "lazy";
      tb.appendChild(im);
      tb.addEventListener("click", () => setIndex(i));
      thumbsEl.appendChild(tb);
      thumbButtons.push(tb);

      const db = document.createElement("button");
      db.type = "button";
      db.className = "team-carousel__dot";
      db.setAttribute("aria-label", "第 " + (i + 1) + " 位");
      db.addEventListener("click", () => setIndex(i));
      dotsEl.appendChild(db);
      dotButtons.push(db);
    });
  };

  const apply = () => {
    const m = team[index];
    headEl.src = headUrl(m.mcUser, 128);
    headEl.alt = m.name + " 的 Minecraft 头像";
    nameEl.textContent = m.name;
    roleEl.textContent = m.role;
    bioEl.textContent = m.bio;
    thumbButtons.forEach((tb, i) => {
      tb.classList.toggle("is-active", i === index);
      tb.setAttribute("aria-selected", i === index ? "true" : "false");
    });
    dotButtons.forEach((db, i) => db.classList.toggle("is-active", i === index));
  };

  const clearAuto = () => {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = null;
  };

  const startAuto = () => {
    if (prefersReducedMotion) return;
    clearAuto();
    autoTimer = window.setInterval(() => {
      setIndex((index + 1) % team.length, { silent: true });
    }, AUTO_MS);
  };

  const setIndex = (i, opts) => {
    index = (i + team.length) % team.length;
    apply();
    if (!opts || !opts.silent) {
      clearAuto();
      startAuto();
    }
  };

  renderChrome();
  apply();
  startAuto();

  prevBtn.addEventListener("click", () => setIndex(index - 1));
  nextBtn.addEventListener("click", () => setIndex(index + 1));

  let tx = 0;
  card.addEventListener(
    "touchstart",
    (e) => {
      tx = e.changedTouches[0].clientX;
    },
    { passive: true }
  );
  card.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) < 48) return;
      if (dx > 0) setIndex(index - 1);
      else setIndex(index + 1);
    },
    { passive: true }
  );

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearAuto();
    else startAuto();
  });
}

seedStars();
initTeamCarousel();
initNav();
initNavMobile();
initTabs();
initCopyIp();
observeReveals(document.querySelectorAll(".reveal"));
`;

writeFileSync(target, code);
console.log("written", target);
