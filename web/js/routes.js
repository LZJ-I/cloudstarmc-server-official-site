const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

var wikiHtmlLoaded = false;
var wikiNavCache = null;

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

var NAV_SCROLL_OFFSET = 88;

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

export function initRoutes(onWikiMounted) {
  var homeEl = document.getElementById("view-home");
  var wikiEl = document.getElementById("view-wiki");
  var appMain = document.getElementById("app-main");
  var navWiki = document.getElementById("navWikiAnchors");
  if (!homeEl || !wikiEl || !appMain) return;

  var routeAppliedOnce = false;

  function setSubPanelsInstant(isHome) {
    if (navWiki) {
      navWiki.classList.toggle("is-active", !isHome);
      navWiki.setAttribute("aria-hidden", isHome ? "true" : "false");
    }
  }

  function applyRoute(route) {
    var isHome = route === "home";
    if (isHome) wikiHtmlLoaded = false;
    homeEl.classList.toggle("view--active", isHome);
    wikiEl.classList.toggle("view--active", !isHome);
    appMain.classList.toggle("view-state--home", isHome);
    appMain.classList.toggle("view-state--wiki", !isHome);
    document.querySelectorAll("[data-route]").forEach(function (el) {
      var on = el.getAttribute("data-route") === route;
      el.classList.toggle("is-active", on);
      el.setAttribute("aria-current", on ? "page" : "false");
    });
    homeEl.inert = !isHome;
    wikiEl.inert = isHome;
    if (isHome) {
      document.documentElement.style.scrollBehavior = prefersReducedMotion ? "auto" : "smooth";
    } else {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "auto" });
    }

    setSubPanelsInstant(isHome);
    setWikiTocVisible(!isHome);
    if (!isHome) syncWikiToc();

    if (isHome) {
      refreshHeroFloatImages(homeEl);
    } else {
      refreshHeroFloatImages(wikiEl);
    }

    if (routeAppliedOnce && !prefersReducedMotion) {
      var incomingView = isHome ? homeEl : wikiEl;
      homeEl.classList.remove("view--enter");
      wikiEl.classList.remove("view--enter");
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
            e.animationName !== "app-view-enter-wiki"
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
  }

  function show(route, done) {
    if (route === "wiki") {
      ensureWikiMounted()
        .then(function () {
          applyRoute("wiki");
          if (typeof onWikiMounted === "function") onWikiMounted();
          if (typeof done === "function") done();
        })
        .catch(function (e) {
          console.error(e);
          applyRoute("wiki");
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
      show(r, function () {
        history.pushState({ route: r }, "", r === "wiki" ? "/wiki" : "/home");
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
    });
  });

  var initialRoute = pathnameToRoute();
  show(initialRoute, function () {
    var pn = (location.pathname || "/").replace(/\/+$/, "") || "/";
    if (pn === "/" || pn === "") {
      history.replaceState({ route: "home" }, "", "/home" + (location.hash || ""));
    } else if (pn !== "/home" && pn !== "/wiki") {
      history.replaceState({ route: initialRoute }, "", (initialRoute === "wiki" ? "/wiki" : "/home") + (location.hash || ""));
    }
    if (initialRoute === "wiki" && location.hash && location.hash.length > 1) {
      requestAnimationFrame(function () {
        scrollToHash(location.hash.slice(1));
      });
    }
  });
}

