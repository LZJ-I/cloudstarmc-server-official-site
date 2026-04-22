function parseFeaturesJson(text) {
  try {
    return JSON.parse(String(text || "").replace(/^\uFEFF/, ""));
  } catch {
    return null;
  }
}

function mountFeatures(data) {
  var head = document.getElementById("featuresHead");
  var tabsRoot = document.getElementById("featuresTabs");
  if (!head || !tabsRoot) return;
  head.innerHTML = "";
  tabsRoot.innerHTML = "";
  if (!data || !Array.isArray(data.tabs) || !data.tabs.length) {
    head.innerHTML = "<p style=\"opacity:.75;margin:0\">JSON 无效或 tabs 为空</p>";
    return;
  }
  var sec = data.section || {};
  var h2 = document.createElement("h2");
  h2.textContent = sec.title || "";
  var pp = document.createElement("p");
  pp.textContent = sec.subtitle || "";
  head.appendChild(h2);
  head.appendChild(pp);
  tabsRoot.className = "features-cards reveal is-visible";
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

window.addEventListener("message", (ev) => {
  if (ev.source !== window.parent) return;
  const d = ev.data;
  if (!d || d.type !== "featuresPreview") return;
  const data = parseFeaturesJson(d.json || "");
  mountFeatures(data);
});
