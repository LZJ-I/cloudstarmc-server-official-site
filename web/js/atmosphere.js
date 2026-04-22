export function initAtmosphere(prefersReducedMotion) {
  var root = document.getElementById("atmosphericBg");
  var particles = document.getElementById("atmosphericParticles");
  if (!root || !particles) return;

  if (!prefersReducedMotion) {
    var frag = document.createDocumentFragment();
    var n = 86;
    for (var i = 0; i < n; i += 1) {
      var s = document.createElement("span");
      s.className = "atmospheric-bg__dot";
      s.style.setProperty("--x", Math.random() * 100 + "%");
      s.style.setProperty("--y", 92 + Math.random() * 28 + "%");
      s.style.setProperty("--sz", 0.7 + Math.random() * 1.35 + "px");
      s.style.setProperty("--o", String(0.035 + Math.random() * 0.065));
      s.style.setProperty("--dur", 26 + Math.random() * 38 + "s");
      s.style.setProperty("--delay", -Math.random() * 48 + "s");
      s.style.setProperty("--drift", Math.random() * 18 - 9 + "px");
      frag.appendChild(s);
    }
    particles.appendChild(frag);
  }

  var hasCloudLayers = !!document.querySelector(".atmospheric-bg__cloud--1");
  var coarsePointer =
    typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
  var follow = document.getElementById("cursorCloud");
  var enableFollow = !prefersReducedMotion && !coarsePointer && !!follow;
  var runParallax = !prefersReducedMotion && hasCloudLayers;

  if (!runParallax && !enableFollow) return;

  function setCloudLayer(suffix, transform) {
    document.querySelectorAll(".atmospheric-bg__cloud--" + suffix).forEach(function (el) {
      el.style.transform = transform;
    });
  }

  var tx = window.innerWidth * 0.5;
  var ty = window.innerHeight * 0.5;
  var sx = tx;
  var sy = ty;
  var fx = tx;
  var fy = ty;

  function onMove(e) {
    tx = e.clientX;
    ty = e.clientY;
    if (enableFollow && follow) {
      follow.classList.add("is-visible");
    }
  }

  function onDocLeave() {
    if (follow) follow.classList.remove("is-visible");
  }

  function tick() {
    if (runParallax) {
      sx += (tx - sx) * 0.085;
      sy += (ty - sy) * 0.085;
      var ox = (sx - window.innerWidth * 0.5) * 0.038;
      var oy = (sy - window.innerHeight * 0.5) * 0.032;
      setCloudLayer("1", "translate3d(" + ox * 0.85 + "px," + oy * 0.7 + "px,0)");
      setCloudLayer("2", "translate3d(" + ox * -1.05 + "px," + oy * 0.95 + "px,0)");
      setCloudLayer("3", "translate3d(" + ox * 0.55 + "px," + oy * -0.65 + "px,0)");
      setCloudLayer("4", "translate3d(" + ox * 0.4 + "px," + oy * -0.5 + "px,0)");
    }

    if (enableFollow && follow) {
      fx += (tx - fx) * 0.12;
      fy += (ty - fy) * 0.12;
      follow.style.transform =
        "translate3d(" + Math.round(fx) + "px," + Math.round(fy) + "px,0) translate(-50%, -50%)";
    }

    window.requestAnimationFrame(tick);
  }

  window.addEventListener("mousemove", onMove, { passive: true });
  document.documentElement.addEventListener("mouseleave", onDocLeave);
  window.requestAnimationFrame(tick);
}
