const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const OR_TEAM_TICK_MS = 8000;
const OR_TEAM_PROGRESS_STEP_MS = 80;
const OR_TEAM_XF_DONE_MS = 560;
const OR_TEAM_STACK_H_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
var STAFF_TPL_HEAD = "/staff/_template/head.png";
var STAFF_TPL_PORTRAIT = "/staff/_template/portrait.png";
function staffAssetUrl(memberId, file) {
  var f = String(file == null ? "" : file).replace(/\\/g, "/").trim();
  if (!f) return STAFF_TPL_HEAD;
  if (f.indexOf("/") >= 0) {
    var parts = f.split("/").filter(function (p) {
      return p && p !== "." && p !== "..";
    });
    f = parts.length ? parts[parts.length - 1] : "";
  }
  if (!f) return STAFF_TPL_HEAD;
  if (!memberId) return STAFF_TPL_HEAD;
  var u = "/staff/" + encodeURIComponent(String(memberId)) + "/" + encodeURIComponent(f);
  var bust =
    typeof window !== "undefined" && window.__STAFF_PREVIEW_BUST != null && window.__STAFF_PREVIEW_BUST !== ""
      ? String(window.__STAFF_PREVIEW_BUST)
      : "";
  if (bust) u += (u.indexOf("?") >= 0 ? "&" : "?") + "v=" + encodeURIComponent(bust);
  return u;
}
function staffHeadUrl(id, headFile) {
  return staffAssetUrl(id, headFile || "head.png");
}
function staffPortraitUrl(id, portraitFile) {
  return staffAssetUrl(id, portraitFile || "portrait.png");
}
function measureTeamSlidePaneNaturalHeight(el, widthPx) {
  if (!el || widthPx < 8) return 0;
  var st = el.style;
  function snap() {
    return {
      boxSizing: st.boxSizing,
      position: st.position,
      inset: st.inset,
      top: st.top,
      right: st.right,
      bottom: st.bottom,
      left: st.left,
      width: st.width,
      maxWidth: st.maxWidth,
      height: st.height,
      visibility: st.visibility,
      pointerEvents: st.pointerEvents
    };
  }
  function restore(p) {
    st.boxSizing = p.boxSizing;
    st.position = p.position;
    if (p.inset) st.inset = p.inset;
    else st.removeProperty("inset");
    if (p.top) st.top = p.top;
    else st.removeProperty("top");
    if (p.right) st.right = p.right;
    else st.removeProperty("right");
    if (p.bottom) st.bottom = p.bottom;
    else st.removeProperty("bottom");
    if (p.left) st.left = p.left;
    else st.removeProperty("left");
    if (p.width) st.width = p.width;
    else st.removeProperty("width");
    if (p.maxWidth) st.maxWidth = p.maxWidth;
    else st.removeProperty("max-width");
    if (p.height) st.height = p.height;
    else st.removeProperty("height");
    if (p.visibility) st.visibility = p.visibility;
    else st.removeProperty("visibility");
    if (p.pointerEvents) st.pointerEvents = p.pointerEvents;
    else st.removeProperty("pointer-events");
  }
  var prev = snap();
  st.boxSizing = "border-box";
  st.removeProperty("inset");
  st.position = "fixed";
  st.top = "0";
  st.left = "-9999px";
  st.right = "auto";
  st.bottom = "auto";
  st.width = widthPx + "px";
  st.maxWidth = widthPx + "px";
  st.height = "auto";
  st.visibility = "hidden";
  st.pointerEvents = "none";
  var h = Math.ceil(el.getBoundingClientRect().height);
  restore(prev);
  return Math.max(h, 0);
}

export function initOriginTeam(orStaff) {
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
  var slideStack = document.getElementById("orTeamSlideStack");
  var track = document.getElementById("orTeamTrack");
  if (!track) {
    track = document.createElement("div");
    track.id = "orTeamTrack";
    track.className = "or-team__strip-track";
    strip.appendChild(track);
  }
  var teamGrid = parchment.querySelector(".or-team__grid");
  var controls = parchment.querySelector(".or-team__controls");
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
  var stripSmoothScroll = !prefersReducedMotion;
  var stripWrap = strip ? strip.parentElement : null;
  var stripRoRaf = null;
  function updateControlsMode() {
    if (!controls || !strip) return;
    var st = getComputedStyle(controls);
    var g = parseFloat(st.gap) || parseFloat(st.columnGap) || 8;
    var wA = (prevBtn ? prevBtn.offsetWidth : 0) + (nextBtn ? nextBtn.offsetWidth : 0);
    var wNeed = wA + strip.scrollWidth + 2 * g;
    var avail = controls.clientWidth;
    var next = wNeed <= avail + 3 ? "compact" : "wide";
    var cur = controls.getAttribute("data-or-team-controls");
    if (cur === next) return;
    controls.setAttribute("data-or-team-controls", next);
    if (next === "compact") strip.scrollLeft = 0;
  }
  function faceScrollExtents(el) {
    var x = 0;
    for (var n = el; n && n !== strip; n = n.offsetParent) {
      x += n.offsetLeft;
    }
    var w = el.offsetWidth;
    return { left: x, right: x + w };
  }
  function stripInnerViewport() {
    var s = getComputedStyle(strip);
    var pl = parseFloat(s.paddingLeft) || 0;
    var pr = parseFloat(s.paddingRight) || 0;
    return {
      innerW: Math.max(1, strip.clientWidth - pl - pr),
      maxScroll: Math.max(0, strip.scrollWidth - strip.clientWidth)
    };
  }
  function updateStripFade() {
    if (!strip) return;
    if (!faces.length || strip.scrollWidth <= strip.clientWidth + 1) {
      strip.setAttribute("data-strip-fade", "none");
      return;
    }
    var max = strip.scrollWidth - strip.clientWidth;
    var sl = strip.scrollLeft;
    var eps = 2;
    var atStart = sl <= eps;
    var atEnd = sl >= max - eps;
    var mode = "lr";
    if (atStart && !atEnd) mode = "r";
    else if (!atStart && atEnd) mode = "l";
    else if (atStart && atEnd) mode = "none";
    strip.setAttribute("data-strip-fade", mode);
  }
  function syncStrip(instant) {
    if (!strip || !faces.length) {
      updateStripFade();
      return;
    }
    var el = faces[idx];
    if (!el) {
      updateStripFade();
      return;
    }
    if (strip.scrollWidth <= strip.clientWidth + 1) {
      strip.scrollLeft = 0;
      updateStripFade();
      return;
    }
    var vp = stripInnerViewport();
    var sl = strip.scrollLeft;
    var vL = sl;
    var vR = sl + vp.innerW;
    var b = faceScrollExtents(el);
    var m = 6;
    if (b.left >= vL + m && b.right <= vR - m) {
      updateStripFade();
      return;
    }
    var next = sl;
    if (b.right > vR - m) {
      next += b.right - (vR - m);
    }
    if (b.left < next + m) {
      next = b.left - m;
    }
    next = Math.round(Math.max(0, Math.min(vp.maxScroll, next)));
    if (instant || !stripSmoothScroll) {
      strip.scrollLeft = next;
    } else {
      try {
        strip.scrollTo({ left: next, top: 0, behavior: "smooth" });
      } catch (e) {
        strip.scrollLeft = next;
      }
    }
    updateStripFade();
  }
  function clearXfTimer() {
    if (xfTimer) {
      window.clearTimeout(xfTimer);
      xfTimer = null;
    }
  }
  function clearTeamStackHeight(el) {
    if (!el) return;
    el.style.height = "";
    el.style.overflow = "";
    el.style.transition = "";
    if (el._orTeamHEnd) {
      el.removeEventListener("transitionend", el._orTeamHEnd);
      delete el._orTeamHEnd;
    }
    if (el._orTeamHFallback) {
      window.clearTimeout(el._orTeamHFallback);
      delete el._orTeamHFallback;
    }
  }
  function wantsTeamStackHeightTween(el) {
    return (
      el &&
      typeof window.matchMedia !== "undefined" &&
      window.matchMedia("(max-width: 900px)").matches
    );
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
  function buildBioText(m) {
    var base = m.bio == null ? "" : String(m.bio).replace(/\r\n/g, "\n").replace(/\\n/g, "\n");
    var parts = [];
    if (m._headNote) parts.push("【小头像】" + m._headNote);
    if (m._portraitNote) parts.push("【大图】" + m._portraitNote);
    if (parts.length) return parts.join("\n") + (base ? "\n\n" + base : "");
    return base;
  }
  function refreshMemberBio(memberIdx) {
    var m = orStaff[memberIdx];
    if (!m) return;
    var t = buildBioText(m);
    for (var s = 0; s < 2; s++) {
      if (String(slides[s].dataset.orMemberIdx || "") !== String(memberIdx)) continue;
      var bio = slides[s].querySelector(".or-team__bio");
      if (bio) bio.textContent = t;
    }
  }
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
    el.dataset.orMemberIdx = String(mi);
    var c = accentColor(m);
    el.style.setProperty("--or-accent", c);
    el.innerHTML =
      '<div class="or-team__headline" style="color:' +
      c +
      ';text-align:left"><div class="or-team__name"></div><div class="or-team__title-pill"><span class="or-team__title-text"></span></div></div><p class="or-team__bio"></p>';
    el.querySelector(".or-team__name").textContent = m.name;
    el.querySelector(".or-team__title-text").textContent = m.title || "";
    el.querySelector(".or-team__bio").textContent = buildBioText(m);
  }
  function paintPortraitInto(el, m, memberIdx) {
    var id = m && m.id != null ? String(m.id) : "";
    if (m._portraitNote) {
      delete m._portraitNote;
      refreshMemberBio(memberIdx);
    }
    portraitTok += 1;
    var tok = portraitTok;
    var pf = (m && m.portraitFile) || "portrait.png";
    function afterNote(msg) {
      if (tok !== portraitTok) return;
      m._portraitNote = msg;
      refreshMemberBio(memberIdx);
    }
    function clearNote() {
      if (tok !== portraitTok) return;
      if (m._portraitNote) {
        delete m._portraitNote;
        refreshMemberBio(memberIdx);
      }
    }
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
        if (tok !== portraitTok) return;
        clearNote();
        var u = staffPortraitUrl(id, pf);
        requestAnimationFrame(function () {
          applySrc(u);
        });
      };
      probe.onerror = function () {
        if (tok !== portraitTok) return;
        probe.onerror = null;
        afterNote("本目录 " + (pf || "portrait.png") + " 未成功加载，正在尝试小头像个文件。");
        var probe2 = new Image();
        probe2.onload = function () {
          if (tok !== portraitTok) return;
          afterNote("本目录立绘未成功加载，已暂用小头像同图。");
          applySrc(staffHeadUrl(id, m.headFile));
        };
        probe2.onerror = function () {
          if (tok !== portraitTok) return;
          afterNote("本目录小头像、立绘均不可用，正尝试 _template/portrait.png。");
          var probe3 = new Image();
          probe3.onload = function () {
            if (tok !== portraitTok) return;
            afterNote("已回退为 web/staff/_template/portrait.png。");
            applySrc(STAFF_TPL_PORTRAIT);
          };
          probe3.onerror = function () {
            if (tok !== portraitTok) return;
            afterNote("已回退为 web/staff/_template/head.png。");
            applySrc(STAFF_TPL_HEAD);
          };
          probe3.src = STAFF_TPL_PORTRAIT;
        };
        probe2.src = staffHeadUrl(id, m.headFile);
      };
      probe.src = staffPortraitUrl(id, pf);
    } else {
      m._portraitNote = "成员 id 缺失，大图使用 _template/head.png。";
      refreshMemberBio(memberIdx);
      applySrc(STAFF_TPL_HEAD);
    }
  }
  function crossfadeTo(memberIdx, xfDir) {
    clearXfTimer();
    finalizeIfAnimating();
    clearTeamStackHeight(slideStack);
    if (teamGrid && xfDir) teamGrid.setAttribute("data-or-team-dir", xfDir);
    xfSeq += 1;
    var seq = xfSeq;
    var outgoing = shown;
    var incoming = 1 - shown;
    fillSlideInto(slides[incoming], memberIdx);
    paintPortraitInto(photos[incoming], orStaff[memberIdx], memberIdx);
    setSubtitle();
    if (prefersReducedMotion) {
      setSlidePane(slides[outgoing], "wait");
      setSlidePane(slides[incoming], "current");
      setPortraitPane(photos[outgoing], "wait");
      setPortraitPane(photos[incoming], "current");
      shown = incoming;
      return;
    }
    var stackTween = null;
    if (slideStack && wantsTeamStackHeightTween(slideStack)) {
      var wSt = Math.round(slideStack.clientWidth || slideStack.offsetWidth);
      var h0 = Math.round(slideStack.getBoundingClientRect().height);
      var h1 = measureTeamSlidePaneNaturalHeight(slides[incoming], wSt);
      if (h1 < 1) h1 = h0;
      if (Math.abs(h1 - h0) >= 2) {
        stackTween = { h0: h0, h1: h1 };
      }
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
        if (stackTween && slideStack) {
          slideStack.style.overflow = "hidden";
          slideStack.style.transition = "none";
          slideStack.style.height = stackTween.h0 + "px";
          void slideStack.offsetHeight;
          slideStack.style.transition =
            "height " + OR_TEAM_XF_DONE_MS / 1000 + "s " + OR_TEAM_STACK_H_EASE;
          requestAnimationFrame(function () {
            if (seq !== xfSeq) {
              clearTeamStackHeight(slideStack);
              return;
            }
            slideStack.style.height = stackTween.h1 + "px";
          });
        }
        xfTimer = window.setTimeout(function () {
          xfTimer = null;
          if (seq !== xfSeq) return;
          setSlidePane(slides[outgoing], "wait");
          setSlidePane(slides[incoming], "current");
          setPortraitPane(photos[outgoing], "wait");
          setPortraitPane(photos[incoming], "current");
          shown = incoming;
          clearTeamStackHeight(slideStack);
        }, OR_TEAM_XF_DONE_MS);
      });
    });
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
    requestAnimationFrame(function () {
      syncStrip(false);
    });
  }
  orStaff.forEach(function (m, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "or-team__face";
    b.setAttribute("aria-label", m.name);
    var im = document.createElement("img");
    im.src = staffHeadUrl(m.id, m.headFile);
    im.onerror = function () {
      m._headNote = (m.headFile || "head.png") + " 未加载，已换用 _template/head.png。";
      refreshMemberBio(i);
      im.onerror = null;
      im.src = STAFF_TPL_HEAD;
      requestAnimationFrame(function () {
        updateControlsMode();
        syncStrip(true);
      });
    };
    im.alt = "";
    im.addEventListener("load", function () {
      var idEnc = encodeURIComponent(String(m.id));
      if (im.src.indexOf("/staff/" + idEnc + "/") >= 0) {
        if (m._headNote) {
          delete m._headNote;
          refreshMemberBio(i);
        }
      } else {
        refreshMemberBio(i);
      }
      requestAnimationFrame(function () {
        updateControlsMode();
        syncStrip(true);
      });
    });
    b.appendChild(im);
    b.addEventListener("click", function () {
      go(i, {});
    });
    track.appendChild(b);
    faces.push(b);
  });
  updateControlsMode();
  if (prevBtn) prevBtn.addEventListener("click", function () { go(idx - 1, {}); });
  if (nextBtn) nextBtn.addEventListener("click", function () { go(idx + 1, {}); });
  strip.addEventListener("scroll", updateStripFade, { passive: true });
  if (typeof ResizeObserver !== "undefined") {
    var ro = new ResizeObserver(function () {
      if (stripRoRaf) cancelAnimationFrame(stripRoRaf);
      stripRoRaf = requestAnimationFrame(function () {
        stripRoRaf = null;
        updateControlsMode();
        syncStrip(true);
      });
    });
    if (controls) ro.observe(controls);
    if (stripWrap) ro.observe(stripWrap);
  }
  fillSlideInto(slides[0], 0);
  paintPortraitInto(photos[0], orStaff[0], 0);
  setSlidePane(slides[0], "current");
  setSlidePane(slides[1], "wait");
  setPortraitPane(photos[0], "current");
  setPortraitPane(photos[1], "wait");
  shown = 0;
  setSubtitle();
  updateFaces();
  window.addEventListener("resize", function () {
    updateControlsMode();
    syncStrip(true);
  });
  requestAnimationFrame(function () {
    updateControlsMode();
    syncStrip(true);
  });
  window.setTimeout(function () {
    updateControlsMode();
    syncStrip(true);
  }, 220);
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
      var sub = document.getElementById("orTeamSubtitle");
      if (sub) {
        sub.textContent = Array.isArray(rows)
          ? "\u6682\u65e0\u6210\u5458\u6570\u636e\uff08\u8bf7\u68c0\u67e5 web/staff \u4e0e\u670d\u52a1\u7aef /api/team\uff09"
          : "\u63a5\u53e3\u8fd4\u56de\u975e\u6570\u7ec4\uff0c\u8bf7\u67e5\u770b\u670d\u52a1\u7aef\u65e5\u5fd7";
      }
    })
    .catch(function () {
      var sub = document.getElementById("orTeamSubtitle");
      if (sub) sub.textContent = "\u56e2\u961f\u6570\u636e\u52a0\u8f7d\u5931\u8d25\uff0c\u8bf7\u5237\u65b0\u9875\u9762\u6216\u7a0d\u540e\u518d\u8bd5";
    });
}
