import { mountHomePartial, initRoutes } from "./routes.js";
import { bootTeam } from "./team.js";
import { initAtmosphere } from "./atmosphere.js";

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

function parseJoinGuideJson(text) {
  try {
    return JSON.parse(String(text || "").replace(/^\uFEFF/, ""));
  } catch (e) {
    return null;
  }
}

function applyServerVersionPill(data) {
  var si = data && data.serverInfo;
  var rows = si && Array.isArray(si.rows) ? si.rows : [];
  var ver = "";
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    if (row && String(row.dt) === "游戏版本") {
      ver = row.dd != null ? String(row.dd).trim() : "";
      break;
    }
  }
  if (!ver) return;
  document.querySelectorAll(".js-server-version").forEach(function (el) {
    el.textContent = ver;
  });
}

function joinGuideBodyWithIp(p, body, serverIp) {
  var t = body != null ? String(body) : "";
  var ip = serverIp != null ? String(serverIp) : "";
  p.textContent = "";
  if (!ip || t.indexOf(ip) === -1) {
    p.textContent = t;
    return;
  }
  var parts = t.split(ip);
  for (var i = 0; i < parts.length; i += 1) {
    if (parts[i]) p.appendChild(document.createTextNode(parts[i]));
    if (i < parts.length - 1) {
      var code = document.createElement("code");
      code.textContent = ip;
      p.appendChild(code);
    }
  }
}

function mountJoinGuideKvCard(title, block) {
  var card = document.createElement("div");
  card.className = "join-guide__card";
  var h3 = document.createElement("h3");
  h3.className = "join-guide__card-title";
  h3.textContent = title || "";
  var dl = document.createElement("dl");
  dl.className = "join-guide__kv";
  var rows = block && Array.isArray(block.rows) ? block.rows : [];
  rows.forEach(function (row) {
    var wrap = document.createElement("div");
    var dt = document.createElement("dt");
    dt.textContent = row && row.dt != null ? String(row.dt) : "";
    var dd = document.createElement("dd");
    var val = row && row.dd != null ? String(row.dd) : "";
    if (row && row.code) {
      var code = document.createElement("code");
      code.textContent = val;
      dd.appendChild(code);
    } else {
      dd.textContent = val;
    }
    wrap.appendChild(dt);
    wrap.appendChild(dd);
    dl.appendChild(wrap);
  });
  card.appendChild(h3);
  card.appendChild(dl);
  return card;
}

var DEFAULT_JOIN_GUIDE = {
  section: { title: "加入指南", subtitle: "" },
  serverInfo: { title: "服务器信息", rows: [] },
  requirements: { title: "系统要求", rows: [] },
  stepsCard: {
    title: "加入步骤",
    steps: [],
    cta: { qqLabel: "官方 QQ 群", qqUrl: QQ_GROUP_URL, copyLabel: "复制服务器地址", serverIp: "" },
  },
};

async function mountJoinGuideFromApi() {
  var head = document.getElementById("joinGuideHead");
  var grid = document.getElementById("joinGuideGrid");
  if (!head || !grid) return;
  var data = null;
  try {
    var r = await fetch(absUrl("/api/join-guide"));
    if (r.ok) data = parseJoinGuideJson(await r.text());
  } catch (e) {}
  if (!data || typeof data !== "object") {
    try {
      var r2 = await fetch(absUrl("join-guide/join-guide.json"));
      if (r2.ok) data = parseJoinGuideJson(await r2.text());
    } catch (e2) {}
  }
  if (!data || typeof data !== "object") {
    data = DEFAULT_JOIN_GUIDE;
  }
  var sec = data.section || {};
  head.innerHTML = "";
  var h2 = document.createElement("h2");
  h2.textContent = sec.title != null ? String(sec.title) : "";
  var pp = document.createElement("p");
  pp.textContent = sec.subtitle != null ? String(sec.subtitle) : "";
  head.appendChild(h2);
  head.appendChild(pp);
  grid.innerHTML = "";
  var si = data.serverInfo || {};
  var rq = data.requirements || {};
  grid.appendChild(mountJoinGuideKvCard(si.title, si));
  grid.appendChild(mountJoinGuideKvCard(rq.title, rq));
  var sc = data.stepsCard || {};
  var stepsWrap = document.createElement("div");
  stepsWrap.className = "join-guide__card join-guide__card--steps";
  var h3s = document.createElement("h3");
  h3s.className = "join-guide__card-title";
  h3s.textContent = sc.title != null ? String(sc.title) : "";
  var ol = document.createElement("ol");
  ol.className = "join-guide__steps";
  var cta = sc.cta && typeof sc.cta === "object" ? sc.cta : {};
  var serverIp = cta.serverIp != null ? String(cta.serverIp) : "";
  var stepList = Array.isArray(sc.steps) ? sc.steps : [];
  stepList.forEach(function (st, idx) {
    var li = document.createElement("li");
    var num = document.createElement("span");
    num.className = "join-guide__step-num";
    num.setAttribute("aria-hidden", "true");
    num.textContent = String(idx + 1);
    var bodyWrap = document.createElement("div");
    bodyWrap.className = "join-guide__step-body";
    var strong = document.createElement("strong");
    strong.className = "join-guide__step-title";
    strong.textContent = st && st.title != null ? String(st.title) : "";
    var para = document.createElement("p");
    joinGuideBodyWithIp(para, st && st.body != null ? st.body : "", serverIp);
    bodyWrap.appendChild(strong);
    bodyWrap.appendChild(para);
    li.appendChild(num);
    li.appendChild(bodyWrap);
    ol.appendChild(li);
  });
  var ctaRow = document.createElement("div");
  ctaRow.className = "join-guide__cta-row";
  var qqA = document.createElement("a");
  qqA.className = "btn btn--primary";
  qqA.id = "join";
  qqA.href = cta.qqUrl != null ? String(cta.qqUrl) : QQ_GROUP_URL;
  qqA.target = "_blank";
  qqA.rel = "noopener noreferrer";
  qqA.textContent = cta.qqLabel != null ? String(cta.qqLabel) : "官方 QQ 群";
  var copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.className = "btn btn--ghost";
  copyBtn.id = "copyIpGuide";
  copyBtn.setAttribute("data-ip", serverIp);
  copyBtn.textContent = cta.copyLabel != null ? String(cta.copyLabel) : "复制服务器地址";
  var hint = document.createElement("p");
  hint.className = "join-guide__hint";
  hint.id = "copyHintGuide";
  hint.hidden = true;
  hint.textContent = "已复制到剪贴板";
  ctaRow.appendChild(qqA);
  ctaRow.appendChild(copyBtn);
  stepsWrap.appendChild(h3s);
  stepsWrap.appendChild(ol);
  stepsWrap.appendChild(ctaRow);
  stepsWrap.appendChild(hint);
  grid.appendChild(stepsWrap);
  document.querySelectorAll("#join-guide .reveal").forEach(function (el) {
    el.classList.add("is-visible");
  });
  applyServerVersionPill(data);
}

var DEFAULT_FEATURES = {
  section: {
    title: "关于云星",
    subtitle: "休闲社交向的 Java 生存：设计克制、节奏耐玩，把精力放在世界与彼此。",
  },
  tabs: [
    {
      title: "轻量加法，主线仍是生存",
      body: "种植、附魔、钓鱼等有原创机制，与原版进度自然衔接，不做堆叠养成。",
    },
    {
      title: "手工调校的世界节奏",
      body: "地形、生态与结构点便于远足、建家、搜资源，少无意义跑图。",
    },
    {
      title: "公告与群聊一条线",
      body: "官方 QQ 群与服内频道联动，投票、共创与重要节点透明。",
    },
    {
      title: "峰值在线也保持可玩",
      body: "硬件与插件栈为多人在线优化；延迟、TPS、备份是日常默认项。",
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
  head.textContent = "";
  var h2 = document.createElement("h2");
  h2.textContent = sec.title || "";
  var pp = document.createElement("p");
  pp.textContent = sec.subtitle || "";
  head.appendChild(h2);
  head.appendChild(pp);
  tabsRoot.textContent = "";
  tabsRoot.className = "features-cards reveal";
  var grid = document.createElement("div");
  grid.className = "features-cards__grid";
  data.tabs.forEach(function (tab, i) {
    var art = document.createElement("article");
    art.className = "features-cards__card" + (i % 2 ? " features-cards__card--alt" : "");
    var h3 = document.createElement("h3");
    h3.className = "features-cards__title";
    h3.textContent = tab.title || "";
    art.appendChild(h3);
    if (tab.body) {
      var bp = document.createElement("p");
      bp.className = "features-cards__body";
      bp.textContent = tab.body;
      art.appendChild(bp);
    }
    grid.appendChild(art);
  });
  tabsRoot.appendChild(grid);
  document.querySelectorAll("#features .reveal").forEach(function (el) {
    el.classList.add("is-visible");
  });
}

function seedStars() {
  var root = document.getElementById("siteStars");
  if (!root || prefersReducedMotion) return;
  var w = window.innerWidth || 800;
  var h = window.innerHeight || 600;
  var n = Math.min(240, Math.max(64, Math.floor((w * h) / 14000)));
  var frag = document.createDocumentFragment();
  for (var i = 0; i < n; i += 1) {
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

function initSiteSkyFalling() {
  var c = document.getElementById("siteSkyFalling");
  if (!c || prefersReducedMotion) return;
  var ctx = c.getContext("2d", { alpha: true });
  if (!ctx) return;
  var w = 0;
  var h = 0;
  var dpr = 1;
  var list = [];
  var count = 42;
  function roll(p) {
    var sp = 0.45 + Math.random() * 1.6;
    var ang = ((58 + Math.random() * 64) * Math.PI) / 180;
    p.vx = Math.cos(ang) * sp * 0.65 + (Math.random() - 0.5) * 0.5;
    p.vy = Math.sin(ang) * sp;
    p.r = 0.5 + Math.random() * 1.15;
    p.a = 0.15 + Math.random() * 0.42;
    p.tail = 3 + Math.random() * 11;
  }
  function spawn(p, top) {
    p.x = Math.random() * w;
    p.y = top ? -Math.random() * 80 : Math.random() * h;
    roll(p);
  }
  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = window.innerWidth || 300;
    h = window.innerHeight || 300;
    c.width = Math.floor(w * dpr);
    c.height = Math.floor(h * dpr);
    c.style.width = w + "px";
    c.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    list.length = 0;
    for (var i = 0; i < count; i += 1) {
      var p = {};
      spawn(p, false);
      list.push(p);
    }
  }
  function step() {
    if (!c.isConnected) return;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    for (var i = 0; i < list.length; i += 1) {
      var p = list[i];
      p.x += p.vx;
      p.y += p.vy;
      if (Math.random() < 0.04) p.vx += (Math.random() - 0.5) * 0.12;
      if (Math.random() < 0.04) p.vy += (Math.random() - 0.5) * 0.08;
      if (p.x < -12) p.x = w + 12;
      if (p.x > w + 12) p.x = -12;
      if (p.y > h + 8) spawn(p, true);
      var inv = Math.abs(p.vx) + Math.abs(p.vy) + 0.001;
      var x1 = p.x - (p.vx / inv) * p.tail;
      var y1 = p.y - (p.vy / inv) * p.tail;
      var g = ctx.createLinearGradient(p.x, p.y, x1, y1);
      g.addColorStop(0, "rgba(255,255,255," + p.a + ")");
      g.addColorStop(0.55, "rgba(199,210,254," + p.a * 0.45 + ")");
      g.addColorStop(1, "rgba(199,210,254,0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = p.r;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
    window.requestAnimationFrame(step);
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });
  window.requestAnimationFrame(step);
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
  var hintGuide = document.getElementById("copyHintGuide");
  var hintOkText = "\u5df2\u590d\u5236\u5230\u526a\u8d34\u677f";
  function attach(btn, hint) {
    if (!btn) return;
    var ip = btn.getAttribute("data-ip") || "";
    btn.addEventListener("click", function () {
      function showOk() {
        if (hint) {
          hint.textContent = hintOkText;
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
  attach(document.getElementById("copyIpGuide"), hintGuide);
}
function initFooterPiston() {
  var el = document.getElementById("footerPiston");
  if (!el) return;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var PHASE_MS = 220;
  var SCROLL_AFTER_HEAD_MS = 200;
  var busy = false;
  function goTop() {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }
  function runStrokeThen(fn) {
    if (busy) return;
    busy = true;
    el.classList.add("piston--acting", "piston--stroke");
    window.setTimeout(function () {
      el.classList.remove("piston--stroke");
      window.setTimeout(function () {
        busy = false;
        fn();
        el.classList.remove("piston--acting");
        if (document.activeElement === el) {
          el.blur();
        }
      }, SCROLL_AFTER_HEAD_MS);
    }, PHASE_MS);
  }
  function onActivate(e) {
    e.preventDefault();
    if (reduced) {
      goTop();
      return;
    }
    runStrokeThen(goTop);
  }
  el.addEventListener("click", onActivate);
  el.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      onActivate(e);
    }
  });
}
function initJoinLinks() {
  document.querySelectorAll("#join").forEach(function (el) {
    if (el && el.tagName === "A") {
      var h = el.getAttribute("href") || "";
      if (!/^https?:\/\//i.test(String(h).trim())) {
        el.setAttribute("href", QQ_GROUP_URL);
      }
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
    await mountJoinGuideFromApi();
  } catch (err) {
    console.error(err);
  }
  initRoutes(function (route) {
    if (route === "wiki") {
      var wikiNodes = document.querySelectorAll("#view-wiki .reveal");
      observeReveals(wikiNodes);
      var delay = prefersReducedMotion ? 0 : 500;
      window.setTimeout(function () {
        wikiNodes.forEach(function (n) {
          if (!n.classList.contains("is-visible")) n.classList.add("is-visible");
        });
      }, delay);
    } else if (route === "events") {
      observeReveals(document.querySelectorAll("#view-events .reveal"));
    }
  });
  initHeroPhoto();
  initAtmosphere(prefersReducedMotion);
  seedStars();
  initSiteSkyFalling();
  initNav();
  initNavMobile();
  initCopyIp();
  initJoinLinks();
  initFooterPiston();
  (function observeHomeRevealsOnly() {
    var wikiRoot = document.getElementById("view-wiki");
    var eventsRoot = document.getElementById("view-events");
    var list = [];
    document.querySelectorAll(".reveal").forEach(function (n) {
      if (wikiRoot && wikiRoot.contains(n)) return;
      if (eventsRoot && eventsRoot.contains(n)) return;
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
