const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const OR_TEAM_TICK_MS = 8000;
const OR_TEAM_PROGRESS_STEP_MS = 80;
const OR_TEAM_XF_DONE_MS = 560;
function teamStaticJsonUrl() {
  try {
    return new URL("staff/team.json", document.baseURI).href;
  } catch (e) {
    return "/staff/team.json";
  }
}
var IMG_DEFAULT_HEAD = "/img/default-head.png";
function staffAssetUrl(memberId, file) {
  var f = String(file == null ? "" : file).replace(/\\/g, "/").trim();
  if (!f) return IMG_DEFAULT_HEAD;
  if (f.indexOf("/") >= 0) {
    var parts = f.split("/").filter(function (p) {
      return p && p !== "." && p !== "..";
    });
    if (!parts.length) return IMG_DEFAULT_HEAD;
    return "/staff/" + parts.map(encodeURIComponent).join("/");
  }
  if (!memberId) return IMG_DEFAULT_HEAD;
  return "/staff/" + encodeURIComponent(String(memberId)) + "/" + encodeURIComponent(f);
}
function staffHeadUrl(id, headFile) {
  return staffAssetUrl(id, headFile || "head.png");
}
function staffPortraitUrl(id, portraitFile) {
  return staffAssetUrl(id, portraitFile || "portrait.png");
}

function initOriginTeam(orStaff) {
  if (!orStaff || !orStaff.length) return;
  var parchment = document.getElementById("orTeamParchment");
  var subtitle = document.getElementById("orTeamSubtitle");
  var slide0 = document.getElementById("orTeamSlide0");
  var slide1 = document.getElementById("orTeamSlide1");
  var strip = document.getElementById("orTeamStrip");
  var photo0 = document.getElementById("orTeamPortrait0");
  var photo1 = document.getElementById("orTeamPortrait1");
  var progress = document.getElementById("orTeamProgress");
  var prevBtn = document.getElementById("orTeamPrev");
  var nextBtn = document.getElementById("orTeamNext");
  if (!parchment || !subtitle || !slide0 || !slide1 || !strip || !photo0 || !photo1 || !progress) return;
  var teamGrid = parchment.querySelector(".or-team__grid");
  var slides = [slide0, slide1];
  var photos = [photo0, photo1];
  var idx = 0;
  var shown = 0;
  var faces = [];
  var progressPct = 0;
  var hoverPause = false;
  var docHiddenPause = false;
  var xfSeq = 0;
  var xfTimer = null;
  var portraitTok = 0;
  function clearXfTimer() {
    if (xfTimer) {
      window.clearTimeout(xfTimer);
      xfTimer = null;
    }
  }
  function setSlidePane(el, s) {
    el.className = "or-team__slide-pane or-team__slide-pane--" + s;
  }
  function setPortraitPane(el, s) {
    el.className = "or-team__portrait-pane or-team__portrait-pane--" + s;
  }
  function finalizeIfAnimating() {
    var outI = -1;
    var inI = -1;
    var k;
    for (k = 0; k < 2; k += 1) {
      if (slides[k].classList.contains("or-team__slide-pane--out")) outI = k;
      if (slides[k].classList.contains("or-team__slide-pane--in")) inI = k;
    }
    if (outI >= 0 && inI >= 0) {
      setSlidePane(slides[outI], "wait");
      setSlidePane(slides[inI], "current");
      var outP = -1;
      var inP = -1;
      for (k = 0; k < 2; k += 1) {
        if (photos[k].classList.contains("or-team__portrait-pane--out")) outP = k;
        if (photos[k].classList.contains("or-team__portrait-pane--in")) inP = k;
      }
      if (outP >= 0 && inP >= 0) {
        setPortraitPane(photos[outP], "wait");
        setPortraitPane(photos[inP], "current");
      }
      shown = inI;
      return;
    }
    if (outI >= 0 && inI < 0) {
      setSlidePane(slides[outI], "wait");
      setSlidePane(slides[1 - outI], "current");
      for (k = 0; k < 2; k += 1) {
        if (photos[k].classList.contains("or-team__portrait-pane--out")) {
          setPortraitPane(photos[k], "wait");
          setPortraitPane(photos[1 - k], "current");
          break;
        }
      }
      shown = 1 - outI;
      return;
    }
    if (inI >= 0 && outI < 0) {
      setSlidePane(slides[inI], "current");
      setSlidePane(slides[1 - inI], "wait");
      for (k = 0; k < 2; k += 1) {
        if (photos[k].classList.contains("or-team__portrait-pane--in")) {
          setPortraitPane(photos[k], "current");
          setPortraitPane(photos[1 - k], "wait");
          break;
        }
      }
      shown = inI;
    }
  }
  var DEFAULT_ACCENT = "#EA323C";
  function accentColor(m) {
    var c = m && m.color != null ? String(m.color).trim() : "";
    if (/^#[0-9A-Fa-f]{3}$|^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$/.test(c)) return c;
    return DEFAULT_ACCENT;
  }
  function setSubtitle() {
    subtitle.textContent = "\u8ba4\u8bc6\u8ba9\u4e91\u661f\u6301\u7eed\u8fdb\u6b65\u7684\u4f19\u4f34\u4eec\uff01";
  }
  function fillSlideInto(el, mi) {
    var m = orStaff[mi];
    if (!m) return;
    var c = accentColor(m);
    el.style.setProperty("--or-accent", c);
    el.innerHTML =
      '<div class="or-team__headline" style="color:' +
      c +
      ';text-align:left"><div class="or-team__name"></div><div class="or-team__title-pill"><span class="or-team__title-text"></span></div></div><p class="or-team__bio"></p>';
    el.querySelector(".or-team__name").textContent = m.name;
    el.querySelector(".or-team__title-text").textContent = m.title || "";
    var bioRaw = m.bio == null ? "" : String(m.bio);
    el.querySelector(".or-team__bio").textContent = bioRaw.replace(/\r\n/g, "\n").replace(/\\n/g, "\n");
  }
  function paintPortraitInto(el, m) {
    var id = m && m.id != null ? String(m.id) : "";
    portraitTok += 1;
    var tok = portraitTok;
    var pf = (m && m.portraitFile) || "portrait.png";
    function applySrc(u) {
      if (tok !== portraitTok) return;
      var im = el.querySelector("img.or-team__portrait-img");
      if (!im) {
        im = document.createElement("img");
        im.className = "or-team__portrait-img";
        im.alt = "";
        im.decoding = "async";
        el.textContent = "";
        el.appendChild(im);
      }
      im.src = u;
    }
    if (id) {
      var probe = new Image();
      probe.onload = function () {
        var u = staffPortraitUrl(id, pf);
        requestAnimationFrame(function () {
          applySrc(u);
        });
      };
      probe.onerror = function () {
        probe.onerror = null;
        var probe2 = new Image();
        probe2.onload = function () {
          applySrc(staffHeadUrl(id, m.headFile));
        };
        probe2.onerror = function () {
          applySrc(IMG_DEFAULT_HEAD);
        };
        probe2.src = staffHeadUrl(id, m.headFile);
      };
      probe.src = staffPortraitUrl(id, pf);
    } else {
      applySrc(IMG_DEFAULT_HEAD);
    }
  }
  function crossfadeTo(memberIdx, xfDir) {
    clearXfTimer();
    finalizeIfAnimating();
    if (teamGrid && xfDir) teamGrid.setAttribute("data-or-team-dir", xfDir);
    xfSeq += 1;
    var seq = xfSeq;
    var outgoing = shown;
    var incoming = 1 - shown;
    fillSlideInto(slides[incoming], memberIdx);
    paintPortraitInto(photos[incoming], orStaff[memberIdx]);
    setSubtitle();
    if (prefersReducedMotion) {
      setSlidePane(slides[outgoing], "wait");
      setSlidePane(slides[incoming], "current");
      setPortraitPane(photos[outgoing], "wait");
      setPortraitPane(photos[incoming], "current");
      shown = incoming;
      return;
    }
    void slides[outgoing].offsetWidth;
    void slides[incoming].offsetWidth;
    void photos[outgoing].offsetWidth;
    void photos[incoming].offsetWidth;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (seq !== xfSeq) return;
        setSlidePane(slides[outgoing], "out");
        setSlidePane(slides[incoming], "in");
        setPortraitPane(photos[outgoing], "out");
        setPortraitPane(photos[incoming], "in");
        xfTimer = window.setTimeout(function () {
          xfTimer = null;
          if (seq !== xfSeq) return;
          setSlidePane(slides[outgoing], "wait");
          setSlidePane(slides[incoming], "current");
          setPortraitPane(photos[outgoing], "wait");
          setPortraitPane(photos[incoming], "current");
          shown = incoming;
        }, OR_TEAM_XF_DONE_MS);
      });
    });
  }
  function syncStrip() {
    if (!strip) return;
    strip.style.transform = "";
    var face = faces[idx];
    if (!face) return;
    var sc = strip.clientWidth || 0;
    var sw = strip.scrollWidth || 0;
    if (!sc || !sw) return;
    if (sw <= sc + 0.5) {
      strip.scrollLeft = 0;
      return;
    }
    var fc = face.offsetLeft + face.offsetWidth / 2;
    var target = Math.round(fc - sc / 2);
    var max = Math.max(0, sw - sc);
    if (target < 0) target = 0;
    if (target > max) target = max;
    strip.scrollLeft = target;
  }
  function updateFaces() {
    faces.forEach(function (b, i) {
      b.classList.toggle("is-active", i === idx);
    });
  }
  function go(nextIdx, opts) {
    opts = opts || {};
    var n = orStaff.length;
    var i = ((nextIdx % n) + n) % n;
    if (i === idx && !opts.force) return;
    var prevIdx = idx;
    var delta = (i - prevIdx + n) % n;
    var xfDir = delta === 0 || delta <= n - delta ? "next" : "prev";
    idx = i;
    updateFaces();
    crossfadeTo(idx, xfDir);
    progressPct = 0;
    progress.style.width = "0%";
    syncStrip();
    requestAnimationFrame(syncStrip);
    window.setTimeout(syncStrip, 340);
  }
  orStaff.forEach(function (m, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "or-team__face";
    b.setAttribute("aria-label", m.name);
    var im = document.createElement("img");
    im.src = staffHeadUrl(m.id, m.headFile);
    im.onerror = function () {
      im.onerror = null;
      im.src = IMG_DEFAULT_HEAD;
      requestAnimationFrame(syncStrip);
    };
    im.alt = "";
    im.addEventListener("load", function () {
      requestAnimationFrame(syncStrip);
    });
    b.appendChild(im);
    b.addEventListener("click", function () {
      go(i, {});
    });
    strip.appendChild(b);
    faces.push(b);
  });
  if (prevBtn) prevBtn.addEventListener("click", function () { go(idx - 1, {}); });
  if (nextBtn) nextBtn.addEventListener("click", function () { go(idx + 1, {}); });
  fillSlideInto(slides[0], 0);
  paintPortraitInto(photos[0], orStaff[0]);
  setSlidePane(slides[0], "current");
  setSlidePane(slides[1], "wait");
  setPortraitPane(photos[0], "current");
  setPortraitPane(photos[1], "wait");
  shown = 0;
  setSubtitle();
  updateFaces();
  window.addEventListener("resize", syncStrip);
  requestAnimationFrame(syncStrip);
  requestAnimationFrame(function () {
    requestAnimationFrame(syncStrip);
  });
  window.setTimeout(syncStrip, 120);
  if (!prefersReducedMotion) {
    window.setInterval(function () {
      if (hoverPause || docHiddenPause) return;
      progressPct += 100 / (OR_TEAM_TICK_MS / OR_TEAM_PROGRESS_STEP_MS);
      if (progressPct >= 100) {
        go(idx + 1, { force: true });
      } else {
        progress.style.width = progressPct + "%";
      }
    }, OR_TEAM_PROGRESS_STEP_MS);
  }
  parchment.addEventListener("mouseenter", function () {
    hoverPause = true;
  });
  parchment.addEventListener("mouseleave", function () {
    hoverPause = false;
  });
  document.addEventListener("visibilitychange", function () {
    docHiddenPause = document.hidden;
  });
}
export function bootTeam() {
  fetch("/api/team")
    .then(function (r) {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    })
    .then(function (rows) {
      if (Array.isArray(rows) && rows.length) {
        initOriginTeam(rows);
        return;
      }
      return fetch(teamStaticJsonUrl(), { cache: "no-store" })
        .then(function (r2) {
          if (!r2.ok) return rows;
          return r2.json();
        })
        .then(function (rows2) {
          if (Array.isArray(rows2) && rows2.length) {
            initOriginTeam(rows2);
            return;
          }
          var sub = document.getElementById("orTeamSubtitle");
          if (sub) {
            sub.textContent = Array.isArray(rows)
              ? "\u6682\u65e0\u6210\u5458\u6570\u636e\uff08\u8bf7\u68c0\u67e5 web/staff \u4e0e\u670d\u52a1\u7aef /api/team\uff09"
              : "\u63a5\u53e3\u8fd4\u56de\u975e\u6570\u7ec4\uff0c\u8bf7\u67e5\u770b\u670d\u52a1\u7aef\u65e5\u5fd7";
          }
        });
    })
    .catch(function () {
      fetch(teamStaticJsonUrl(), { cache: "no-store" })
        .then(function (r2) {
          if (!r2.ok) throw new Error("no static");
          return r2.json();
        })
        .then(function (rows2) {
          if (Array.isArray(rows2) && rows2.length) {
            initOriginTeam(rows2);
            return;
          }
          var sub = document.getElementById("orTeamSubtitle");
          if (sub) sub.textContent = "\u56e2\u961f\u6570\u636e\u52a0\u8f7d\u5931\u8d25\uff0c\u8bf7\u5237\u65b0\u9875\u9762\u6216\u7a0d\u540e\u518d\u8bd5";
        })
        .catch(function () {
          var sub = document.getElementById("orTeamSubtitle");
          if (sub) sub.textContent = "\u56e2\u961f\u6570\u636e\u52a0\u8f7d\u5931\u8d25\uff0c\u8bf7\u5237\u65b0\u9875\u9762\u6216\u7a0d\u540e\u518d\u8bd5";
        });
    });

}
