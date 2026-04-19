const fs = require("fs");
const p = "d:/server-official-site/web/js/routes.js";
let s = fs.readFileSync(p, "utf8");
s = s.replace('a.href = "#" + item.id;', 'a.href = "/wiki#" + item.id;');

const oldNav = `  document.querySelectorAll("[data-route]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      show(el.getAttribute("data-route") || "home");
    });
  });`;

const newNav = `  document.querySelectorAll("[data-route]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      var r = el.getAttribute("data-route") || "home";
      show(r, function () {
        history.pushState({ route: r }, "", r === "wiki" ? "/wiki" : "/home");
      });
    });
  });`;

if (!s.includes(oldNav)) throw new Error("nav block mismatch");
s = s.replace(oldNav, newNav);

const oldSub = `  if (navWiki) {
    navWiki.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = (a.getAttribute("href") || "").slice(1);
      if (homeEl.classList.contains("view--active")) {
        e.preventDefault();
        show("wiki", function () {
          requestAnimationFrame(function () {
            scrollToHash(id);
          });
        });
        return;
      }
      e.preventDefault();
      scrollToHash(id);
    });
  }

  applyRoute("home");
}`;

const newSub = `  function pathnameToRoute() {
    var p = (location.pathname || "/").replace(/\\/+$/, "") || "/";
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
    var pn = (location.pathname || "/").replace(/\\/+$/, "") || "/";
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
}`;

if (!s.includes(oldSub)) throw new Error("sub block mismatch");
s = s.replace(oldSub, newSub);

fs.writeFileSync(p, s);
console.log("routes ok");
