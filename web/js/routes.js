const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

var wikiHtmlLoaded = false;

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
  const r = await fetch(homeUrl);
  if (!r.ok) throw new Error("home");
  const h = await r.text();
  var vh = document.getElementById("view-home");
  if (vh) vh.innerHTML = h;
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
        vw.innerHTML = data.html;
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
  vw.innerHTML = await r2.text();
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

  function pathnameToRoute() {
    var p = (location.pathname || "/").replace(/\/+$/, "") || "/";
    if (p === "/wiki") return "wiki";
    return "home";
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

