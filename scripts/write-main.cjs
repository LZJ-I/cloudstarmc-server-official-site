const fs = require("fs");
const p = "D:/server-official-site/web/js/main.js";
const code = `const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
function headUrl(user, size) {
  size = size || 128;
  return "https://mc-heads.net/avatar/" + encodeURIComponent(user) + "/" + size;
}
function bodyPlaceholder(i) {
  var colors = ["#7c3aed", "#db2777", "#f97316", "#0ea5e9", "#22c55e", "#eab308"];
  var c = colors[i % colors.length];
  var svg =
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
  var root = document.getElementById("stars");
  if (!root || prefersReducedMotion) return;
  var frag = document.createDocumentFragment();
  for (var i = 0; i < 120; i += 1) {
    var s = document.createElement("span");
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
    nodes.forEach(function (n) {
      n.classList.add("is-visible");
    });
    return;
  }
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { root: null, threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  nodes.forEach(function (n) {
    io.observe(n);
  });
}
function initNav() {
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("nav--scrolled", window.scrollY > 12);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}
function initNavMobile() {
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  var drawer = document.getElementById("navDrawer");
  if (!nav || !toggle || !drawer) return;
  function setOpen(open) {
    nav.classList.toggle("nav--open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    document.body.style.overflow = open ? "hidden" : "";
  }
  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    setOpen(!nav.classList.contains("nav--open"));
  });
  drawer.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      setOpen(false);
    });
  });
  document.addEventListener("click", function (e) {
    if (!nav.classList.contains("nav--open")) return;
    if (nav.contains(e.target)) return;
    setOpen(false);
  });
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false);
  });
}
function initTabs() {
  var root = document.querySelector("[data-tabs]");
  if (!root) return;
  var buttons = Array.prototype.slice.call(root.querySelectorAll(".tabs__btn"));
  var panels = Array.prototype.slice.call(root.querySelectorAll(".tabs__panel"));
  var indicator = root.querySelector(".tabs__indicator span");
  function moveIndicator(btn) {
    if (!indicator) return;
    var track = indicator.parentElement;
    if (!track) return;
    var br = btn.getBoundingClientRect();
    var tr = track.getBoundingClientRect();
    var padL = parseFloat(window.getComputedStyle(track).paddingLeft) || 0;
    var borderL = parseFloat(window.getComputedStyle(track).borderLeftWidth) || 0;
    var x = br.left - tr.left - borderL - padL + track.scrollLeft;
    indicator.style.width = br.width + "px";
    indicator.style.transform = "none";
    indicator.style.left = x + "px";
  }
  function activate(idx) {
    buttons.forEach(function (b, i) {
      var on = i === idx;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    panels.forEach(function (p, i) {
      var on = i === idx;
      p.toggleAttribute("hidden", !on);
      p.classList.toggle("is-active", on);
    });
    moveIndicator(buttons[idx]);
  }
  buttons.forEach(function (btn, idx) {
    btn.addEventListener("click", function () {
      activate(idx);
    });
  });
  var list = root.querySelector(".tabs__list");
  if (list) {
    list.addEventListener("scroll", function () {
      var i = buttons.findIndex(function (b) {
        return b.classList.contains("is-active");
      });
      if (i >= 0) moveIndicator(buttons[i]);
    });
  }
  window.addEventListener("resize", function () {
    var i = buttons.findIndex(function (b) {
      return b.classList.contains("is-active");
    });
    if (i >= 0) moveIndicator(buttons[i]);
  });
  activate(0);
}
function initCopyIp() {
  var btn = document.getElementById("copyIp");
  var hint = document.getElementById("copyHint");
  if (!btn) return;
  btn.addEventListener("click", function () {
    var ip = btn.getAttribute("data-ip") || "";
    return navigator.clipboard.writeText(ip).then(
      function () {
        if (hint) {
          hint.hidden = false;
          setTimeout(function () {
            hint.hidden = true;
          }, 1600);
        }
      },
      function () {
        if (hint) {
          hint.textContent = "请手动复制：" + ip;
          hint.hidden = false;
        }
      }
    );
  });
}
function initJoinLinks() {
  document.querySelectorAll("#join, .nav__cta").forEach(function (el) {
    if (el && el.tagName === "A") {
      el.setAttribute("href", QQ_GROUP_URL);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    }
  });
}
function initTeamShowcase() {
  var box = document.getElementById("teamShowcaseBox");
  var nameEl = document.getElementById("teamCharName");
  var roleEl = document.getElementById("teamCharRole");
  var bioEl = document.getElementById("teamCharBio");
  var avRow = document.getElementById("teamAvatars");
  var fill = document.getElementById("teamProgressFill");
  var prevBtn = document.getElementById("teamPrev");
  var nextBtn = document.getElementById("teamNext");
  var layerEls = Array.prototype.slice.call(document.querySelectorAll(".team-showcase__layer"));
  var layers = layerEls.map(function (el) {
    return { el: el, img: el.querySelector("img") };
  });
  if (!box || !nameEl || !roleEl || !bioEl || !avRow || !fill || layers.length !== 2) return;
  var charIndex = 0;
  var topIdx = 0;
  var faceButtons = [];
  var progressMs = 0;
  var paused = false;
  var lastTs = performance.now();
  function setText() {
    var m = team[charIndex];
    nameEl.textContent = m.name;
    roleEl.textContent = m.role;
    bioEl.textContent = m.bio;
    faceButtons.forEach(function (b, i) {
      b.classList.toggle("is-active", i === charIndex);
    });
  }
  function resetProgress() {
    progressMs = 0;
    fill.style.transform = "scaleX(0)";
  }
  function swapImage(nextIdx) {
    var top = layers[topIdx];
    var bot = layers[1 - topIdx];
    var nextUrl = bodyUrlFor(team[nextIdx], nextIdx);
    function afterTopOut(ev) {
      if (ev.target !== top.el) return;
      if (ev.propertyName !== "transform") return;
      top.el.removeEventListener("transitionend", afterTopOut);
      top.el.classList.remove("is-top");
      top.el.classList.add("is-under");
      bot.el.classList.remove("enter-start", "is-under");
      bot.el.classList.add("is-top");
      topIdx = 1 - topIdx;
      void bot.el.offsetWidth;
      top.el.classList.remove("exiting");
      bot.el.classList.add("enter-run");
      function afterBotIn(ev) {
        if (ev.target !== bot.el) return;
        if (ev.propertyName !== "transform") return;
        bot.el.removeEventListener("transitionend", afterBotIn);
        bot.el.classList.remove("enter-run");
      }
      bot.el.addEventListener("transitionend", afterBotIn, { once: true });
    }
    bot.img.src = nextUrl;
    bot.img.alt = team[nextIdx].name + " 全身立绘";
    bot.el.classList.remove("exiting", "enter-run");
    bot.el.classList.add("enter-start");
    void bot.el.offsetWidth;
    top.el.classList.add("exiting");
    top.el.addEventListener("transitionend", afterTopOut);
  }
  function goTo(nextIdx, opts) {
    opts = opts || {};
    if (nextIdx === charIndex && !opts.force) return;
    var prev = charIndex;
    charIndex = (nextIdx + team.length) % team.length;
    if (!prefersReducedMotion && prev !== charIndex) swapImage(charIndex);
    else {
      layers[topIdx].img.src = bodyUrlFor(team[charIndex], charIndex);
      layers[topIdx].img.alt = team[charIndex].name + " 全身立绘";
    }
    setText();
    if (!opts.keepProgress) resetProgress();
  }
  layers[0].img.src = bodyUrlFor(team[0], 0);
  layers[0].img.alt = team[0].name + " 全身立绘";
  layers[1].img.src = bodyUrlFor(team[1], 1);
  layers[1].img.alt = team[1].name + " 全身立绘";
  team.forEach(function (m, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "team-showcase__face";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", i === 0 ? "true" : "false");
    b.setAttribute("aria-label", m.name);
    var im = document.createElement("img");
    im.src = headUrl(m.mcUser, 64);
    im.alt = "";
    im.width = 56;
    im.height = 56;
    im.loading = "lazy";
    b.appendChild(im);
    b.addEventListener("click", function () {
      goTo(i, {});
    });
    avRow.appendChild(b);
    faceButtons.push(b);
  });
  setText();
  function tick(ts) {
    var dt = ts - lastTs;
    lastTs = ts;
    if (!paused && !prefersReducedMotion) {
      progressMs += dt;
      var p = Math.min(1, progressMs / TEAM_TICK_MS);
      fill.style.transform = "scaleX(" + p + ")";
      if (progressMs >= TEAM_TICK_MS) {
        goTo(charIndex + 1, { keepProgress: true });
        resetProgress();
      }
    }
    requestAnimationFrame(tick);
  }
  box.addEventListener("mouseenter", function () {
    paused = true;
  });
  box.addEventListener("mouseleave", function () {
    paused = false;
    lastTs = performance.now();
  });
  if (!prefersReducedMotion) requestAnimationFrame(tick);
  document.addEventListener("visibilitychange", function () {
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
fs.writeFileSync(p, code);
console.log("wrote main.js");
