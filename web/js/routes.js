const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

var wikiHtmlLoaded = false;
var wikiNavCache = null;
var eventsHtmlLoaded = false;
var eventsTocGroupsCache = null;

function buildWikiTocFromDom() {
  var root = document.getElementById("view-wiki");
  if (!root) return [];
  var items = [];
  root.querySelectorAll("section[id^='wiki-']").forEach(function (sec) {
    var id = sec.id;
    if (!id) return;
    var h2 = sec.querySelector("h2");
    var h1 = sec.querySelector("h1");
    var label = "";
    if (h2) label = String(h2.textContent || "").trim();
    else if (h1) label = String(h1.textContent || "").trim();
    if (!label) label = id;
    items.push({ id: id, label: label });
  });
  return items;
}

function syncWikiToc() {
  var navEl = document.getElementById("wikiTocNav");
  var panel = document.getElementById("wikiTocPanel");
  if (!navEl || !panel) return;
  navEl.textContent = "";
  var items = [];
  if (wikiNavCache && wikiNavCache.length) {
    wikiNavCache.forEach(function (item) {
      if (!item || !item.id) return;
      items.push({ id: item.id, label: item.label || item.id });
    });
  } else {
    items = buildWikiTocFromDom();
  }
  items.forEach(function (item) {
    if (!item.id) return;
    var a = document.createElement("a");
    a.href = "/wiki#" + item.id;
    a.className = "wiki-toc__link";
    a.textContent = item.label;
    navEl.appendChild(a);
  });
}

function setWikiTocVisible(on) {
  var panel = document.getElementById("wikiTocPanel");
  if (!panel) return;
  panel.hidden = !on;
  panel.setAttribute("aria-hidden", on ? "false" : "true");
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

function applyWikiSubnav(nav) {
  var navWiki = document.getElementById("navWikiAnchors");
  if (!navWiki || !Array.isArray(nav) || !nav.length) return;
  navWiki.textContent = "";
  nav.forEach(function (item) {
    if (!item || !item.id) return;
    var a = document.createElement("a");
    a.href = "/wiki#" + item.id;
    a.className = "nav__sub-link";
    a.textContent = item.label || item.id;
    navWiki.appendChild(a);
  });
}

function parseEventDateMs(s) {
  var raw = String(s || "").trim();
  if (!raw) return 0;
  var t = Date.parse(raw + (raw.length <= 10 ? "T12:00:00" : ""));
  return Number.isNaN(t) ? 0 : t;
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
    timeEl.setAttribute("datetime", String(it.date || "").trim());
    timeEl.textContent = String(it.date || "").trim() || "—";
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
      if (data && typeof data.html === "string") {
        wikiNavCache = Array.isArray(data.nav) ? data.nav : null;
        vw.innerHTML = data.html;
        refreshHeroFloatImages(vw);
        applyWikiSubnav(data.nav);
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

  function setWikiSubnavForRoute(route) {
    if (navWiki) {
      var onWiki = route === "wiki";
      navWiki.classList.toggle("is-active", onWiki);
      navWiki.setAttribute("aria-hidden", onWiki ? "false" : "true");
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
    if (isWiki) syncWikiToc();
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
      scrollToHash(id);
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
            scrollToHash(id);
          });
        });
        return;
      }
      e.preventDefault();
      history.replaceState({ route: "wiki" }, "", "/wiki#" + id);
      scrollToHash(id);
    });
  }

  window.addEventListener("popstate", function () {
    var r = pathnameToRoute();
    show(r, function () {
      if (r === "wiki" && location.hash && location.hash.length > 1) {
        requestAnimationFrame(function () {
          scrollToHash(location.hash.slice(1));
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
    if (initialRoute === "wiki" && location.hash && location.hash.length > 1) {
      requestAnimationFrame(function () {
        scrollToHash(location.hash.slice(1));
      });
    }
    if (initialRoute === "events" && location.hash && location.hash.length > 1) {
      requestAnimationFrame(function () {
        scrollToHash(location.hash.slice(1));
      });
    }
  });
}
