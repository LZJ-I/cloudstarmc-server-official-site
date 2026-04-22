function parseJson(text) {
  try {
    return JSON.parse(String(text || "").replace(/^\uFEFF/, ""));
  } catch {
    return null;
  }
}

function joinGuideBodyWithIp(p, body, serverIp) {
  const t = body != null ? String(body) : "";
  const ip = serverIp != null ? String(serverIp) : "";
  p.textContent = "";
  if (!ip || t.indexOf(ip) === -1) {
    p.textContent = t;
    return;
  }
  const parts = t.split(ip);
  for (let i = 0; i < parts.length; i += 1) {
    if (parts[i]) p.appendChild(document.createTextNode(parts[i]));
    if (i < parts.length - 1) {
      const code = document.createElement("code");
      code.textContent = ip;
      p.appendChild(code);
    }
  }
}

function mountJoinGuideKvCard(title, block, cardPrefix) {
  const card = document.createElement("div");
  card.className = "join-guide__card";
  const h3 = document.createElement("h3");
  h3.className = "join-guide__card-title";
  h3.setAttribute("data-jg-path", cardPrefix + ".title");
  h3.textContent = title || "";
  const dl = document.createElement("dl");
  dl.className = "join-guide__kv";
  const rows = block && Array.isArray(block.rows) ? block.rows : [];
  rows.forEach((row, idx) => {
    const wrap = document.createElement("div");
    wrap.setAttribute("data-jg-path", cardPrefix + ".rows." + idx);
    const dt = document.createElement("dt");
    dt.textContent = row && row.dt != null ? String(row.dt) : "";
    const dd = document.createElement("dd");
    const val = row && row.dd != null ? String(row.dd) : "";
    if (row && row.code) {
      const code = document.createElement("code");
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

function setSel(root, path) {
  root.querySelectorAll("[data-jg-path].is-jg-sel").forEach((el) => {
    el.classList.remove("is-jg-sel");
  });
  if (!path) return;
  const hit = Array.from(root.querySelectorAll("[data-jg-path]")).find(
    (el) => el.getAttribute("data-jg-path") === path
  );
  if (hit) hit.classList.add("is-jg-sel");
}

function mount(data, selectedPath) {
  const root = document.getElementById("joinRoot");
  if (!root) return;
  root.innerHTML = "";
  if (!data || typeof data !== "object") {
    const p = document.createElement("p");
    p.style.opacity = "0.75";
    p.textContent = "无有效数据";
    root.appendChild(p);
    return;
  }
  const sec = data.section || {};
  const head = document.createElement("div");
  head.className = "join-guide__head section__head";
  head.setAttribute("data-jg-path", "section");
  const h2 = document.createElement("h2");
  h2.textContent = sec.title != null ? String(sec.title) : "";
  const pp = document.createElement("p");
  pp.textContent = sec.subtitle != null ? String(sec.subtitle) : "";
  head.appendChild(h2);
  head.appendChild(pp);
  const grid = document.createElement("div");
  grid.className = "join-guide__grid";
  const si = data.serverInfo || {};
  const rq = data.requirements || {};
  grid.appendChild(mountJoinGuideKvCard(si.title, si, "serverInfo"));
  grid.appendChild(mountJoinGuideKvCard(rq.title, rq, "requirements"));
  const sc = data.stepsCard || {};
  const stepsWrap = document.createElement("div");
  stepsWrap.className = "join-guide__card join-guide__card--steps";
  const h3s = document.createElement("h3");
  h3s.className = "join-guide__card-title";
  h3s.setAttribute("data-jg-path", "stepsCard.title");
  h3s.textContent = sc.title != null ? String(sc.title) : "";
  const ol = document.createElement("ol");
  ol.className = "join-guide__steps";
  const cta = sc.cta && typeof sc.cta === "object" ? sc.cta : {};
  const serverIp = cta.serverIp != null ? String(cta.serverIp) : "";
  const stepList = Array.isArray(sc.steps) ? sc.steps : [];
  stepList.forEach((st, idx) => {
    const li = document.createElement("li");
    li.setAttribute("data-jg-path", "stepsCard.steps." + idx);
    const num = document.createElement("span");
    num.className = "join-guide__step-num";
    num.setAttribute("aria-hidden", "true");
    num.textContent = String(idx + 1);
    const bodyWrap = document.createElement("div");
    bodyWrap.className = "join-guide__step-body";
    const strong = document.createElement("strong");
    strong.className = "join-guide__step-title";
    strong.textContent = st && st.title != null ? String(st.title) : "";
    const para = document.createElement("p");
    joinGuideBodyWithIp(para, st && st.body != null ? st.body : "", serverIp);
    bodyWrap.appendChild(strong);
    bodyWrap.appendChild(para);
    li.appendChild(num);
    li.appendChild(bodyWrap);
    ol.appendChild(li);
  });
  const ctaRow = document.createElement("div");
  ctaRow.className = "join-guide__cta-row";
  ctaRow.setAttribute("data-jg-path", "stepsCard.cta");
  const qqBtn = document.createElement("button");
  qqBtn.type = "button";
  qqBtn.className = "btn btn--primary";
  qqBtn.id = "join";
  qqBtn.textContent = cta.qqLabel != null ? String(cta.qqLabel) : "官方 QQ 群";
  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.className = "btn btn--ghost";
  copyBtn.id = "copyIpGuide";
  copyBtn.setAttribute("data-ip", serverIp);
  copyBtn.textContent = cta.copyLabel != null ? String(cta.copyLabel) : "复制服务器地址";
  ctaRow.appendChild(qqBtn);
  ctaRow.appendChild(copyBtn);
  const ctaSub = document.createElement("p");
  ctaSub.className = "admin-jg-cta-hint";
  ctaSub.textContent = "管理预览不跳转/不复制";
  ctaRow.appendChild(ctaSub);
  stepsWrap.appendChild(h3s);
  stepsWrap.appendChild(ol);
  stepsWrap.appendChild(ctaRow);
  grid.appendChild(stepsWrap);
  const inner = document.createElement("div");
  inner.className = "join-guide__inner reveal is-visible";
  inner.appendChild(head);
  inner.appendChild(grid);
  const secEl = document.createElement("section");
  secEl.className = "section join-guide";
  secEl.id = "join-guide";
  secEl.appendChild(inner);
  root.appendChild(secEl);
  setSel(root, selectedPath);
}

if (!window._jgClickBound) {
  window._jgClickBound = true;
  document.addEventListener("click", (e) => {
    const t = e.target && e.target.closest && e.target.closest("#joinRoot [data-jg-path]");
    if (!t) return;
    e.preventDefault();
    const path = t.getAttribute("data-jg-path");
    if (path && window.parent) {
      try {
        window.parent.postMessage({ type: "joinGuideSelect", path }, "*");
      } catch (_) {}
    }
  });
}

window.addEventListener("message", (ev) => {
  if (ev.source !== window.parent) return;
  const d = ev.data;
  if (!d || d.type !== "joinGuidePreview") return;
  const data = parseJson(d.json || "");
  mount(data, d.selectedPath || "");
});
