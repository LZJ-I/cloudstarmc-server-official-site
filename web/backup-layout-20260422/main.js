import { mountHomePartial, initRoutes } from "./routes.js";
import { bootTeam } from "./team.js";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const QQ_GROUP_URL = "https://qm.qq.com/q/O79LWnwEAU";
function absUrl(p) {
  try {
    return new URL(p, document.baseURI).href;
  } catch (e) {
    return p;
  }
}

function parseFeaturesJson(text) {
  try {
    return JSON.parse(String(text || "").replace(/^\uFEFF/, ""));
  } catch (e) {
    return null;
  }
}

var DEFAULT_FEATURES = {
  section: {
    title: "云星能带给你什么",
    subtitle:
      "周更内容、探索节奏与社区运营，为 Java 版生存玩家准备；以下为云星当前侧重的体验模块。",
  },
  tabs: [
    {
      label: "自定义内容",
      title: "每周新内容",
      body: "任务线、副本与原创玩法持续迭代；团队用版本节奏保证你总有新目标可追。",
      ticks: ["原创机制与平衡补丁", "与生存进度自然衔接", "公开路线图与反馈渠道"],
      card: { kicker: "运营", big: "周更", sub: "活动、商店轮换与限时挑战同步上线。" },
    },
    {
      label: "世界与探索",
      title: "值得探索的世界",
      body: "地形、生态与结构点经过手工调校；远足、建家、刷物资都能找到舒适节奏。",
      ticks: ["可读的地图层次与地标", "多人协作友好的资源分布", "轻量引导，重探索奖励"],
      card: {
        kicker: "世界",
        big: "可读性",
        sub: "一眼看懂「去哪冒险」，减少无意义跑图。",
        variant: "alt",
      },
    },
    {
      label: "社区活动",
      title: "社区优先",
      body: "我们相信沟通是社区的灵魂：官方 QQ 群与游戏内频道联动，公告、投票与共创透明可见。",
      ticks: ["新手友好与反作弊底线", "定期 AMA 与策划面对面", "玩家创意进入正式内容池"],
      card: { kicker: "社群", big: "同频", sub: "活动日历 + 机器人提醒，重要节点不错过。" },
    },
    {
      label: "性能与稳定",
      title: "为高峰而生",
      body: "硬件与插件栈为「多人在线」优化：延迟、TPS 与备份策略是日常运维的默认项，而不是口号。",
      ticks: ["自动化巡检与告警", "多地备份与快速回滚", "可观测指标对管理团队开放摘要"],
      card: { kicker: "运维", big: "稳", sub: "峰值在线同样保持可玩性。", variant: "alt" },
    },
  ],
};

async function mountFeaturesFromApi() {
  var head = document.getElementById("featuresHead");
  var tabsRoot = document.getElementById("featuresTabs");
  if (!head || !tabsRoot) return;
  var data = null;
  try {
    var r = await fetch(absUrl("/api/features"));
    if (r.ok) data = parseFeaturesJson(await r.text());
  } catch (e) {}
  if (!data || !Array.isArray(data.tabs) || !data.tabs.length) {
    try {
      var r2 = await fetch(absUrl("features/features.json"));
      if (r2.ok) data = parseFeaturesJson(await r2.text());
    } catch (e2) {}
  }
  if (!data || !Array.isArray(data.tabs) || !data.tabs.length) {
    data = DEFAULT_FEATURES;
  }
  var sec = data.section || {};
  var h2 = document.createElement("h2");
  h2.textContent = sec.title || "";
  var pp = document.createElement("p");
  pp.textContent = sec.subtitle || "";
  head.appendChild(h2);
  head.appendChild(pp);
  var list = document.createElement("div");
  list.className = "tabs__list";
  list.setAttribute("role", "tablist");
  var panels = document.createElement("div");
  panels.className = "tabs__panels";
  var indWrap = document.createElement("div");
  indWrap.className = "tabs__indicator";
  indWrap.setAttribute("aria-hidden", "true");
  var indSpan = document.createElement("span");
  indWrap.appendChild(indSpan);
  data.tabs.forEach(function (tab, idx) {
    var btn = document.createElement("button");
    btn.className = "tabs__btn" + (idx === 0 ? " is-active" : "");
    btn.type = "button";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", idx === 0 ? "true" : "false");
    btn.setAttribute("data-tab", String(idx));
    btn.textContent = tab.label || "";
    list.appendChild(btn);
    var panel = document.createElement("div");
    panel.className = "tabs__panel" + (idx === 0 ? " is-active" : "");
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("data-panel", String(idx));
    if (idx !== 0) panel.setAttribute("hidden", "");
    var grid = document.createElement("div");
    grid.className = "feature-grid";
    var left = document.createElement("div");
    var h3 = document.createElement("h3");
    h3.textContent = tab.title || "";
    left.appendChild(h3);
    var bp = document.createElement("p");
    bp.textContent = tab.body || "";
    left.appendChild(bp);
    if (Array.isArray(tab.ticks) && tab.ticks.length) {
      var ul = document.createElement("ul");
      ul.className = "ticks";
      tab.ticks.forEach(function (t) {
        var li = document.createElement("li");
        li.textContent = t;
        ul.appendChild(li);
      });
      left.appendChild(ul);
    }
    var card = tab.card || {};
    var cardEl = document.createElement("div");
    cardEl.className = "feature-card" + (card.variant === "alt" ? " feature-card--alt" : "");
    var glow = document.createElement("div");
    glow.className = "feature-card__glow";
    var pk = document.createElement("p");
    pk.className = "feature-card__kicker";
    pk.textContent = card.kicker || "";
    var pb = document.createElement("p");
    pb.className = "feature-card__big";
    pb.textContent = card.big || "";
    var ps = document.createElement("p");
    ps.className = "feature-card__sub";
    ps.textContent = card.sub || "";
    cardEl.appendChild(glow);
    cardEl.appendChild(pk);
    cardEl.appendChild(pb);
    cardEl.appendChild(ps);
    grid.appendChild(left);
    grid.appendChild(cardEl);
    panel.appendChild(grid);
    panels.appendChild(panel);
  });
  list.appendChild(indWrap);
  tabsRoot.appendChild(list);
  tabsRoot.appendChild(panels);
  document.querySelectorAll("#features .reveal").forEach(function (el) {
    el.classList.add("is-visible");
  });
}

function seedStars() {
  var root = document.getElementById("stars");
  if (!root || prefersReducedMotion) return;
  var frag = document.createDocumentFragment();
  for (var i = 0; i < 38; i += 1) {
    var s = document.createElement("span");
    s.className = "star";
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 100 + "%";
    s.style.setProperty("--d", 3 + Math.random() * 5 + "s");
    s.style.setProperty("--o", String(0.08 + Math.random() * 0.35));
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
    toggle.setAttribute("aria-label", open ? "\u5173\u95ed\u83dc\u5355" : "\u6253\u5f00\u83dc\u5355");
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
function initTabs(root) {
  root = root || document.querySelector("[data-tabs]");
  if (!root) return;
  var buttons = Array.prototype.slice.call(root.querySelectorAll(".tabs__btn"));
  var panels = Array.prototype.slice.call(root.querySelectorAll(".tabs__panel"));
  if (!buttons.length) return;
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
      p.classList.toggle("is-active", on);
      if (on) p.removeAttribute("hidden");
      else p.setAttribute("hidden", "");
    });
    moveIndicator(buttons[idx]);
  }
  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      var t = Number(b.getAttribute("data-tab"));
      activate(isNaN(t) ? 0 : t);
    });
  });
  var list = root.querySelector(".tabs__list");
  if (list) {
    list.addEventListener("scroll", function () {
      var i = -1;
      for (var j = 0; j < buttons.length; j += 1) {
        if (buttons[j].classList.contains("is-active")) {
          i = j;
          break;
        }
      }
      if (i >= 0) moveIndicator(buttons[i]);
    });
  }
  window.addEventListener("resize", function () {
    var i = 0;
    for (; i < buttons.length; i += 1) {
      if (buttons[i].classList.contains("is-active")) break;
    }
    if (i < buttons.length) moveIndicator(buttons[i]);
  });
  activate(0);
  window.requestAnimationFrame(function () {
    window.requestAnimationFrame(function () {
      var j = 0;
      for (; j < buttons.length; j += 1) {
        if (buttons[j].classList.contains("is-active")) {
          moveIndicator(buttons[j]);
          break;
        }
      }
    });
  });
}
function copyWithExecCommand(text) {
  var ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  var ok = false;
  try {
    ok = document.execCommand("copy");
  } catch (e) {}
  document.body.removeChild(ta);
  return ok;
}
function initCopyIp() {
  var btn = document.getElementById("copyIp");
  var hint = document.getElementById("copyHint");
  if (!btn) return;
  var ip = btn.getAttribute("data-ip") || "";
  var hintOkText = hint ? hint.textContent.trim() : "";
  btn.addEventListener("click", function () {
    function showOk() {
      if (hint) {
        hint.textContent = hintOkText || "\u5df2\u590d\u5236\u5230\u526a\u8d34\u677f";
        hint.hidden = false;
        setTimeout(function () {
          hint.hidden = true;
        }, 1600);
      }
    }
    function showFail() {
      if (hint) {
        hint.textContent = "\u8bf7\u624b\u52a8\u590d\u5236\uff1a" + ip;
        hint.hidden = false;
      }
    }
    if (copyWithExecCommand(ip)) {
      showOk();
      return;
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(ip).then(showOk, showFail);
    } else {
      showFail();
    }
  });
}
function initJoinLinks() {
  document.querySelectorAll("#join").forEach(function (el) {
    if (el && el.tagName === "A") {
      el.setAttribute("href", QQ_GROUP_URL);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    }
  });
}

function initHeroPhoto() {
  var wrap = document.querySelector(".hero__photo");
  var img = wrap && wrap.querySelector(".hero__photo-img");
  if (!wrap || !img) return;
  var done = false;
  var fallbackTimer = window.setTimeout(reveal, 2800);
  function reveal() {
    if (done) return;
    done = true;
    window.clearTimeout(fallbackTimer);
    wrap.classList.add("is-loaded");
  }
  function onReady() {
    reveal();
  }
  if (img.complete && img.naturalWidth > 0) {
    requestAnimationFrame(onReady);
  } else {
    img.addEventListener("load", onReady, { once: true });
    img.addEventListener("error", onReady, { once: true });
  }
}

function dismissPageLoader() {
  var loader = document.getElementById("page-loader");
  document.documentElement.classList.remove("is-booting");
  document.body.classList.remove("is-booting");
  if (!loader) return;
  loader.setAttribute("aria-busy", "false");
  loader.classList.add("is-exit");
  function remove() {
    loader.remove();
  }
  loader.addEventListener(
    "transitionend",
    function (e) {
      if (e.propertyName === "opacity" || e.propertyName === "visibility") remove();
    },
    false
  );
  window.setTimeout(remove, prefersReducedMotion ? 80 : 900);
}

async function boot() {
  var minShow = new Promise(function (resolve) {
    window.setTimeout(resolve, prefersReducedMotion ? 0 : 520);
  });
  var fontsReady =
    document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  try {
    await Promise.all([mountHomePartial(), minShow, fontsReady]);
    await mountFeaturesFromApi();
  } catch (err) {
    console.error(err);
  }
  initRoutes(function () {
    var wikiNodes = document.querySelectorAll("#view-wiki .reveal");
    observeReveals(wikiNodes);
    var delay = prefersReducedMotion ? 0 : 500;
    window.setTimeout(function () {
      wikiNodes.forEach(function (n) {
        if (!n.classList.contains("is-visible")) n.classList.add("is-visible");
      });
    }, delay);
  });
  initHeroPhoto();
  seedStars();
  initNav();
  initNavMobile();
  initTabs(document.getElementById("featuresTabs"));
  initCopyIp();
  initJoinLinks();
  (function observeHomeRevealsOnly() {
    var wikiRoot = document.getElementById("view-wiki");
    var list = [];
    document.querySelectorAll(".reveal").forEach(function (n) {
      if (wikiRoot && wikiRoot.contains(n)) return;
      list.push(n);
    });
    observeReveals(list);
  })();
  var __ot = document.getElementById("orTeam");
  if (__ot) __ot.classList.add("is-visible");
  bootTeam();
  dismissPageLoader();
}
boot();
