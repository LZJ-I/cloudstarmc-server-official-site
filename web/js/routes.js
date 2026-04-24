const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

var wikiHtmlLoaded = false;
var wikiNavCache = null;
var wikiPagesData = null;
var wikiCurrentSlug = "";
function wikiFirstSlug(pages) {
  if (!pages || !pages.length) {
    return "";
  }
  var p0 = pages[0];
  return p0 && p0.slug != null ? String(p0.slug) : "";
}
var eventsHtmlLoaded = false;
var eventsTocGroupsCache = null;
var WIKI_READ_KEY = "cloudstar_wiki_read_v1";
var wikiRailLayoutTimer = null;
function syncWikiFixedRailToBody() {
  var vw = document.getElementById("view-wiki");
  if (!vw || !vw.classList.contains("view--active")) {
    return;
  }
  if (window.matchMedia("(max-width: 1100px)").matches) {
    vw.style.removeProperty("--wiki-rail-top");
    vw.style.removeProperty("--wiki-rail-max-h");
    return;
  }
  var body = vw.querySelector(".wiki-doc__body");
  if (!body) {
    return;
  }
  var t = Math.max(0, body.getBoundingClientRect().top);
  vw.style.setProperty("--wiki-rail-top", t + "px");
  vw.style.setProperty("--wiki-rail-max-h", "calc(100dvh - " + t + "px - 1.25rem)");
}
function scheduleSyncWikiFixedRail() {
  if (wikiRailLayoutTimer) {
    clearTimeout(wikiRailLayoutTimer);
  }
  wikiRailLayoutTimer = window.setTimeout(function () {
    wikiRailLayoutTimer = null;
    requestAnimationFrame(function () {
      syncWikiFixedRailToBody();
    });
  }, 50);
}

function wikiPageUpdatedAt(p) {
  if (!p) {
    return 0;
  }
  var v = p.updatedAt;
  var n = typeof v === "number" && isFinite(v) ? v : Number(v);
  return typeof n === "number" && isFinite(n) && n > 0 ? n : 0;
}

function mergeMissingWikiReadSlugs(data) {
  if (!data || !data.pages) {
    return;
  }
  var m = getWikiReadMap();
  var changed = false;
  data.pages.forEach(function (p) {
    if (!p) {
      return;
    }
    var k = p.slug != null && p.slug !== "" ? String(p.slug) : "index";
    var u = wikiPageUpdatedAt(p);
    if (u <= 0) {
      return;
    }
    if (m[k] === undefined) {
      m[k] = u;
      changed = true;
    }
  });
  if (changed) {
    try {
      localStorage.setItem(WIKI_READ_KEY, JSON.stringify(m));
    } catch (e) {
      // ignore
    }
  }
}

function getWikiCurrentArticle() {
  var root = document.getElementById("view-wiki");
  if (!root) return null;
  var fs =
    wikiPagesData && wikiPagesData.pages && wikiPagesData.pages.length
      ? wikiFirstSlug(wikiPagesData.pages)
      : "";
  var sl = String(wikiCurrentSlug || fs || "_");
  var vis = document.getElementById("wiki-page-" + sl);
  if (!vis) {
    vis = root.querySelector(".wiki-doc__article:not([hidden])");
  }
  return vis;
}

function buildWikiTocFromDom() {
  var root = document.getElementById("view-wiki");
  if (!root) return [];
  var vis = getWikiCurrentArticle();
  var items = [];
  if (vis) {
    vis.querySelectorAll("h2, h3").forEach(function (h) {
      var id = h.id;
      if (!id) return;
      items.push({
        id: id,
        label: String(h.textContent || "").trim() || id,
        depth: h.tagName === "H2" ? 2 : 3,
      });
    });
  }
  if (items.length) return items;
  root.querySelectorAll("section[id^='wiki-']").forEach(function (sec) {
    var id = sec.id;
    if (!id) return;
    var h2 = sec.querySelector("h2");
    var h1 = sec.querySelector("h1");
    var label = "";
    if (h2) label = String(h2.textContent || "").trim();
    else if (h1) label = String(h1.textContent || "").trim();
    if (!label) label = id;
    items.push({ id: id, label: label, depth: 2 });
  });
  return items;
}

function syncWikiToc() {
  var navEl = document.getElementById("wikiTocNav");
  var panel = document.getElementById("wikiTocPanel");
  if (!navEl) return;
  navEl.textContent = "";
  var items = [];
  if (wikiPagesData) {
    var curSlug = wikiCurrentSlug || wikiFirstSlug(pages) || "";
    var pages = wikiPagesData.pages || [];
    for (var pi = 0; pi < pages.length; pi++) {
      if (pages[pi].slug === curSlug) {
        items = pages[pi].toc || [];
        break;
      }
    }
  }
  if (!items.length) {
    items = buildWikiTocFromDom();
  }
  var art = getWikiCurrentArticle();
  var hasH1 = !!(art && art.querySelector("h1"));
  if (!items.length || !hasH1) {
    if (panel) {
      panel.hidden = true;
      panel.setAttribute("aria-hidden", "true");
    }
    return;
  }
  if (panel) {
    panel.hidden = false;
    panel.setAttribute("aria-hidden", "false");
  }
  items.forEach(function (item) {
    if (!item || !item.id) return;
    var a = document.createElement("a");
    a.href = "/wiki#" + item.id;
    a.className = "wiki-toc__link" + (item.depth === 3 ? " wiki-toc__link--indent" : "");
    a.textContent = item.label || item.id;
    navEl.appendChild(a);
  });
}

function setWikiTocVisible(on) {
  var panel = document.getElementById("wikiTocPanel");
  if (!panel) return;
  if (!on) {
    panel.hidden = true;
    panel.setAttribute("aria-hidden", "true");
    return;
  }
  syncWikiToc();
}

function setEventsTocVisible(on) {
  var panel = document.getElementById("eventsTocPanel");
  if (!panel) return;
  panel.hidden = !on;
  panel.setAttribute("aria-hidden", on ? "false" : "true");
}

var NAV_SCROLL_OFFSET = 108;

function partialUrl(name) {
  try {
    return new URL("partials/" + name + ".html", document.baseURI).href;
  } catch (e) {
    return "/partials/" + name + ".html";
  }
}

function apiUrl(pathname) {
  try {
    return new URL(pathname, document.baseURI).href;
  } catch (e) {
    return pathname;
  }
}

var HERO_FLOAT_PATH = "/img/hero-float.png";

function refreshHeroFloatImages(root) {
  if (!root) return;
  var v = Date.now();
  root.querySelectorAll(".hero__visual-img, .wiki-hero__visual-img").forEach(function (img) {
    img.src = HERO_FLOAT_PATH + "?v=" + v;
  });
}

function scrollToHash(id) {
  if (!id || id === "top") {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    return;
  }
  var t = document.getElementById(id);
  if (!t) return;
  var y = t.getBoundingClientRect().top + window.pageYOffset - NAV_SCROLL_OFFSET;
  window.scrollTo({ top: Math.max(0, y), behavior: prefersReducedMotion ? "auto" : "smooth" });
}

function getWikiReadMap() {
  try {
    return JSON.parse(localStorage.getItem(WIKI_READ_KEY) || "{}");
  } catch (e) {
    return {};
  }
}

function setWikiReadSlug(slug, updatedAt) {
  var m = getWikiReadMap();
  var k = String(slug != null && slug !== "" ? slug : "index");
  var u = typeof updatedAt === "number" && isFinite(updatedAt) && updatedAt > 0 ? updatedAt : 0;
  m[k] = u;
  try {
    localStorage.setItem(WIKI_READ_KEY, JSON.stringify(m));
  } catch (e) {
    // ignore
  }
}

function wikiIsUnread(p) {
  var up = wikiPageUpdatedAt(p);
  if (up <= 0) {
    return false;
  }
  var m = getWikiReadMap();
  var k = p.slug != null && p.slug !== "" ? String(p.slug) : "index";
  var seen = m[k];
  var s = typeof seen === "number" && isFinite(seen) ? seen : Number(seen);
  if (typeof s !== "number" || !isFinite(s) || s <= 0) {
    return false;
  }
  return up > s;
}

function applyWikiReadDots() {
  var data = wikiPagesData;
  if (!data || !data.pages) {
    return;
  }
  mergeMissingWikiReadSlugs(data);
  var bySlug = {};
  data.pages.forEach(function (p) {
    if (p && p.slug) {
      bySlug[p.slug] = p;
    }
  });
  var side = document.getElementById("wikiSidenav");
  if (!side) {
    return;
  }
  side.querySelectorAll(".wiki-sidenav__dot").forEach(function (el) {
    el.remove();
  });
  side.querySelectorAll(".wiki-doc__sidenav-link--unread").forEach(function (el) {
    el.classList.remove("wiki-doc__sidenav-link--unread");
  });
  side.querySelectorAll("details.wiki-cat.wiki-cat--unread-agg").forEach(function (d) {
    d.classList.remove("wiki-cat--unread-agg");
  });
  var links = side.querySelectorAll("a[data-wiki-slug][href^='/wiki#']");
  links.forEach(function (a) {
    var href = a.getAttribute("href") || "";
    if (href.indexOf("--") >= 0) {
      return;
    }
    var sl = a.getAttribute("data-wiki-slug");
    if (!sl) {
      return;
    }
    var p = bySlug[sl];
    if (!wikiIsUnread(p)) {
      return;
    }
    a.classList.add("wiki-doc__sidenav-link--unread");
    var dot = document.createElement("span");
    dot.className = "wiki-sidenav__dot";
    dot.setAttribute("aria-hidden", "true");
    a.appendChild(dot);
  });
  side.querySelectorAll("details.wiki-cat").forEach(function (det) {
    var inner = det.querySelector(".wiki-cat__list");
    if (!inner) {
      return;
    }
    var has = false;
    inner.querySelectorAll("a[data-wiki-slug]").forEach(function (a) {
      var p = bySlug[a.getAttribute("data-wiki-slug")];
      if (wikiIsUnread(p)) {
        has = true;
      }
    });
    if (has && !det.open) {
      det.classList.add("wiki-cat--unread-agg");
    }
  });
}

function applyWikiSubnav() {
  var navWiki = document.getElementById("navWikiAnchors");
  if (navWiki) navWiki.textContent = "";
}

function showWikiPage(slug) {
  if (!wikiPagesData || !wikiPagesData.pages) return;
  var pages = wikiPagesData.pages;
  var first = wikiFirstSlug(pages);
  var raw = slug != null ? String(slug) : "";
  if (raw === "index" || raw === "") {
    raw = first;
  }
  var slug0 = raw || first;
  var hit = null;
  for (var i = 0; i < pages.length; i++) {
    if (pages[i] && String(pages[i].slug) === String(slug0)) {
      hit = pages[i];
      break;
    }
  }
  if (!hit) {
    hit = pages[0];
    slug0 = hit ? String(hit.slug) : "";
  }
  var stage = document.getElementById("wikiDocStage");
  if (!stage) return;
  stage.querySelectorAll(".wiki-doc__article").forEach(function (art) {
    var s = art.getAttribute("data-wiki-slug");
    art.hidden = s !== slug0;
  });
  wikiCurrentSlug = slug0;
  var side = document.getElementById("wikiSidenav");
  if (side) {
    side.querySelectorAll("a[href^='/wiki#']").forEach(function (a) {
      var h = a.getAttribute("href") || "";
      var x = h.indexOf("#") >= 0 ? h.slice(h.indexOf("#") + 1) : "";
      var first = x.indexOf("--") >= 0 ? x.slice(0, x.indexOf("--")) : x;
      a.classList.toggle("is-active", first === wikiCurrentSlug);
    });
  }
  if (wikiPageUpdatedAt(hit) > 0) {
    setWikiReadSlug(slug0, wikiPageUpdatedAt(hit));
  }
  applyWikiReadDots();
  syncWikiToc();
}

function applyWikiHashAndScroll(full, opts) {
  var f = String(full || "").replace(/^#/, "");
  var pageSlug = "";
  var anchorFull = null;
  if (f.indexOf("--") >= 0) {
    pageSlug = f.slice(0, f.indexOf("--"));
    anchorFull = f;
  } else {
    pageSlug = f;
  }
  showWikiPage(pageSlug);
  if (opts && opts.fromSidenav) {
    return;
  }
  var beh = prefersReducedMotion ? "auto" : "smooth";
  var scSlug = wikiCurrentSlug;
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      if (anchorFull) {
        var el = document.getElementById(anchorFull);
        if (el) {
          var y = el.getBoundingClientRect().top + window.pageYOffset - NAV_SCROLL_OFFSET;
          window.scrollTo({ top: Math.max(0, y), behavior: beh });
          return;
        }
      }
      if (!scSlug) {
        window.scrollTo({ top: 0, behavior: "auto" });
        return;
      }
      var wrap = document.getElementById("wiki-page-" + scSlug);
      if (wrap) {
        var y2 = wrap.getBoundingClientRect().top + window.pageYOffset - NAV_SCROLL_OFFSET;
        window.scrollTo({ top: Math.max(0, y2), behavior: beh });
      } else {
        window.scrollTo({ top: 0, behavior: beh });
      }
    });
  });
}

function mountWikiDoc(vw, data) {
  var tocPark = document.getElementById("wikiTocPanel");
  if (tocPark) {
    tocPark.classList.remove("wiki-toc--inline");
    if (tocPark.parentNode) {
      document.body.appendChild(tocPark);
    }
  }
  vw.textContent = "";
  var page = document.createElement("div");
  page.className = "events-page wiki-with-hero";
  var hero = document.createElement("section");
  hero.className = "section wiki-hero events-hero";
  hero.id = "wiki-hero-top";
  var heroInner = document.createElement("div");
  heroInner.className = "wiki-hero__inner reveal wiki-md";
  var eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow wiki-hero__eyebrow";
  eyebrow.textContent = "Cloud Star Wiki";
  var h1 = document.createElement("h1");
  h1.className = "wiki-hero__title";
  h1.textContent = "百科";
  var lead = document.createElement("p");
  lead.className = "wiki-hero__lead";
  lead.textContent = "规则与设定分章收录。左侧选页；正文区右侧为当页目录。";
  heroInner.appendChild(eyebrow);
  heroInner.appendChild(h1);
  heroInner.appendChild(lead);
  hero.appendChild(heroInner);
  page.appendChild(hero);
  var root = document.createElement("div");
  root.className = "wiki-doc";
  var side = document.createElement("aside");
  side.className = "wiki-doc__sidenav";
  side.setAttribute("aria-label", "百科章节");
  var sk = document.createElement("div");
  sk.className = "wiki-doc__sidenav-kicker";
  sk.textContent = "页面";
  var sideNav = document.createElement("nav");
  sideNav.className = "wiki-doc__sidenav-list wiki-doc__sidenav-list--tree";
  sideNav.id = "wikiSidenav";
  var body = document.createElement("div");
  body.className = "wiki-doc__body";
  var stage = document.createElement("div");
  stage.className = "wiki-doc__stage";
  stage.id = "wikiDocStage";
  var tocRail = document.createElement("aside");
  tocRail.className = "wiki-doc__toc-rail";
  tocRail.setAttribute("aria-label", "本页目录");
  var pages = data.pages || [];
  var catSort = function (a, b) {
    var oa = typeof a.order === "number" && isFinite(a.order) ? a.order : 1e9;
    var ob = typeof b.order === "number" && isFinite(b.order) ? b.order : 1e9;
    if (oa !== ob) return oa - ob;
    return String(a.id || "").localeCompare(String(b.id || ""), "en");
  };
  pages.forEach(function (p) {
    if (!p || !p.slug) return;
    if (p.slug === "index") {
      return;
    }
    var art = document.createElement("article");
    art.className = "wiki-doc__article wiki-md reveal";
    art.id = "wiki-page-" + p.slug;
    art.setAttribute("data-wiki-slug", p.slug);
    art.hidden = true;
    art.innerHTML = p.html != null ? p.html : "";
    stage.appendChild(art);
  });
  var cats = data.categories && data.categories.length ? data.categories.slice().sort(catSort) : null;
  if (data.version === 2 && cats && cats.length) {
    cats.forEach(function (cat) {
      if (!cat || !cat.id) return;
      var det = document.createElement("details");
      det.className = "wiki-cat";
      if (cat.defaultOpen !== false) det.setAttribute("open", "");
      var sum = document.createElement("summary");
      sum.className = "wiki-cat__summary";
      var sumLab = document.createElement("span");
      sumLab.className = "wiki-cat__summary-text";
      sumLab.textContent = cat.label != null ? String(cat.label) : "";
      sum.appendChild(sumLab);
      var inner = document.createElement("div");
      inner.className = "wiki-cat__list";
      var sub = pages
        .filter(function (p) {
          return p && p.slug && p.slug !== "index" && p.categoryId === cat.id;
        })
        .sort(catSort);
      sub.forEach(function (p) {
        var a = document.createElement("a");
        a.className = "wiki-doc__sidenav-link wiki-doc__sidenav-link--sub";
        a.href = "/wiki#" + p.slug;
        a.textContent = p.label != null ? String(p.label) : p.slug;
        a.setAttribute("data-wiki-slug", p.slug);
        inner.appendChild(a);
      });
      det.appendChild(sum);
      det.appendChild(inner);
      sideNav.appendChild(det);
    });
  } else {
    pages.forEach(function (p) {
      if (!p || !p.slug || p.slug === "index") return;
      var a = document.createElement("a");
      a.className = "wiki-doc__sidenav-link";
      a.href = "/wiki#" + p.slug;
      a.textContent = p.label != null ? String(p.label) : p.slug;
      a.setAttribute("data-wiki-slug", p.slug);
      sideNav.appendChild(a);
    });
  }
  side.appendChild(sk);
  side.appendChild(sideNav);
  if (tocPark) {
    tocRail.appendChild(tocPark);
    tocPark.classList.add("wiki-toc--inline");
  }
  body.appendChild(stage);
  root.appendChild(side);
  root.appendChild(body);
  if (tocPark) {
    root.appendChild(tocRail);
  }
  page.appendChild(root);
  vw.appendChild(page);
  if (sideNav) {
    sideNav.addEventListener(
      "toggle",
      function (e) {
        if (e.target && e.target.classList && e.target.classList.contains("wiki-cat")) {
          applyWikiReadDots();
        }
      },
      true
    );
  }
  applyWikiReadDots();
  scheduleSyncWikiFixedRail();
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      scheduleSyncWikiFixedRail();
    });
  });
}

function parseEventDateMs(s) {
  var raw = String(s || "").trim();
  if (!raw) return 0;
  var forParse = raw.length <= 10 ? raw + "T12:00:00" : raw.replace(/^(\d{4}-\d{2}-\d{2})\s+/, "$1T");
  var t = Date.parse(forParse);
  return Number.isNaN(t) ? 0 : t;
}

function eventHasTimePart(raw) {
  return /[T\s]\d{1,2}:\d{2}/.test(String(raw || "").trim());
}

function formatEventDateDisplay(s) {
  var raw = String(s || "").trim();
  if (!raw) return "—";
  var ms = parseEventDateMs(s);
  if (!ms) {
    return raw.replace(/T/g, " ").replace(/:\d{2}$/, "");
  }
  var d = new Date(ms);
  var y = d.getFullYear();
  var mo = String(d.getMonth() + 1).padStart(2, "0");
  var da = String(d.getDate()).padStart(2, "0");
  var day = y + "-" + mo + "-" + da;
  if (!eventHasTimePart(raw)) return day;
  var hh = String(d.getHours()).padStart(2, "0");
  var mm = String(d.getMinutes()).padStart(2, "0");
  return day + " " + hh + ":" + mm;
}

function ymLabelZh(ym) {
  if (!ym || ym === "_") return "日期待定";
  var parts = String(ym).split("-");
  if (parts.length < 2) return ym;
  var y = parts[0];
  var mo = parseInt(parts[1], 10);
  if (!mo) return ym;
  return y + "年" + mo + "月";
}

function syncEventsToc() {
  var navEl = document.getElementById("eventsTocNav");
  if (!navEl) return;
  navEl.textContent = "";
  var groups = eventsTocGroupsCache;
  if (!groups || !groups.length) {
    var empty = document.createElement("span");
    empty.className = "wiki-toc__empty";
    empty.textContent = "暂无";
    navEl.appendChild(empty);
    return;
  }
  var lastYear = null;
  groups.forEach(function (g) {
    var ym = g.ym;
    var anchorId = ym === "_" ? "ev-undated" : "ev-" + ym;
    var year = ym === "_" ? "" : ym.slice(0, 4);
    if (year !== lastYear) {
      lastYear = year;
      if (year) {
        var yd = document.createElement("div");
        yd.className = "events-toc__year";
        yd.textContent = year + "年";
        navEl.appendChild(yd);
      }
    }
    var a = document.createElement("a");
    a.href = "/events#" + anchorId;
    a.className = "wiki-toc__link wiki-toc__link--indent";
    a.textContent = ym === "_" ? ymLabelZh(ym) : parseInt(ym.slice(5), 10) + "月";
    navEl.appendChild(a);
  });
}

function renderEventsInto(container, data) {
  container.textContent = "";
  eventsTocGroupsCache = [];
  var sec = data && data.section ? data.section : {};
  var items = data && Array.isArray(data.items) ? data.items.slice() : [];
  items.sort(function (a, b) {
    var da = parseEventDateMs(a && a.date) - parseEventDateMs(b && b.date);
    if (da !== 0) return -da;
    return String((b && b.title) || "").localeCompare(String((a && a.title) || ""), "zh");
  });

  var page = document.createElement("div");
  page.className = "events-page";

  var hero = document.createElement("section");
  hero.className = "section wiki-hero events-hero";
  hero.id = "events-top";
  var heroInner = document.createElement("div");
  heroInner.className = "wiki-hero__inner reveal wiki-md";
  var eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow wiki-hero__eyebrow";
  eyebrow.textContent = "Cloud Star Events";
  var h1 = document.createElement("h1");
  h1.className = "wiki-hero__title";
  h1.textContent = sec.title != null ? String(sec.title) : "事件";
  var lead = document.createElement("p");
  lead.className = "wiki-hero__lead";
  lead.textContent = sec.subtitle != null ? String(sec.subtitle) : "";
  heroInner.appendChild(eyebrow);
  heroInner.appendChild(h1);
  if (lead.textContent) heroInner.appendChild(lead);
  hero.appendChild(heroInner);
  page.appendChild(hero);

  var wrap = document.createElement("div");
  wrap.className = "events-timeline-wrap";

  if (!items.length) {
    var empty = document.createElement("p");
    empty.className = "events-page__empty";
    empty.textContent = "暂无事件条目。";
    wrap.appendChild(empty);
    page.appendChild(wrap);
    container.appendChild(page);
    syncEventsToc();
    return;
  }

  var orderedGroups = [];
  items.forEach(function (it) {
    if (!it || typeof it !== "object") return;
    var d = String(it.date || "").trim();
    var ym = d.length >= 7 ? d.slice(0, 7) : "_";
    var last = orderedGroups[orderedGroups.length - 1];
    if (!last || last.ym !== ym) {
      orderedGroups.push({ ym: ym, items: [] });
    }
    orderedGroups[orderedGroups.length - 1].items.push(it);
  });
  eventsTocGroupsCache = orderedGroups;
  syncEventsToc();

  function appendItemRow(listEl, it) {
    var tier = String(it.tier || "minor").toLowerCase() === "major" ? "major" : "minor";
    var li = document.createElement("li");
    li.className = "events-timeline__item events-timeline__item--" + tier + " reveal";
    var dot = document.createElement("span");
    dot.className = "events-timeline__dot";
    var card = document.createElement("div");
    card.className = "events-timeline__card";
    card.setAttribute("tabindex", "-1");
    var timeEl = document.createElement("time");
    timeEl.className = "events-timeline__date";
    var dateRaw = String(it.date || "").trim();
    var dateDisp = formatEventDateDisplay(dateRaw);
    timeEl.setAttribute("datetime", dateDisp === "—" ? "" : dateDisp);
    timeEl.textContent = dateDisp;
    var titleEl = document.createElement(tier === "major" ? "h2" : "h3");
    titleEl.className = "events-timeline__title";
    titleEl.textContent = it.title != null ? String(it.title) : "";
    card.appendChild(timeEl);
    card.appendChild(titleEl);
    if (it.body != null && String(it.body).trim()) {
      var p = document.createElement("p");
      p.className = "events-timeline__body";
      p.textContent = String(it.body);
      card.appendChild(p);
    }
    li.appendChild(dot);
    li.appendChild(card);
    listEl.appendChild(li);
  }

  var lastTimelineYear = null;
  orderedGroups.forEach(function (group) {
    var ym = group.ym;
    var anchorId = ym === "_" ? "ev-undated" : "ev-" + ym;
    var block = document.createElement("section");
    block.className = "events-month-block";
    block.id = anchorId;
    var mh = document.createElement("h2");
    mh.className = "events-month-heading";
    if (ym === "_") {
      lastTimelineYear = null;
      mh.classList.add("events-month-heading--undated");
      mh.textContent = ymLabelZh(ym);
    } else {
      var yStr = ym.slice(0, 4);
      var mo = parseInt(ym.slice(5, 7), 10);
      if (yStr !== lastTimelineYear) {
        lastTimelineYear = yStr;
        mh.classList.add("events-month-heading--year");
        mh.textContent = yStr + "年";
      } else {
        mh.classList.add("events-month-heading--month");
        mh.textContent = (Number.isFinite(mo) ? mo : ym.slice(5)) + "月";
      }
    }
    block.appendChild(mh);
    var list = document.createElement("ol");
    list.className = "events-timeline";
    group.items.forEach(function (it) {
      appendItemRow(list, it);
    });
    block.appendChild(list);
    wrap.appendChild(block);
  });

  page.appendChild(wrap);
  container.appendChild(page);
}

export async function mountHomePartial() {
  const homeUrl = partialUrl("home");
  const r = await fetch(homeUrl, { cache: "no-store" });
  if (!r.ok) throw new Error("home");
  const h = await r.text();
  var vh = document.getElementById("view-home");
  if (vh) {
    vh.innerHTML = h;
    refreshHeroFloatImages(vh);
  }
}

export async function ensureWikiMounted() {
  if (wikiHtmlLoaded) return;
  var vw = document.getElementById("view-wiki");
  if (!vw) return;
  try {
    var r = await fetch(apiUrl("/api/wiki"), { cache: "no-store" });
    if (r.ok) {
      var data = await r.json();
      if (data && (data.version === 1 || data.version === 2) && Array.isArray(data.pages)) {
        wikiPagesData = data;
        wikiNavCache = Array.isArray(data.nav) ? data.nav : null;
        mountWikiDoc(vw, data);
        refreshHeroFloatImages(vw);
        applyWikiSubnav();
        wikiHtmlLoaded = true;
        return;
      }
      if (data && typeof data.html === "string") {
        wikiNavCache = Array.isArray(data.nav) ? data.nav : null;
        wikiPagesData = null;
        vw.innerHTML = data.html;
        refreshHeroFloatImages(vw);
        applyWikiSubnav();
        wikiHtmlLoaded = true;
        return;
      }
    }
  } catch (e) {
    console.error(e);
  }
  const r2 = await fetch(partialUrl("wiki"));
  if (!r2.ok) throw new Error("wiki");
  wikiNavCache = null;
  wikiPagesData = null;
  vw.innerHTML = await r2.text();
  refreshHeroFloatImages(vw);
  wikiHtmlLoaded = true;
}

export async function ensureEventsMounted() {
  if (eventsHtmlLoaded) return;
  var ve = document.getElementById("view-events");
  if (!ve) return;
  var data = { section: { title: "事件", subtitle: "" }, items: [] };
  try {
    var r = await fetch(apiUrl("/api/events"), { cache: "no-store" });
    if (r.ok) {
      var j = await r.json();
      if (j && typeof j === "object" && !Array.isArray(j)) data = j;
    }
  } catch (e) {
    console.error(e);
  }
  renderEventsInto(ve, data);
  eventsHtmlLoaded = true;
}

export function initRoutes(onViewMounted) {
  var homeEl = document.getElementById("view-home");
  var wikiEl = document.getElementById("view-wiki");
  var eventsEl = document.getElementById("view-events");
  var appMain = document.getElementById("app-main");
  var navWiki = document.getElementById("navWikiAnchors");
  if (!homeEl || !wikiEl || !eventsEl || !appMain) return;

  var routeAppliedOnce = false;
  var lastAppliedRoute = null;

  function setWikiSubnavForRoute() {
    if (navWiki) {
      navWiki.classList.remove("is-active");
      navWiki.setAttribute("aria-hidden", "true");
    }
  }

  function applyRoute(route) {
    var sameRoute = lastAppliedRoute === route;
    var isHome = route === "home";
    var isWiki = route === "wiki";
    var isEvents = route === "events";
    if (isHome) {
      wikiHtmlLoaded = false;
      eventsHtmlLoaded = false;
    }
    homeEl.classList.toggle("view--active", isHome);
    wikiEl.classList.toggle("view--active", isWiki);
    eventsEl.classList.toggle("view--active", isEvents);
    appMain.classList.toggle("view-state--home", isHome);
    appMain.classList.toggle("view-state--wiki", isWiki);
    appMain.classList.toggle("view-state--events", isEvents);
    document.querySelectorAll("[data-route]").forEach(function (el) {
      var on = el.getAttribute("data-route") === route;
      el.classList.toggle("is-active", on);
      el.setAttribute("aria-current", on ? "page" : "false");
    });
    homeEl.inert = !isHome;
    wikiEl.inert = !isWiki;
    eventsEl.inert = !isEvents;
    if (isHome) {
      document.documentElement.style.scrollBehavior = prefersReducedMotion ? "auto" : "smooth";
    } else {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "auto" });
    }

    setWikiSubnavForRoute(route);
    setWikiTocVisible(isWiki);
    setEventsTocVisible(isEvents);
    if (isEvents) syncEventsToc();

    if (!sameRoute) {
      if (isHome) {
        refreshHeroFloatImages(homeEl);
      } else if (isWiki) {
        refreshHeroFloatImages(wikiEl);
      }
    }

    if (routeAppliedOnce && !prefersReducedMotion && !sameRoute) {
      var incomingView = isHome ? homeEl : isWiki ? wikiEl : eventsEl;
      homeEl.classList.remove("view--enter");
      wikiEl.classList.remove("view--enter");
      eventsEl.classList.remove("view--enter");
      void incomingView.offsetWidth;
      incomingView.classList.add("view--enter");
      function clearEnter() {
        incomingView.classList.remove("view--enter");
      }
      incomingView.addEventListener(
        "animationend",
        function onEnterEnd(e) {
          if (e.target !== incomingView) return;
          if (
            e.animationName !== "app-view-enter-home" &&
            e.animationName !== "app-view-enter-wiki" &&
            e.animationName !== "app-view-enter-events"
          ) {
            return;
          }
          incomingView.removeEventListener("animationend", onEnterEnd);
          clearEnter();
        },
        false
      );
      window.setTimeout(clearEnter, 520);
    }
    routeAppliedOnce = true;
    lastAppliedRoute = route;
  }

  function show(route, done) {
    if (route === "wiki") {
      ensureWikiMounted()
        .then(function () {
          applyRoute("wiki");
          if (typeof onViewMounted === "function") onViewMounted("wiki");
          var h = (location.hash || "").replace(/^#/, "");
          if (wikiPagesData) {
            applyWikiHashAndScroll(h);
            scheduleSyncWikiFixedRail();
            requestAnimationFrame(function () {
              scheduleSyncWikiFixedRail();
            });
          } else {
            if (h) {
              var t = document.getElementById(h);
              if (t) {
                var y = t.getBoundingClientRect().top + window.pageYOffset - NAV_SCROLL_OFFSET;
                window.scrollTo({ top: Math.max(0, y), behavior: prefersReducedMotion ? "auto" : "smooth" });
              }
            }
          }
          if (typeof done === "function") done();
        })
        .catch(function (e) {
          console.error(e);
          applyRoute("wiki");
          if (typeof onViewMounted === "function") onViewMounted("wiki");
          if (typeof done === "function") done();
        });
      return;
    }
    if (route === "events") {
      ensureEventsMounted()
        .then(function () {
          applyRoute("events");
          if (typeof onViewMounted === "function") onViewMounted("events");
          if (typeof done === "function") done();
        })
        .catch(function (e) {
          console.error(e);
          applyRoute("events");
          if (typeof onViewMounted === "function") onViewMounted("events");
          if (typeof done === "function") done();
        });
      return;
    }
    applyRoute("home");
    if (typeof done === "function") done();
  }

  document.querySelectorAll("[data-route]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      var r = el.getAttribute("data-route") || "home";
      var path = r === "wiki" ? "/wiki" : r === "events" ? "/events" : "/home";
      show(r, function () {
        history.pushState({ route: r }, "", path);
        if (r === "home") {
          requestAnimationFrame(function () {
            var id =
              location.hash && location.hash.length > 1 ? location.hash.slice(1) : "";
            scrollToHash(id);
          });
        }
      });
    });
  });

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
      return;
    }
    var a = e.target && e.target.closest && e.target.closest("a[href^='/home#']");
    if (!a) return;
    if (!homeEl || !homeEl.classList.contains("view--active")) return;
    var p = (location.pathname || "/").replace(/\/+$/, "") || "/";
    if (p !== "/home" && p !== "/") return;
    var id = (a.getAttribute("href") || "").replace(/^.*#/, "");
    if (!id) return;
    e.preventDefault();
    history.replaceState({ route: "home" }, "", "/home#" + id);
    requestAnimationFrame(function () {
      scrollToHash(id);
    });
  });

  function pathnameToRoute() {
    var p = (location.pathname || "/").replace(/\/+$/, "") || "/";
    if (p === "/wiki") return "wiki";
    if (p === "/events") return "events";
    return "home";
  }

  var wikiTocPanel = document.getElementById("wikiTocPanel");
  if (wikiTocPanel) {
    wikiTocPanel.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href^='/wiki#']");
      if (!a) return;
      if (!wikiEl.classList.contains("view--active")) return;
      e.preventDefault();
      var href = a.getAttribute("href") || "";
      var id = href.indexOf("#") >= 0 ? href.slice(href.indexOf("#") + 1) : "";
      if (!id) return;
      history.replaceState({ route: "wiki" }, "", "/wiki#" + id);
      if (wikiPagesData) {
        applyWikiHashAndScroll(id);
      } else {
        scrollToHash(id);
      }
    });
  }

  var eventsTocPanel = document.getElementById("eventsTocPanel");
  if (eventsTocPanel) {
    eventsTocPanel.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href^='/events#']");
      if (!a) return;
      if (!eventsEl.classList.contains("view--active")) return;
      e.preventDefault();
      var href = a.getAttribute("href") || "";
      var id = href.indexOf("#") >= 0 ? href.slice(href.indexOf("#") + 1) : "";
      if (!id) return;
      history.replaceState({ route: "events" }, "", "/events#" + id);
      scrollToHash(id);
    });
  }

  window.addEventListener("resize", function () {
    if (wikiEl && wikiEl.classList.contains("view--active")) {
      scheduleSyncWikiFixedRail();
    }
  });

  if (navWiki) {
    navWiki.addEventListener("click", function (e) {
      var a = e.target.closest("a[href]");
      if (!a) return;
      var href = a.getAttribute("href") || "";
      var id = null;
      if (href.indexOf("/wiki#") === 0) {
        id = href.slice("/wiki#".length);
      } else if (href.charAt(0) === "#") {
        id = href.slice(1);
      }
      if (!id) return;

      if (homeEl.classList.contains("view--active")) {
        e.preventDefault();
        show("wiki", function () {
          history.pushState({ route: "wiki" }, "", "/wiki#" + id);
          requestAnimationFrame(function () {
            if (wikiPagesData) {
              applyWikiHashAndScroll(id);
            } else {
              scrollToHash(id);
            }
          });
        });
        return;
      }
      e.preventDefault();
      history.replaceState({ route: "wiki" }, "", "/wiki#" + id);
      if (wikiPagesData) {
        applyWikiHashAndScroll(id);
      } else {
        scrollToHash(id);
      }
    });
  }

  document.addEventListener(
    "click",
    function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
        return;
      }
      var a = e.target.closest && e.target.closest("#view-wiki a[href^='/wiki#']");
      if (!a) return;
      if (!wikiEl || !wikiEl.classList.contains("view--active")) return;
      e.preventDefault();
      var href = a.getAttribute("href") || "";
      var full = href.indexOf("#") >= 0 ? href.slice(href.indexOf("#") + 1) : "";
      history.replaceState({ route: "wiki" }, "", "/wiki#" + full);
      if (wikiPagesData) {
        var fromSide = a.closest && a.closest("#wikiSidenav");
        applyWikiHashAndScroll(full, fromSide ? { fromSidenav: true } : undefined);
        scheduleSyncWikiFixedRail();
      } else {
        scrollToHash(full);
      }
    },
    true
  );

  window.addEventListener("popstate", function () {
    var r = pathnameToRoute();
    show(r, function () {
      if (r === "wiki" && location.hash && location.hash.length > 1) {
        requestAnimationFrame(function () {
          if (wikiPagesData) {
            applyWikiHashAndScroll(location.hash.slice(1));
            scheduleSyncWikiFixedRail();
          } else {
            scrollToHash(location.hash.slice(1));
          }
        });
      }
      if (r === "events" && location.hash && location.hash.length > 1) {
        requestAnimationFrame(function () {
          scrollToHash(location.hash.slice(1));
        });
      }
    });
  });

  function pathForRoute(r) {
    if (r === "wiki") return "/wiki";
    if (r === "events") return "/events";
    return "/home";
  }

  var initialRoute = pathnameToRoute();
  show(initialRoute, function () {
    var pn = (location.pathname || "/").replace(/\/+$/, "") || "/";
    if (pn === "/" || pn === "") {
      history.replaceState({ route: "home" }, "", "/home" + (location.hash || ""));
    } else if (pn !== "/home" && pn !== "/wiki" && pn !== "/events") {
      history.replaceState({ route: initialRoute }, "", pathForRoute(initialRoute) + (location.hash || ""));
    }
    if (initialRoute === "events" && location.hash && location.hash.length > 1) {
      requestAnimationFrame(function () {
        scrollToHash(location.hash.slice(1));
      });
    }
  });
}
