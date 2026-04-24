const MARKED_URL = "/js/vendor/marked.esm.js";
try {
  if (/[?&]password=/i.test(location.search)) history.replaceState(null, "", location.pathname + location.hash);
} catch {}

let markedCache = null;
async function getMarked() {
  if (markedCache) return markedCache;
  const mod = await import(MARKED_URL);
  mod.marked.setOptions({ gfm: true, breaks: true });
  markedCache = mod.marked;
  return markedCache;
}

const loginPanel = document.getElementById("loginPanel");
const appPanel = document.getElementById("appPanel");
const loginForm = document.getElementById("loginForm");
const loginErr = document.getElementById("loginErr");
const preflightErr = document.getElementById("preflightErr");
const initialBlock = document.getElementById("initialBlock");
const initialForm = document.getElementById("initialForm");
const initialErr = document.getElementById("initialErr");
const sessionUserLabel = document.getElementById("sessionUserLabel");
const logoutBtn = document.getElementById("logoutBtn");
const changePwdForm = document.getElementById("changePwdForm");
const chPwdMsg = document.getElementById("chPwdMsg");
const admSuperBlock = document.getElementById("admSuperBlock");
const navAdmins = document.getElementById("navAdmins");
const panelAdmins = document.getElementById("panelAdmins");
const admListMount = document.getElementById("admListMount");
const admListMsg = document.getElementById("admListMsg");
const admNewUser = document.getElementById("admNewUser");
const admNewPass = document.getElementById("admNewPass");
const admAddBtn = document.getElementById("admAddBtn");
const admAuditRefresh = document.getElementById("admAuditRefresh");
const admAuditUserFilter = document.getElementById("admAuditUserFilter");
const admAuditClearFilter = document.getElementById("admAuditClearFilter");
const admAuditMount = document.getElementById("admAuditMount");
const SUPER_ADMIN = "3158299835";
let sessionIsSuper = false;
const navWiki = document.getElementById("navWiki");
const navFeatures = document.getElementById("navFeatures");
const navJoinGuide = document.getElementById("navJoinGuide");
const navEvents = document.getElementById("navEvents");
const navStaff = document.getElementById("navStaff");
const navSite = document.getElementById("navSite");
const panelWiki = document.getElementById("panelWiki");
const panelFeatures = document.getElementById("panelFeatures");
const panelJoinGuide = document.getElementById("panelJoinGuide");
const panelEvents = document.getElementById("panelEvents");
const panelStaff = document.getElementById("panelStaff");
const panelSite = document.getElementById("panelSite");
const feFormWrap = document.getElementById("feFormWrap");
const feSecTitle = document.getElementById("feSecTitle");
const feSecSubtitle = document.getElementById("feSecSubtitle");
const feTabsMount = document.getElementById("feTabsMount");
const feAddTab = document.getElementById("feAddTab");
const feReloadBtn = document.getElementById("feReloadBtn");
const fePreview = document.getElementById("fePreview");
const feSaveBtn = document.getElementById("feSaveBtn");
const feSaveMsg = document.getElementById("feSaveMsg");
const staffMembersMount = document.getElementById("staffMembersMount");
const staffAddMemberBtn = document.getElementById("staffAddMemberBtn");
const staffNoSelection = document.getElementById("staffNoSelection");
const staffEditFields = document.getElementById("staffEditFields");
const staffOrder = document.getElementById("staffOrder");
const staffName = document.getElementById("staffName");
const staffTitle = document.getElementById("staffTitle");
const staffBio = document.getElementById("staffBio");
const staffColor = document.getElementById("staffColor");
const staffColorPick = document.getElementById("staffColorPick");
const staffSaveBtn = document.getElementById("staffSaveBtn");
const staffSaveMsg = document.getElementById("staffSaveMsg");
const staffUploadHead = document.getElementById("staffUploadHead");
const staffUploadPortrait = document.getElementById("staffUploadPortrait");
const staffFiles = document.getElementById("staffFiles");
const staffReloadListBtn = document.getElementById("staffReloadListBtn");
const staffPreviewPanel = document.getElementById("staffPreviewPanel");
const staffPvName = document.getElementById("staffPvName");
const staffPvTitle = document.getElementById("staffPvTitle");
const staffPvColorSwatch = document.getElementById("staffPvColorSwatch");
const staffPvColorHex = document.getElementById("staffPvColorHex");
const staffPvHead = document.getElementById("staffPvHead");
const staffPvPortrait = document.getElementById("staffPvPortrait");
const staffPvBio = document.getElementById("staffPvBio");
const siteFaviconPrev = document.getElementById("siteFaviconPrev");
const siteBrandLogoPrev = document.getElementById("siteBrandLogoPrev");
const siteHeroFloatPrev = document.getElementById("siteHeroFloatPrev");
const siteFaviconInput = document.getElementById("siteFaviconInput");
const siteBrandLogoInput = document.getElementById("siteBrandLogoInput");
const siteHeroFloatInput = document.getElementById("siteHeroFloatInput");
const siteAssetMsg = document.getElementById("siteAssetMsg");
const mdSource = document.getElementById("mdSource");
const mdPreview = document.getElementById("mdPreview");
const tabSource = document.getElementById("tabSource");
const tabPreview = document.getElementById("tabPreview");
const saveBtn = document.getElementById("saveBtn");
const saveMsg = document.getElementById("saveMsg");
const btnWikiUploads = document.getElementById("btnWikiUploads");
const wikiUploadsDlg = document.getElementById("wikiUploadsDlg");
const wikiUploadsGrid = document.getElementById("wikiUploadsGrid");
const wikiUploadsDlgClose = document.getElementById("wikiUploadsDlgClose");
const wikiUploadFileInput = document.getElementById("wikiUploadFileInput");
const wikiUploadsDlgStatus = document.getElementById("wikiUploadsDlgStatus");
const wikiCopyScratch = document.getElementById("wikiCopyScratch");
const jgFocusMount = document.getElementById("jgFocusMount");
const jgSelectionHint = document.getElementById("jgSelectionHint");
const jgPreview = document.getElementById("jgPreview");
const jgAddServerRow = document.getElementById("jgAddServerRow");
const jgAddReqRow = document.getElementById("jgAddReqRow");
const jgAddStep = document.getElementById("jgAddStep");
const jgSaveBtn = document.getElementById("jgSaveBtn");
const jgSaveMsg = document.getElementById("jgSaveMsg");
const jgReloadBtn = document.getElementById("jgReloadBtn");
const evSecTitle = document.getElementById("evSecTitle");
const evSecSubtitle = document.getElementById("evSecSubtitle");
const evItemsMount = document.getElementById("evItemsMount");
const evAddItem = document.getElementById("evAddItem");
const evSaveBtn = document.getElementById("evSaveBtn");
const evSaveMsg = document.getElementById("evSaveMsg");
const evReloadBtn = document.getElementById("evReloadBtn");
const evHeaderBlock = document.getElementById("evHeaderBlock");
const evBrowseMount = document.getElementById("evBrowseMount");
const evNavScope = document.getElementById("evNavScope");
const evNavMonth = document.getElementById("evNavMonth");
const evNavItem = document.getElementById("evNavItem");

const WIKI_UPLOAD_NAME_RE = /^[a-zA-Z0-9._-]+\.(png|jpe?g|gif|webp|svg|avif)$/i;

let siteImgV = Date.now();

function showLoginOnly() {
  sessionIsSuper = false;
  updateSuperNav();
  loginPanel.hidden = false;
  appPanel.hidden = true;
}

function showApp() {
  loginPanel.hidden = true;
  appPanel.hidden = false;
}

function setInitialLoginDisabled(d) {
  if (loginForm) {
    const btn = loginForm.querySelector('button[type="submit"]');
    if (btn) btn.disabled = !!d;
  }
  if (initialForm) {
    const b = initialForm.querySelector('button[type="submit"]');
    if (b) b.disabled = !!d;
  }
}

function updateSuperNav() {
  if (navAdmins) navAdmins.hidden = false;
}

function syncAdminsPanelMode() {
  if (admSuperBlock) admSuperBlock.hidden = !sessionIsSuper;
}

async function applyPreflight() {
  if (preflightErr) {
    preflightErr.hidden = true;
    preflightErr.textContent = "";
  }
  let j = {};
  try {
    const r = await fetch("/api/admin/preflight", { credentials: "same-origin" });
    j = await r.json().catch(() => ({}));
  } catch (e) {
    if (preflightErr) {
      preflightErr.textContent = String((e && e.message) || e);
      preflightErr.hidden = false;
    }
    return;
  }
  if (!j.encryptionOk) {
    if (preflightErr) {
      preflightErr.textContent = j.error || "无法初始化后台";
      preflightErr.hidden = false;
    }
    if (initialBlock) initialBlock.hidden = true;
    if (loginForm) loginForm.hidden = false;
    setInitialLoginDisabled(true);
    return;
  }
  if (j.error) {
    if (preflightErr) {
      preflightErr.textContent = j.error;
      preflightErr.hidden = false;
    }
    if (initialBlock) initialBlock.hidden = true;
    if (loginForm) loginForm.hidden = false;
    setInitialLoginDisabled(true);
    return;
  }
  setInitialLoginDisabled(false);
  const needInit = j.needsInitialSetup === true;
  if (initialBlock) initialBlock.hidden = !needInit;
  if (loginForm) loginForm.hidden = needInit;
}

async function refreshSessionUser() {
  if (!sessionUserLabel) return;
  sessionUserLabel.textContent = "";
  sessionIsSuper = false;
  const r = await fetch("/api/admin/session", { credentials: "include" });
  if (!r.ok) return;
  const j = await r.json().catch(() => ({}));
  const u = j && j.user ? String(j.user).trim() : "";
  if (u) sessionUserLabel.textContent = "（" + u + "）";
  sessionIsSuper = j && j.isSuper === true;
  updateSuperNav();
  syncAdminsPanelMode();
}

async function sessionOk() {
  const r = await fetch("/api/admin/session", { credentials: "include" });
  return r.ok;
}

async function refreshPreview() {
  try {
    const marked = await getMarked();
    mdPreview.innerHTML = marked.parse(mdSource.value || "");
  } catch {
    mdPreview.innerHTML =
      "<p>预览组件加载失败，请确认 <code>/js/vendor/marked.esm.js</code> 可访问。</p>";
  }
}

async function loadWikiMd() {
  const tryFetch = () => fetch("/api/admin/wiki", { credentials: "include" });
  let r = await tryFetch();
  if (r.status === 401) {
    await new Promise((x) => setTimeout(x, 150));
    r = await tryFetch();
  }
  if (r.status === 401) {
    showLoginOnly();
    return false;
  }
  if (!r.ok) {
    saveMsg.textContent = "无法加载 content.md";
    saveMsg.className = "admin-msg is-bad";
    mdSource.value = "";
    return false;
  }
  const data = await r.json();
  mdSource.value = typeof data.content === "string" ? data.content : "";
  saveMsg.textContent = "";
  saveMsg.className = "admin-msg";
  await refreshPreview();
  return true;
}

async function setEditMode(mode) {
  const isSrc = mode === "source";
  tabSource.classList.toggle("is-active", isSrc);
  tabPreview.classList.toggle("is-active", !isSrc);
  tabSource.setAttribute("aria-selected", isSrc ? "true" : "false");
  tabPreview.setAttribute("aria-selected", isSrc ? "false" : "true");
  const host = document.getElementById("wikiEditorHost");
  if (host) host.hidden = !isSrc;
  else mdSource.hidden = !isSrc;
  mdPreview.hidden = isSrc;
  if (!isSrc) {
    mdPreview.focus();
    await refreshPreview();
  } else {
    mdSource.focus();
  }
}


function copyWithExecCommand(text) {
  const ta = wikiCopyScratch;
  if (ta) {
    ta.value = text;
    ta.focus();
    ta.select();
    try {
      ta.setSelectionRange(0, text.length);
    } catch (e) {}
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {}
    return ok;
  }
  const el = document.createElement("textarea");
  el.value = text;
  el.setAttribute("readonly", "");
  el.style.position = "fixed";
  el.style.left = "-9999px";
  const mount =
    wikiUploadsDlg && wikiUploadsDlg.open ? wikiUploadsDlg : document.body;
  mount.appendChild(el);
  el.focus();
  el.select();
  try {
    el.setSelectionRange(0, text.length);
  } catch (e) {}
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch (e) {}
  mount.removeChild(el);
  return ok;
}

async function loadAdminsPanel() {
  syncAdminsPanelMode();
  await loadAuditLogs();
  if (!sessionIsSuper || !admListMount) {
    if (admListMsg) {
      admListMsg.textContent = "";
      admListMsg.className = "admin-msg";
    }
    if (admListMount) admListMount.innerHTML = "";
    return;
  }
  if (admListMsg) {
    admListMsg.textContent = "";
    admListMsg.className = "admin-msg";
  }
  const r = await fetch("/api/admin/accounts", { credentials: "include" });
  if (r.status === 401) {
    showLoginOnly();
    return;
  }
  if (r.status === 403) {
    if (admListMsg) {
      admListMsg.textContent = "无权限";
      admListMsg.className = "admin-msg is-bad";
    }
    return;
  }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    if (admListMsg) {
      admListMsg.textContent = String((j && j.error) || "加载失败");
      admListMsg.className = "admin-msg is-bad";
    }
    return;
  }
  const users = Array.isArray(j.users) ? j.users : [];
  renderAdminsList(users);
}

function formatTimeChinaShanghai(value) {
  if (value == null || value === "") return "—";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const o = {};
  for (const x of parts) {
    if (x.type !== "literal") o[x.type] = x.value;
  }
  if (o.year == null) {
    return d.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false });
  }
  return `${o.year}年${o.month}月${o.day}日 ${o.hour}:${o.minute}:${o.second}`;
}

function renderAuditEntries(entries) {
  if (!admAuditMount) return;
  admAuditMount.innerHTML = "";
  if (!entries || !entries.length) {
    const p = document.createElement("p");
    p.className = "admin-muted";
    p.textContent = "暂无记录";
    admAuditMount.appendChild(p);
    return;
  }
  const tbl = document.createElement("table");
  tbl.className = "admin-audit-table";
  const thead = document.createElement("thead");
  const hr = document.createElement("tr");
  for (const h of ["时间", "账号", "类型", "说明", "HTTP", "路径", "状态", "耗时"]) {
    const th = document.createElement("th");
    th.textContent = h;
    hr.appendChild(th);
  }
  thead.appendChild(hr);
  tbl.appendChild(thead);
  const tb = document.createElement("tbody");
  for (const e of entries) {
    const tr = document.createElement("tr");
    const t = formatTimeChinaShanghai(e.t);
    const user = e.user != null ? String(e.user) : "";
    const op = e.op != null ? String(e.op) : "—";
    let summary = "";
    if (e.summary != null && e.summary !== "") {
      summary = String(e.summary);
    } else if (e.action) {
      summary = String(e.action);
    } else {
      summary = [e.method, e.path].filter(Boolean).join(" ");
    }
    const method = e.method != null ? String(e.method) : "";
    const pth = e.path != null ? String(e.path) : "";
    const status = e.status != null ? String(e.status) : "";
    const ms = e.ms != null && e.ms !== "" ? String(e.ms) + "ms" : "";
    for (const v of [t, user, op, summary, method, pth, status, ms]) {
      const td = document.createElement("td");
      td.textContent = v;
      tr.appendChild(td);
    }
    tb.appendChild(tr);
  }
  tbl.appendChild(tb);
  admAuditMount.appendChild(tbl);
}

async function loadAuditLogs() {
  if (!admAuditMount) return;
  const qs = new URLSearchParams();
  qs.set("limit", "200");
  if (admAuditUserFilter) {
    const f = String(admAuditUserFilter.value || "").trim();
    if (f) qs.set("user", f);
  }
  const r = await fetch("/api/admin/audit-logs?" + qs.toString(), { credentials: "include" });
  if (r.status === 401) {
    showLoginOnly();
    return;
  }
  if (r.status === 403) {
    admAuditMount.textContent = "";
    const p = document.createElement("p");
    p.className = "admin-msg is-bad";
    p.textContent = "无权限";
    admAuditMount.appendChild(p);
    return;
  }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    admAuditMount.textContent = "";
    const p = document.createElement("p");
    p.className = "admin-msg is-bad";
    p.textContent = String((j && j.error) || "加载失败");
    admAuditMount.appendChild(p);
    return;
  }
  const entries = Array.isArray(j.entries) ? j.entries : [];
  renderAuditEntries(entries);
}

function renderAdminsList(users) {
  if (!admListMount) return;
  admListMount.innerHTML = "";
  for (const name of users) {
    const row = document.createElement("div");
    row.className = "admin-admins-row";
    const nm = document.createElement("span");
    nm.className = "admin-admins-row__name";
    nm.textContent = name;
    row.appendChild(nm);
    if (name === SUPER_ADMIN) {
      const tag = document.createElement("span");
      tag.className = "admin-admins-row__tag";
      tag.textContent = "主管理员";
      row.appendChild(tag);
    }
    const passIn = document.createElement("input");
    passIn.type = "password";
    passIn.placeholder = "新密码";
    passIn.autocomplete = "new-password";
    passIn.minLength = 8;
    passIn.style.maxWidth = "12rem";
    const btnCh = document.createElement("button");
    btnCh.type = "button";
    btnCh.className = "outline secondary";
    btnCh.textContent = "改密";
    btnCh.addEventListener("click", () => {
      const pw = String(passIn.value || "");
      if (pw.length < 8) {
        if (admListMsg) {
          admListMsg.textContent = "密码至少 8 位";
          admListMsg.className = "admin-msg is-bad";
        }
        return;
      }
      void (async () => {
        const r = await fetch("/api/admin/accounts/" + encodeURIComponent(name), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ password: pw }),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) {
          if (admListMsg) {
            admListMsg.textContent = String((j && j.error) || "失败");
            admListMsg.className = "admin-msg is-bad";
          }
          return;
        }
        passIn.value = "";
        if (admListMsg) {
          admListMsg.textContent = "已更新 " + name + " 的密码";
          admListMsg.className = "admin-msg is-ok";
        }
      })();
    });
    row.appendChild(passIn);
    row.appendChild(btnCh);
    if (name !== SUPER_ADMIN) {
      const btnDel = document.createElement("button");
      btnDel.type = "button";
      btnDel.className = "outline secondary";
      btnDel.textContent = "删除";
      btnDel.addEventListener("click", () => {
        if (!window.confirm("确定删除账号 " + name + " ？")) return;
        void (async () => {
          const r = await fetch("/api/admin/accounts/" + encodeURIComponent(name), {
            method: "DELETE",
            credentials: "include",
          });
          const j = await r.json().catch(() => ({}));
          if (!r.ok) {
            if (admListMsg) {
              admListMsg.textContent = String((j && j.error) || "失败");
              admListMsg.className = "admin-msg is-bad";
            }
            return;
          }
          await loadAdminsPanel();
        })();
      });
      row.appendChild(btnDel);
    }
    admListMount.appendChild(row);
  }
}

function setPanel(name) {
  navWiki.classList.toggle("is-active", name === "wiki");
  if (navFeatures) navFeatures.classList.toggle("is-active", name === "features");
  if (navJoinGuide) navJoinGuide.classList.toggle("is-active", name === "joinGuide");
  if (navEvents) navEvents.classList.toggle("is-active", name === "events");
  if (navStaff) navStaff.classList.toggle("is-active", name === "staff");
  if (navAdmins) navAdmins.classList.toggle("is-active", name === "admins");
  if (navSite) navSite.classList.toggle("is-active", name === "site");
  panelWiki.hidden = name !== "wiki";
  if (panelFeatures) panelFeatures.hidden = name !== "features";
  if (panelJoinGuide) panelJoinGuide.hidden = name !== "joinGuide";
  if (panelEvents) panelEvents.hidden = name !== "events";
  if (panelStaff) panelStaff.hidden = name !== "staff";
  if (panelAdmins) panelAdmins.hidden = name !== "admins";
  if (panelSite) panelSite.hidden = name !== "site";
  if (name === "features") {
    void loadFeaturesFromServer();
  }
  if (name === "joinGuide") {
    void loadJoinGuideFromServer();
  }
  if (name === "events") {
    void loadEventsFromServer();
  }
  if (name === "staff") {
    void loadStaffPanelFromServer();
  }
  if (name === "admins") {
    void loadAdminsPanel();
  }
  if (name === "site") {
    siteImgV = Date.now();
    const v = siteImgV;
    if (siteFaviconPrev) siteFaviconPrev.src = "/img/favicon.png?v=" + v;
    if (siteBrandLogoPrev) siteBrandLogoPrev.src = "/img/brand-logo.png?v=" + v;
    if (siteHeroFloatPrev) siteHeroFloatPrev.src = "/img/hero-float.png?v=" + v;
  }
}

function setGalleryStatus(text, ok) {
  if (!wikiUploadsDlgStatus) return;
  wikiUploadsDlgStatus.textContent = text || "";
  wikiUploadsDlgStatus.className =
    "admin-uploads-dlg__status" + (ok === true ? " is-ok" : ok === false ? " is-bad" : "");
}

async function fetchWikiUploadsList() {
  const r = await fetch("/api/admin/wiki-uploads", { credentials: "include", cache: "no-store" });
  if (r.status === 401) throw new Error("401");
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(String((j && j.error) || "加载失败"));
  return Array.isArray(j.files) ? j.files : [];
}

function renderWikiUploadsGrid(files) {
  if (!wikiUploadsGrid) return;
  wikiUploadsGrid.innerHTML = "";
  const imgSrcSuffix = "?v=" + Date.now();
  if (!files.length) {
    wikiUploadsGrid.innerHTML = "<p class=\"admin-muted\">暂无图片</p>";
    return;
  }
  for (const row of files) {
    const name = row && typeof row.name === "string" ? row.name : "";
    const repoPath = row && typeof row.repoPath === "string" ? row.repoPath : "";
    if (!name || !repoPath) continue;
    const uploadUrlPath =
      "/wiki/uploads/" + encodeURIComponent(name).replace(/%2F/g, "/");
    const mdInsert = "![配图](" + uploadUrlPath + ")";
    const wrap = document.createElement("div");
    wrap.className = "admin-uploads-card";
    const actions = document.createElement("div");
    actions.className = "admin-uploads-actions";
    const btnRename = document.createElement("button");
    btnRename.type = "button";
    btnRename.className = "outline secondary admin-uploads-act";
    btnRename.textContent = "改名";
    const btnDel = document.createElement("button");
    btnDel.type = "button";
    btnDel.className = "outline secondary admin-uploads-act";
    btnDel.textContent = "删除";
    actions.appendChild(btnRename);
    actions.appendChild(btnDel);
    const card = document.createElement("button");
    card.type = "button";
    card.className = "admin-uploads-item";
    card.title = "点击复制 " + mdInsert;
    const img = document.createElement("img");
    img.src = uploadUrlPath + imgSrcSuffix;
    img.alt = "";
    img.loading = "lazy";
    card.appendChild(img);
    const cap = document.createElement("span");
    cap.className = "admin-uploads-name";
    cap.textContent = name;
    card.appendChild(cap);
    card.addEventListener("click", (ev) => {
      ev.stopPropagation();
      if (copyWithExecCommand(mdInsert)) {
        setGalleryStatus("已复制：" + mdInsert, true);
        return;
      }
      if (navigator.clipboard && window.isSecureContext) {
        void navigator.clipboard.writeText(mdInsert).then(
          () => {
            setGalleryStatus("已复制：" + mdInsert, true);
          },
          () => {
            setGalleryStatus("请手动复制：" + mdInsert, false);
          }
        );
        return;
      }
      setGalleryStatus("请手动复制：" + mdInsert, false);
    });
    btnRename.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      void renameWikiUpload(name);
    });
    btnDel.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      void deleteWikiUpload(name);
    });
    wrap.appendChild(actions);
    wrap.appendChild(card);
    wikiUploadsGrid.appendChild(wrap);
  }
}

async function refreshWikiUploadsGrid() {
  if (!wikiUploadsGrid) return;
  wikiUploadsGrid.innerHTML = "<p class=\"admin-muted\">加载中…</p>";
  try {
    const files = await fetchWikiUploadsList();
    renderWikiUploadsGrid(files);
    setGalleryStatus("", null);
  } catch (e) {
    if (String(e && e.message) === "401") {
      wikiUploadsDlg.close();
      showLoginOnly();
      return;
    }
    wikiUploadsGrid.innerHTML =
      "<p class=\"admin-msg is-bad\">" + String((e && e.message) || e) + "</p>";
  }
}

async function uploadWikiFiles(fileList) {
  const arr = fileList && fileList.length ? Array.from(fileList) : [];
  if (!arr.length) return;
  setGalleryStatus("上传中…", null);
  try {
    for (const file of arr) {
      const ct = file.type && /^image\//i.test(file.type) ? file.type : "application/octet-stream";
      const r = await fetch("/api/admin/wiki-uploads/upload-bin", {
        method: "POST",
        headers: {
          "Content-Type": ct,
          "X-Upload-Name": encodeURIComponent(file.name || "image.png"),
        },
        credentials: "include",
        cache: "no-store",
        body: file,
      });
      const raw = await r.text();
      let j = {};
      try {
        j = raw ? JSON.parse(raw) : {};
      } catch {
        j = { error: raw.trim().slice(0, 240) || "上传失败" };
      }
      if (r.status === 401) {
        wikiUploadsDlg.close();
        showLoginOnly();
        return;
      }
      if (!r.ok) {
        setGalleryStatus(String((j && j.error) || "上传失败（HTTP " + r.status + "）"), false);
        return;
      }
    }
    setGalleryStatus("上传完成", true);
    await refreshWikiUploadsGrid();
  } catch (e) {
    setGalleryStatus("上传异常：" + String((e && e.message) || e), false);
  }
}

async function deleteWikiUpload(name) {
  if (!confirm("删除 " + name + " ？")) return;
  setGalleryStatus("删除中…", null);
  const r = await fetch("/api/admin/wiki-uploads/item-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({ name }),
  });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401) {
    wikiUploadsDlg.close();
    showLoginOnly();
    return;
  }
  if (!r.ok) {
    setGalleryStatus(String((j && j.error) || "删除失败"), false);
    return;
  }
  setGalleryStatus("已删除", true);
  await refreshWikiUploadsGrid();
}

async function renameWikiUpload(fromName) {
  const next = window.prompt("新文件名（含扩展名）", fromName);
  if (next == null) return;
  const to = String(next).trim().split(/[/\\]/).pop();
  if (!to || to === fromName) return;
  if (!WIKI_UPLOAD_NAME_RE.test(to)) {
    setGalleryStatus("文件名不合法：仅字母数字._- 且扩展名为 png/jpg/gif/webp/svg/avif", false);
    return;
  }
  setGalleryStatus("改名中…", null);
  const r = await fetch("/api/admin/wiki-uploads/item-rename", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({ from: fromName, to }),
  });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401) {
    wikiUploadsDlg.close();
    showLoginOnly();
    return;
  }
  if (!r.ok) {
    setGalleryStatus(String((j && j.error) || "改名失败"), false);
    return;
  }
  setGalleryStatus("已改为 " + to, true);
  await refreshWikiUploadsGrid();
}

async function openWikiUploadsDlg() {
  if (!wikiUploadsDlg || !wikiUploadsGrid) return;
  setGalleryStatus("", null);
  wikiUploadsDlg.showModal();
  await refreshWikiUploadsGrid();
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginErr.hidden = true;
  const fd = new FormData(loginForm);
  const user = String(fd.get("user") || "");
  const password = String(fd.get("password") || "");
  const r = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ user, password }),
  });
  if (!r.ok) {
    let msg = "登录失败";
    try {
      const j = await r.json();
      if (j && j.error) msg = j.error;
    } catch {}
    loginErr.textContent = msg;
    loginErr.hidden = false;
    return;
  }
  showApp();
  await refreshSessionUser();
  setPanel("wiki");
  await setEditMode("source");
  await loadWikiMd();
});

if (initialForm) {
  initialForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (initialErr) {
      initialErr.hidden = true;
      initialErr.textContent = "";
    }
    const fd = new FormData(initialForm);
    const password = String(fd.get("password") || "");
    const password2 = String(fd.get("password2") || "");
    if (password !== password2) {
      if (initialErr) {
        initialErr.textContent = "两次密码不一致";
        initialErr.hidden = false;
      }
      return;
    }
    const r = await fetch("/api/admin/initial-setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password }),
    });
    if (!r.ok) {
      let msg = "创建失败";
      try {
        const j = await r.json();
        if (j && j.error) msg = j.error;
      } catch {}
      if (initialErr) {
        initialErr.textContent = msg;
        initialErr.hidden = false;
      }
      return;
    }
    if (loginForm) loginForm.hidden = false;
    if (initialBlock) initialBlock.hidden = true;
    showApp();
    await refreshSessionUser();
    setPanel("wiki");
    await setEditMode("source");
    await loadWikiMd();
  });
}

if (changePwdForm) {
  changePwdForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!chPwdMsg) return;
    chPwdMsg.hidden = true;
    const fd = new FormData(changePwdForm);
    const currentPassword = String(fd.get("currentPassword") || "");
    const newPassword = String(fd.get("newPassword") || "");
    const newPassword2 = String(fd.get("newPassword2") || "");
    if (newPassword !== newPassword2) {
      chPwdMsg.textContent = "两次新密码不一致";
      chPwdMsg.className = "admin-msg is-bad";
      chPwdMsg.hidden = false;
      return;
    }
    const r = await fetch("/api/admin/me/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!r.ok) {
      let msg = "修改失败";
      try {
        const j = await r.json();
        if (j && j.error) msg = j.error;
      } catch {}
      chPwdMsg.textContent = msg;
      chPwdMsg.className = "admin-msg is-bad";
      chPwdMsg.hidden = false;
      return;
    }
    markedCache = null;
    window.location.assign("/admin/");
  });
}

logoutBtn.addEventListener("click", async () => {
  try {
    const r = await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    markedCache = null;
    if (r.ok) {
      window.location.assign("/admin/");
      return;
    }
  } catch (_) {}
  mdSource.value = "";
  mdPreview.innerHTML = "";
  showLoginOnly();
});

navWiki.addEventListener("click", () => {
  setPanel("wiki");
});

if (navFeatures) {
  navFeatures.addEventListener("click", () => {
    setPanel("features");
  });
}
if (navJoinGuide) {
  navJoinGuide.addEventListener("click", () => {
    setPanel("joinGuide");
  });
}
if (navEvents) {
  navEvents.addEventListener("click", () => {
    setPanel("events");
  });
}
if (navStaff) {
  navStaff.addEventListener("click", () => {
    setPanel("staff");
  });
}
if (navAdmins) {
  navAdmins.addEventListener("click", () => {
    setPanel("admins");
  });
}
if (navSite) {
  navSite.addEventListener("click", () => {
    setPanel("site");
  });
}
if (admAddBtn) {
  admAddBtn.addEventListener("click", () => {
    const user = String((admNewUser && admNewUser.value) || "").trim();
    const password = String((admNewPass && admNewPass.value) || "");
    if (!user) {
      if (admListMsg) {
        admListMsg.textContent = "请填写账号";
        admListMsg.className = "admin-msg is-bad";
      }
      return;
    }
    if (password.length < 8) {
      if (admListMsg) {
        admListMsg.textContent = "密码至少 8 位";
        admListMsg.className = "admin-msg is-bad";
      }
      return;
    }
    void (async () => {
      const r = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user, password }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (admListMsg) {
          admListMsg.textContent = String((j && j.error) || "失败");
          admListMsg.className = "admin-msg is-bad";
        }
        return;
      }
      if (admNewUser) admNewUser.value = "";
      if (admNewPass) admNewPass.value = "";
      if (admListMsg) {
        admListMsg.textContent = "已添加 " + user;
        admListMsg.className = "admin-msg is-ok";
      }
      await loadAdminsPanel();
    })();
  });
}
if (admAuditRefresh) {
  admAuditRefresh.addEventListener("click", () => {
    void loadAuditLogs();
  });
}
if (admAuditClearFilter && admAuditUserFilter) {
  admAuditClearFilter.addEventListener("click", () => {
    admAuditUserFilter.value = "";
    void loadAuditLogs();
  });
}

tabSource.addEventListener("click", () => {
  setEditMode("source");
});
tabPreview.addEventListener("click", () => {
  setEditMode("preview");
});

if (btnWikiUploads) {
  btnWikiUploads.addEventListener("click", () => void openWikiUploadsDlg());
}
if (wikiUploadsDlgClose && wikiUploadsDlg) {
  wikiUploadsDlgClose.addEventListener("click", () => wikiUploadsDlg.close());
}
if (wikiUploadsDlg) {
  wikiUploadsDlg.addEventListener("click", (e) => {
    if (e.target === wikiUploadsDlg) wikiUploadsDlg.close();
  });
}

if (wikiUploadFileInput) {
  wikiUploadFileInput.addEventListener("change", () => {
    const arr = Array.from(wikiUploadFileInput.files || []);
    wikiUploadFileInput.value = "";
    void uploadWikiFiles(arr);
  });
}

mdSource.addEventListener("input", () => {
  if (!mdPreview.hidden) refreshPreview();
});

let wikiSaveInFlight = false;
saveBtn.addEventListener("click", async () => {
  if (wikiSaveInFlight) return;
  wikiSaveInFlight = true;
  saveMsg.textContent = "保存中…";
  saveMsg.className = "admin-msg";
  saveBtn.disabled = true;
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 60000);
  try {
    const r = await fetch("/api/admin/wiki", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify({ content: mdSource.value }),
      signal: ac.signal,
    });
    if (r.status === 401) {
      showLoginOnly();
      saveMsg.textContent = "会话已过期，请重新登录";
      saveMsg.className = "admin-msg is-bad";
      return;
    }
    if (!r.ok) {
      let msg = "保存失败";
      try {
        const j = await r.json();
        if (j && j.error) msg = j.error;
      } catch {}
      saveMsg.textContent = msg;
      saveMsg.className = "admin-msg is-bad";
      return;
    }
    saveMsg.textContent = "已保存";
    saveMsg.className = "admin-msg is-ok";
  } catch (e) {
    const name = e && e.name;
    saveMsg.textContent =
      name === "AbortError" ? "保存超时（60s），请检查网络后重试" : "保存失败：" + String((e && e.message) || e);
    saveMsg.className = "admin-msg is-bad";
  } finally {
    clearTimeout(t);
    wikiSaveInFlight = false;
    saveBtn.disabled = false;
  }
});

let featuresPreviewT = null;
function parseFeaturesJsonSafe(text) {
  try {
    return JSON.parse(String(text || "").replace(/^\uFEFF/, ""));
  } catch {
    return null;
  }
}
function emptyFeTab() {
  return { title: "", body: "" };
}
function feTabToData(tab) {
  const t = tab || emptyFeTab();
  return {
    title: t.title != null ? String(t.title) : "",
    body: t.body != null ? String(t.body) : "",
  };
}
let feDragTabEl = null;

function feGetDragAfterElement(container, y) {
  const els = [...container.querySelectorAll(".admin-fe-tab:not(.is-fe-dragging)")];
  for (const el of els) {
    const box = el.getBoundingClientRect();
    if (y < box.top + box.height / 2) return el;
  }
  return null;
}

function feBindTabsDragContainer() {
  if (!feTabsMount || feTabsMount.dataset.feDnd === "1") return;
  feTabsMount.dataset.feDnd = "1";
  feTabsMount.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (!feDragTabEl) return;
    try {
      e.dataTransfer.dropEffect = "move";
    } catch (_) {}
    const after = feGetDragAfterElement(feTabsMount, e.clientY);
    if (after == null) feTabsMount.appendChild(feDragTabEl);
    else feTabsMount.insertBefore(feDragTabEl, after);
  });
  feTabsMount.addEventListener("drop", (e) => e.preventDefault());
}

function feRenumberFeTabs() {
  if (!feTabsMount) return;
  feTabsMount.querySelectorAll(".admin-fe-tab").forEach((wrap, i) => {
    const idx = wrap.querySelector(".admin-fe-tab__idx");
    if (idx) idx.textContent = "条目 " + (i + 1);
  });
}

function appendFeTabEditor(tab) {
  if (!feTabsMount) return;
  feBindTabsDragContainer();
  const d = feTabToData(tab);
  const wrap = document.createElement("div");
  wrap.className = "admin-fe-tab";

  const bar = document.createElement("div");
  bar.className = "admin-fe-tab__bar";

  const dragHint = document.createElement("span");
  dragHint.className = "admin-fe-tab__drag";
  dragHint.textContent = "拖动";
  dragHint.draggable = true;
  dragHint.addEventListener("dragstart", (e) => {
    feDragTabEl = wrap;
    wrap.classList.add("is-fe-dragging");
    try {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", "fe-tab");
    } catch (_) {}
    e.stopPropagation();
  });
  dragHint.addEventListener("dragend", () => {
    wrap.classList.remove("is-fe-dragging");
    feDragTabEl = null;
    feRenumberFeTabs();
    scheduleFeaturesPreview();
  });

  const idxSpan = document.createElement("span");
  idxSpan.className = "admin-fe-tab__idx";
  idxSpan.textContent = "条目 " + (feTabsMount.querySelectorAll(".admin-fe-tab").length + 1);

  const rm = document.createElement("button");
  rm.type = "button";
  rm.className = "outline secondary admin-fe-tab-rm";
  rm.textContent = "删除";
  rm.addEventListener("click", () => {
    if (feTabsMount.querySelectorAll(".admin-fe-tab").length <= 1) return;
    wrap.remove();
    feRenumberFeTabs();
    scheduleFeaturesPreview();
  });

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "outline secondary admin-fe-tab__toggle";
  toggle.textContent = "展开";

  const panel = document.createElement("div");
  panel.className = "admin-fe-tab__panel";
  panel.hidden = true;

  function setOpen(open) {
    panel.hidden = !open;
    toggle.textContent = open ? "收起" : "展开";
  }
  toggle.addEventListener("click", () => setOpen(panel.hidden));

  bar.appendChild(dragHint);
  bar.appendChild(idxSpan);
  bar.appendChild(toggle);
  bar.appendChild(rm);
  wrap.appendChild(bar);
  wrap.appendChild(panel);

  function lbl(name, text, isTa, rows) {
    const lab = document.createElement("label");
    lab.textContent = text;
    let el;
    if (isTa) {
      el = document.createElement("textarea");
      el.rows = rows || 3;
    } else {
      el = document.createElement("input");
      el.type = "text";
    }
    el.setAttribute("data-fe-field", name);
    lab.appendChild(el);
    panel.appendChild(lab);
    return el;
  }
  lbl("title", "标题", false).value = d.title;
  lbl("body", "正文", true, 5).value = d.body;

  feTabsMount.appendChild(wrap);
}
function applyFeaturesDataToForm(data) {
  if (!feSecTitle || !feSecSubtitle || !feTabsMount) return;
  const sec = data && data.section ? data.section : {};
  feSecTitle.value = sec.title != null ? String(sec.title) : "";
  feSecSubtitle.value = sec.subtitle != null ? String(sec.subtitle) : "";
  feTabsMount.innerHTML = "";
  let tabs = data && Array.isArray(data.tabs) ? data.tabs : [];
  if (!tabs.length) tabs = [emptyFeTab()];
  tabs.forEach((t) => appendFeTabEditor(t));
  feRenumberFeTabs();
}
function collectFeaturesFromForm() {
  const section = {
    title: feSecTitle ? feSecTitle.value.trim() : "",
    subtitle: feSecSubtitle ? feSecSubtitle.value.trim() : "",
  };
  const tabs = [];
  if (feTabsMount) {
    feTabsMount.querySelectorAll(".admin-fe-tab").forEach((wrap) => {
      const fs = wrap.querySelector(".admin-fe-tab__panel");
      if (!fs) return;
      const g = (name) => {
        const el = fs.querySelector("[data-fe-field=\"" + name + "\"]");
        return el && "value" in el ? el.value : "";
      };
      tabs.push({
        title: String(g("title") || "").trim(),
        body: String(g("body") || "").trim(),
      });
    });
  }
  return { section, tabs };
}
function feFeaturesJsonPretty() {
  return JSON.stringify(collectFeaturesFromForm(), null, 2) + "\n";
}
function postFeaturesPreview() {
  if (!fePreview || !fePreview.contentWindow) return;
  try {
    fePreview.contentWindow.postMessage({ type: "featuresPreview", json: feFeaturesJsonPretty() }, "*");
  } catch (_) {}
}
function scheduleFeaturesPreview() {
  if (!feFormWrap || feFormWrap.closest("[hidden]")) return;
  if (featuresPreviewT) clearTimeout(featuresPreviewT);
  featuresPreviewT = setTimeout(() => {
    featuresPreviewT = null;
    postFeaturesPreview();
  }, 140);
}
async function loadFeaturesFromServer() {
  if (!feSecTitle) return;
  const r = await fetch("/api/admin/features", { credentials: "include", cache: "no-store" });
  if (r.status === 401) {
    showLoginOnly();
    return;
  }
  if (!r.ok) {
    if (feSaveMsg) {
      feSaveMsg.textContent = "无法加载 features.json";
      feSaveMsg.className = "admin-msg is-bad";
    }
    return;
  }
  const data = await r.json().catch(() => ({}));
  const raw = typeof data.content === "string" ? data.content : "";
  const parsed = parseFeaturesJsonSafe(raw);
  if (!parsed || !Array.isArray(parsed.tabs)) {
    if (feSaveMsg) {
      feSaveMsg.textContent = "服务端 JSON 无效，已用空白表单";
      feSaveMsg.className = "admin-msg is-bad";
    }
    applyFeaturesDataToForm({ section: { title: "", subtitle: "" }, tabs: [] });
  } else {
    if (feSaveMsg) {
      feSaveMsg.textContent = "";
      feSaveMsg.className = "admin-msg";
    }
    applyFeaturesDataToForm(parsed);
  }
  scheduleFeaturesPreview();
}
let feSaveInFlight = false;
if (feSaveBtn) {
  feSaveBtn.addEventListener("click", async () => {
    if (feSaveInFlight) return;
    feSaveInFlight = true;
    if (feSaveMsg) {
      feSaveMsg.textContent = "保存中…";
      feSaveMsg.className = "admin-msg";
    }
    feSaveBtn.disabled = true;
    try {
      const r = await fetch("/api/admin/features", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ content: feFeaturesJsonPretty() }),
      });
      if (r.status === 401) {
        showLoginOnly();
        return;
      }
      if (!r.ok) {
        let msg = "保存失败";
        try {
          const j = await r.json();
          if (j && j.error) msg = j.error;
        } catch {}
        if (feSaveMsg) {
          feSaveMsg.textContent = msg;
          feSaveMsg.className = "admin-msg is-bad";
        }
        return;
      }
      if (feSaveMsg) {
        feSaveMsg.textContent = "已保存";
        feSaveMsg.className = "admin-msg is-ok";
      }
      scheduleFeaturesPreview();
    } catch (e) {
      if (feSaveMsg) {
        feSaveMsg.textContent = "保存失败：" + String((e && e.message) || e);
        feSaveMsg.className = "admin-msg is-bad";
      }
    } finally {
      feSaveInFlight = false;
      feSaveBtn.disabled = false;
    }
  });
}
if (feReloadBtn) {
  feReloadBtn.addEventListener("click", () => void loadFeaturesFromServer());
}
if (feAddTab) {
  feAddTab.addEventListener("click", () => {
    appendFeTabEditor(emptyFeTab());
    feRenumberFeTabs();
    scheduleFeaturesPreview();
  });
}
if (feFormWrap) {
  feFormWrap.addEventListener("input", () => scheduleFeaturesPreview());
  feFormWrap.addEventListener("change", () => scheduleFeaturesPreview());
}

function parseJoinGuideJsonSafe(text) {
  try {
    return JSON.parse(String(text || "").replace(/^\uFEFF/, ""));
  } catch {
    return null;
  }
}
function emptyJgKvRow() {
  return { dt: "", dd: "", code: false };
}
function emptyJgStep() {
  return { title: "", body: "" };
}
function emptyJoinGuideData() {
  return {
    section: { title: "", subtitle: "" },
    serverInfo: { title: "", rows: [] },
    requirements: { title: "", rows: [] },
    stepsCard: { title: "", steps: [], cta: { qqLabel: "", qqUrl: "", copyLabel: "", serverIp: "" } },
  };
}
function normalizeJoinGuideData(raw) {
  const b = emptyJoinGuideData();
  const o = raw && typeof raw === "object" ? raw : {};
  const sec = o.section && typeof o.section === "object" ? o.section : {};
  b.section.title = sec.title != null ? String(sec.title) : "";
  b.section.subtitle = sec.subtitle != null ? String(sec.subtitle) : "";
  const si = o.serverInfo && typeof o.serverInfo === "object" ? o.serverInfo : {};
  b.serverInfo.title = si.title != null ? String(si.title) : "";
  b.serverInfo.rows = Array.isArray(si.rows)
    ? si.rows.map((r) => {
        const x = r && typeof r === "object" ? r : {};
        return {
          dt: x.dt != null ? String(x.dt) : "",
          dd: x.dd != null ? String(x.dd) : "",
          code: !!x.code,
        };
      })
    : [];
  const rq = o.requirements && typeof o.requirements === "object" ? o.requirements : {};
  b.requirements.title = rq.title != null ? String(rq.title) : "";
  b.requirements.rows = Array.isArray(rq.rows)
    ? rq.rows.map((r) => {
        const x = r && typeof r === "object" ? r : {};
        return {
          dt: x.dt != null ? String(x.dt) : "",
          dd: x.dd != null ? String(x.dd) : "",
          code: !!x.code,
        };
      })
    : [];
  const sc = o.stepsCard && typeof o.stepsCard === "object" ? o.stepsCard : {};
  b.stepsCard.title = sc.title != null ? String(sc.title) : "";
  b.stepsCard.steps = Array.isArray(sc.steps)
    ? sc.steps.map((s) => {
        const x = s && typeof s === "object" ? s : {};
        return { title: x.title != null ? String(x.title) : "", body: x.body != null ? String(x.body) : "" };
      })
    : [];
  const cta = sc.cta && typeof sc.cta === "object" ? sc.cta : {};
  b.stepsCard.cta = {
    qqLabel: cta.qqLabel != null ? String(cta.qqLabel) : "",
    qqUrl: cta.qqUrl != null ? String(cta.qqUrl) : "",
    copyLabel: cta.copyLabel != null ? String(cta.copyLabel) : "",
    serverIp: cta.serverIp != null ? String(cta.serverIp) : "",
  };
  return b;
}
let jgState = null;
let jgSelection = "section";
let jgPreviewT = null;
function joinGuideJsonPretty() {
  if (!jgState) return JSON.stringify(emptyJoinGuideData(), null, 2) + "\n";
  return JSON.stringify(jgState, null, 2) + "\n";
}
function clampJgSelection() {
  if (!jgState) {
    jgSelection = "section";
    return;
  }
  const p = jgSelection || "section";
  const m0 = p.match(/^serverInfo\.rows\.(\d+)$/);
  if (m0) {
    const i = Number(m0[1]);
    if (i < 0 || i >= jgState.serverInfo.rows.length) {
      jgSelection = "serverInfo.title";
    }
    return;
  }
  const m1 = p.match(/^requirements\.rows\.(\d+)$/);
  if (m1) {
    const i = Number(m1[1]);
    if (i < 0 || i >= jgState.requirements.rows.length) {
      jgSelection = "requirements.title";
    }
    return;
  }
  const m2 = p.match(/^stepsCard\.steps\.(\d+)$/);
  if (m2) {
    const i = Number(m2[1]);
    if (i < 0 || i >= jgState.stepsCard.steps.length) {
      jgSelection = "stepsCard.title";
    }
  }
}
function scheduleJoinGuidePreview() {
  const col = document.getElementById("jgEditorCol");
  if (col && col.closest("[hidden]")) return;
  if (jgPreviewT) clearTimeout(jgPreviewT);
  jgPreviewT = setTimeout(() => {
    jgPreviewT = null;
    if (!jgPreview || !jgPreview.contentWindow || !jgState) return;
    try {
      jgPreview.contentWindow.postMessage(
        { type: "joinGuidePreview", json: JSON.stringify(jgState), selectedPath: jgSelection || "" },
        "*"
      );
    } catch (_) {}
  }, 120);
}
function renderJgFocus() {
  if (!jgFocusMount || !jgState) return;
  clampJgSelection();
  jgFocusMount.innerHTML = "";
  if (jgSelectionHint) {
    jgSelectionHint.textContent = "当前编辑 · " + (jgSelection || "section");
  }
  const p = jgSelection || "section";
  const addFs = (legend, node) => {
    const fs = document.createElement("fieldset");
    const lg = document.createElement("legend");
    lg.textContent = legend;
    fs.appendChild(lg);
    fs.appendChild(node);
    jgFocusMount.appendChild(fs);
  };
  if (p === "section") {
    const d = document.createElement("div");
    const t = document.createElement("label");
    t.textContent = "主标题";
    const ti = document.createElement("input");
    ti.type = "text";
    ti.spellcheck = false;
    ti.autocomplete = "off";
    ti.value = jgState.section.title;
    ti.addEventListener("input", () => {
      jgState.section.title = ti.value;
      scheduleJoinGuidePreview();
    });
    t.appendChild(ti);
    const s = document.createElement("label");
    s.textContent = "副标题";
    const ta = document.createElement("textarea");
    ta.rows = 3;
    ta.spellcheck = false;
    ta.value = jgState.section.subtitle;
    ta.addEventListener("input", () => {
      jgState.section.subtitle = ta.value;
      scheduleJoinGuidePreview();
    });
    s.appendChild(ta);
    d.appendChild(t);
    d.appendChild(s);
    addFs("板块标题", d);
    return;
  }
  if (p === "serverInfo.title") {
    const t = document.createElement("label");
    t.textContent = "服务器信息 · 卡片标题";
    const ti = document.createElement("input");
    ti.type = "text";
    ti.spellcheck = false;
    ti.autocomplete = "off";
    ti.value = jgState.serverInfo.title;
    ti.addEventListener("input", () => {
      jgState.serverInfo.title = ti.value;
      scheduleJoinGuidePreview();
    });
    t.appendChild(ti);
    addFs("服务器信息", t);
    return;
  }
  {
    const m = p.match(/^serverInfo\.rows\.(\d+)$/);
    if (m) {
      const i = Number(m[1]);
      const row = jgState.serverInfo.rows[i];
      if (!row) {
        jgSelection = "serverInfo.title";
        renderJgFocus();
        return;
      }
      const d = document.createElement("div");
      const t1 = document.createElement("label");
      t1.textContent = "dt（标签）";
      const i1 = document.createElement("input");
      i1.type = "text";
      i1.value = row.dt;
      i1.addEventListener("input", () => {
        jgState.serverInfo.rows[i].dt = i1.value;
        scheduleJoinGuidePreview();
      });
      t1.appendChild(i1);
      const t2 = document.createElement("label");
      t2.textContent = "dd（内容）";
      const i2 = document.createElement("input");
      i2.type = "text";
      i2.value = row.dd;
      i2.addEventListener("input", () => {
        jgState.serverInfo.rows[i].dd = i2.value;
        scheduleJoinGuidePreview();
      });
      t2.appendChild(i2);
      const t3 = document.createElement("label");
      const c = document.createElement("input");
      c.type = "checkbox";
      c.checked = !!row.code;
      c.addEventListener("change", () => {
        jgState.serverInfo.rows[i].code = c.checked;
        scheduleJoinGuidePreview();
      });
      t3.appendChild(c);
      t3.appendChild(document.createTextNode(" dd 使用等宽 code 样式"));
      const del = document.createElement("button");
      del.type = "button";
      del.className = "outline secondary";
      del.textContent = "删除本行";
      del.addEventListener("click", () => {
        jgState.serverInfo.rows.splice(i, 1);
        jgSelection = "serverInfo.title";
        renderJgFocus();
        scheduleJoinGuidePreview();
      });
      d.appendChild(t1);
      d.appendChild(t2);
      d.appendChild(t3);
      d.appendChild(del);
      addFs("服务器信息 · 第 " + (i + 1) + " 行", d);
      return;
    }
  }
  if (p === "requirements.title") {
    const t = document.createElement("label");
    t.textContent = "系统要求 · 卡片标题";
    const ti = document.createElement("input");
    ti.type = "text";
    ti.value = jgState.requirements.title;
    ti.addEventListener("input", () => {
      jgState.requirements.title = ti.value;
      scheduleJoinGuidePreview();
    });
    t.appendChild(ti);
    addFs("系统要求", t);
    return;
  }
  {
    const m = p.match(/^requirements\.rows\.(\d+)$/);
    if (m) {
      const i = Number(m[1]);
      const row = jgState.requirements.rows[i];
      if (!row) {
        jgSelection = "requirements.title";
        renderJgFocus();
        return;
      }
      const d = document.createElement("div");
      const t1 = document.createElement("label");
      t1.textContent = "dt（标签）";
      const i1 = document.createElement("input");
      i1.type = "text";
      i1.value = row.dt;
      i1.addEventListener("input", () => {
        jgState.requirements.rows[i].dt = i1.value;
        scheduleJoinGuidePreview();
      });
      t1.appendChild(i1);
      const t2 = document.createElement("label");
      t2.textContent = "dd（内容）";
      const i2 = document.createElement("input");
      i2.type = "text";
      i2.value = row.dd;
      i2.addEventListener("input", () => {
        jgState.requirements.rows[i].dd = i2.value;
        scheduleJoinGuidePreview();
      });
      t2.appendChild(i2);
      const t3 = document.createElement("label");
      const c = document.createElement("input");
      c.type = "checkbox";
      c.checked = !!row.code;
      c.addEventListener("change", () => {
        jgState.requirements.rows[i].code = c.checked;
        scheduleJoinGuidePreview();
      });
      t3.appendChild(c);
      t3.appendChild(document.createTextNode(" dd 使用等宽 code 样式"));
      const del = document.createElement("button");
      del.type = "button";
      del.className = "outline secondary";
      del.textContent = "删除本行";
      del.addEventListener("click", () => {
        jgState.requirements.rows.splice(i, 1);
        jgSelection = "requirements.title";
        renderJgFocus();
        scheduleJoinGuidePreview();
      });
      d.appendChild(t1);
      d.appendChild(t2);
      d.appendChild(t3);
      d.appendChild(del);
      addFs("系统要求 · 第 " + (i + 1) + " 行", d);
      return;
    }
  }
  if (p === "stepsCard.title") {
    const t = document.createElement("label");
    t.textContent = "加入步骤 · 卡片标题";
    const ti = document.createElement("input");
    ti.type = "text";
    ti.value = jgState.stepsCard.title;
    ti.addEventListener("input", () => {
      jgState.stepsCard.title = ti.value;
      scheduleJoinGuidePreview();
    });
    t.appendChild(ti);
    addFs("加入步骤", t);
    return;
  }
  {
    const m = p.match(/^stepsCard\.steps\.(\d+)$/);
    if (m) {
      const i = Number(m[1]);
      const st = jgState.stepsCard.steps[i];
      if (!st) {
        jgSelection = "stepsCard.title";
        renderJgFocus();
        return;
      }
      const d = document.createElement("div");
      const t1 = document.createElement("label");
      t1.textContent = "步骤标题";
      const i1 = document.createElement("input");
      i1.type = "text";
      i1.value = st.title;
      i1.addEventListener("input", () => {
        jgState.stepsCard.steps[i].title = i1.value;
        scheduleJoinGuidePreview();
      });
      t1.appendChild(i1);
      const t2 = document.createElement("label");
      t2.textContent = "正文";
      const ta = document.createElement("textarea");
      ta.rows = 4;
      ta.spellcheck = false;
      ta.value = st.body;
      ta.addEventListener("input", () => {
        jgState.stepsCard.steps[i].body = ta.value;
        scheduleJoinGuidePreview();
      });
      t2.appendChild(ta);
      const del = document.createElement("button");
      del.type = "button";
      del.className = "outline secondary";
      del.textContent = "删除本步骤";
      del.addEventListener("click", () => {
        jgState.stepsCard.steps.splice(i, 1);
        jgSelection = "stepsCard.title";
        renderJgFocus();
        scheduleJoinGuidePreview();
      });
      d.appendChild(t1);
      d.appendChild(t2);
      d.appendChild(del);
      addFs("第 " + (i + 1) + " 步", d);
      return;
    }
  }
  if (p === "stepsCard.cta") {
    const d = document.createElement("div");
    const f = (lab, k) => {
      const lb = document.createElement("label");
      lb.textContent = lab;
      const inp = document.createElement("input");
      inp.type = "text";
      inp.spellcheck = false;
      inp.autocomplete = "off";
      inp.value = jgState.stepsCard.cta[k] != null ? String(jgState.stepsCard.cta[k]) : "";
      inp.addEventListener("input", () => {
        jgState.stepsCard.cta[k] = inp.value;
        scheduleJoinGuidePreview();
      });
      lb.appendChild(inp);
      d.appendChild(lb);
    };
    f("QQ 群按钮文案", "qqLabel");
    f("QQ 群链接", "qqUrl");
    f("复制地址按钮", "copyLabel");
    f("复制用服务器地址（正文中同字符串会加 code）", "serverIp");
    addFs("底部操作区", d);
    return;
  }
  jgSelection = "section";
  renderJgFocus();
}
async function loadJoinGuideFromServer() {
  if (!jgFocusMount) return;
  const r = await fetch("/api/admin/join-guide", { credentials: "include", cache: "no-store" });
  if (r.status === 401) {
    showLoginOnly();
    return;
  }
  if (!r.ok) {
    if (jgSaveMsg) {
      jgSaveMsg.textContent = "无法加载 join-guide.json";
      jgSaveMsg.className = "admin-msg is-bad";
    }
    return;
  }
  const data = await r.json().catch(() => ({}));
  const raw = typeof data.content === "string" ? data.content : "";
  const parsed = parseJoinGuideJsonSafe(raw);
  if (!parsed || typeof parsed !== "object") {
    if (jgSaveMsg) {
      jgSaveMsg.textContent = "服务端 JSON 无效，已用空白";
      jgSaveMsg.className = "admin-msg is-bad";
    }
    jgState = normalizeJoinGuideData(null);
  } else {
    if (jgSaveMsg) {
      jgSaveMsg.textContent = "";
      jgSaveMsg.className = "admin-msg";
    }
    jgState = normalizeJoinGuideData(parsed);
  }
  jgSelection = "section";
  renderJgFocus();
  scheduleJoinGuidePreview();
}
let jgSaveInFlight = false;
if (jgSaveBtn) {
  jgSaveBtn.addEventListener("click", async () => {
    if (jgSaveInFlight) return;
    jgSaveInFlight = true;
    if (jgSaveMsg) {
      jgSaveMsg.textContent = "保存中…";
      jgSaveMsg.className = "admin-msg";
    }
    jgSaveBtn.disabled = true;
    try {
      const r = await fetch("/api/admin/join-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ content: joinGuideJsonPretty() }),
      });
      if (r.status === 401) {
        showLoginOnly();
        return;
      }
      if (!r.ok) {
        let msg = "保存失败";
        try {
          const j = await r.json();
          if (j && j.error) msg = j.error;
        } catch {}
        if (jgSaveMsg) {
          jgSaveMsg.textContent = msg;
          jgSaveMsg.className = "admin-msg is-bad";
        }
        return;
      }
      if (jgSaveMsg) {
        jgSaveMsg.textContent = "已保存";
        jgSaveMsg.className = "admin-msg is-ok";
      }
    } catch (e) {
      if (jgSaveMsg) {
        jgSaveMsg.textContent = "保存失败：" + String((e && e.message) || e);
        jgSaveMsg.className = "admin-msg is-bad";
      }
    } finally {
      jgSaveInFlight = false;
      jgSaveBtn.disabled = false;
    }
  });
}
if (jgReloadBtn) {
  jgReloadBtn.addEventListener("click", () => void loadJoinGuideFromServer());
}
if (jgAddServerRow) {
  jgAddServerRow.addEventListener("click", () => {
    if (!jgState) return;
    jgState.serverInfo.rows.push(emptyJgKvRow());
    jgSelection = "serverInfo.rows." + (jgState.serverInfo.rows.length - 1);
    renderJgFocus();
    scheduleJoinGuidePreview();
  });
}
if (jgAddReqRow) {
  jgAddReqRow.addEventListener("click", () => {
    if (!jgState) return;
    jgState.requirements.rows.push(emptyJgKvRow());
    jgSelection = "requirements.rows." + (jgState.requirements.rows.length - 1);
    renderJgFocus();
    scheduleJoinGuidePreview();
  });
}
if (jgAddStep) {
  jgAddStep.addEventListener("click", () => {
    if (!jgState) return;
    jgState.stepsCard.steps.push(emptyJgStep());
    jgSelection = "stepsCard.steps." + (jgState.stepsCard.steps.length - 1);
    renderJgFocus();
    scheduleJoinGuidePreview();
  });
}
if (jgPreview) {
  jgPreview.addEventListener("load", () => {
    scheduleJoinGuidePreview();
  });
}
window.addEventListener("message", (e) => {
  if (!e.data || e.data.type !== "joinGuideSelect") return;
  jgSelection = e.data.path || "section";
  renderJgFocus();
  scheduleJoinGuidePreview();
});

function orderTeamValue(m) {
  const o = m && m.order;
  if (typeof o === "number" && Number.isFinite(o)) return o;
  return 1_000_000;
}
function sortTeamEntries(entries) {
  const arr = entries.slice();
  arr.sort((a, b) => {
    const d = orderTeamValue(a) - orderTeamValue(b);
    if (d !== 0) return d;
    return String(a.id || "").localeCompare(String(b.id || ""), "en");
  });
  return arr;
}

let staffBaseline = [];
let staffPreviewT = null;
let staffPreviewBust = String(Date.now());
let staffSaveInFlight = false;
let staffMembersListCache = [];
let staffSelectedId = "";
const staffExpandedIds = new Set();

function staffNormalizeHex6(s) {
  let c = String(s || "").trim();
  if (!c) return null;
  if (!c.startsWith("#")) c = "#" + c;
  const hex = c.slice(1);
  if (!/^[0-9a-fA-F]+$/.test(hex)) return null;
  if (hex.length === 3) {
    return ("#" + hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]).toUpperCase();
  }
  if (hex.length === 6) return ("#" + hex).toUpperCase();
  return null;
}

function staffSyncPickFromText() {
  if (!staffColor || !staffColorPick) return;
  const h = staffNormalizeHex6(staffColor.value);
  if (h) staffColorPick.value = h.toLowerCase();
}

function staffSyncTextFromPick() {
  if (!staffColor || !staffColorPick) return;
  staffColor.value = staffColorPick.value.toUpperCase();
}

function staffReadFormObject() {
  const o = {};
  const ordVal = staffOrder ? staffOrder.value.trim() : "";
  if (ordVal !== "") {
    const n = Number(ordVal);
    if (Number.isFinite(n)) o.order = n;
  }
  if (staffName) {
    const nm = staffName.value.trim();
    if (nm) o.name = nm;
  }
  if (staffTitle) {
    const tt = staffTitle.value.trim();
    if (tt) o.title = tt;
  }
  if (staffBio) {
    const bio = staffBio.value.replace(/\r\n/g, "\n");
    if (bio.trim()) o.bio = bio;
  }
  if (staffColor) {
    const col = staffNormalizeHex6(staffColor.value) || staffColor.value.trim();
    if (col) o.color = col;
  }
  o.headFile = "head.png";
  o.portraitFile = "portrait.png";
  return o;
}

function staffMetaJsonForSave() {
  return JSON.stringify(staffReadFormObject(), null, 2) + "\n";
}

function applyStaffFormFromMetaText(raw) {
  let m = {};
  try {
    m = JSON.parse(String(raw || "").replace(/^\uFEFF/, ""));
  } catch {
    m = {};
  }
  if (!m || typeof m !== "object") m = {};
  if (staffOrder) {
    staffOrder.value = typeof m.order === "number" && Number.isFinite(m.order) ? String(m.order) : "";
  }
  if (staffName) staffName.value = m.name != null ? String(m.name) : "";
  if (staffTitle) staffTitle.value = m.title != null ? String(m.title) : "";
  if (staffBio) staffBio.value = m.bio != null ? String(m.bio) : "";
  if (staffColor) {
    const c = m.color != null ? String(m.color).trim() : "#EA323C";
    staffColor.value = staffNormalizeHex6(c) || c;
  }
  staffSyncPickFromText();
}

function staffUpdateEditVisibility() {
  const ok = !!staffSelectedId;
  if (staffNoSelection) staffNoSelection.hidden = ok;
  if (staffEditFields) staffEditFields.hidden = !ok;
  if (staffSaveBtn) staffSaveBtn.disabled = !ok;
  const dis = !ok;
  [staffOrder, staffName, staffTitle, staffBio, staffColor, staffColorPick].forEach((el) => {
    if (el) el.disabled = dis;
  });
}

function clearStaffForm() {
  applyStaffFormFromMetaText("{}");
  if (staffFiles) staffFiles.innerHTML = "";
}

function buildStaffPreviewRows() {
  const sel = staffSelectedId;
  if (!sel) return sortTeamEntries(staffBaseline.slice());
  const patch = staffReadFormObject();
  const merged = staffBaseline.map((m) => {
    if (m.id !== sel) return m;
    const next = { ...m, ...patch, id: sel, headFile: "head.png", portraitFile: "portrait.png" };
    delete next._headNote;
    delete next._portraitNote;
    return next;
  });
  return sortTeamEntries(merged);
}

function renderStaffSimplePreview() {
  const sel = staffSelectedId;
  const rows = buildStaffPreviewRows();
  const m = sel ? rows.find((x) => x.id === sel) : null;
  const v = staffPreviewBust;
  if (staffPvName) staffPvName.textContent = m && m.name != null ? String(m.name) : "—";
  if (staffPvTitle) {
    const t = m && m.title != null ? String(m.title).trim() : "";
    staffPvTitle.textContent = t || "—";
  }
  const col =
    m && m.color != null && String(m.color).trim()
      ? String(m.color).trim()
      : "#EA323C";
  if (staffPreviewPanel) staffPreviewPanel.style.setProperty("--staff-accent", col);
  if (staffPvColorSwatch) staffPvColorSwatch.style.background = col;
  if (staffPvColorHex) staffPvColorHex.textContent = col;
  if (staffPvHead) {
    staffPvHead.src = sel
      ? "/staff/" + encodeURIComponent(sel) + "/head.png?v=" + encodeURIComponent(v)
      : "/staff/_template/head.png?v=" + encodeURIComponent(v);
  }
  if (staffPvPortrait) {
    staffPvPortrait.src = sel
      ? "/staff/" + encodeURIComponent(sel) + "/portrait.png?v=" + encodeURIComponent(v)
      : "/staff/_template/portrait.png?v=" + encodeURIComponent(v);
  }
  if (staffPvBio) staffPvBio.textContent = m && m.bio != null ? String(m.bio) : "";
}

function scheduleStaffPreview() {
  if (!panelStaff || panelStaff.hidden) return;
  if (staffPreviewT) clearTimeout(staffPreviewT);
  staffPreviewT = setTimeout(() => {
    staffPreviewT = null;
    renderStaffSimplePreview();
  }, 120);
}

async function refreshStaffBaseline() {
  const r = await fetch("/api/team", { credentials: "include", cache: "no-store" });
  if (!r.ok) return;
  const rows = await r.json().catch(() => []);
  staffBaseline = Array.isArray(rows) ? rows : [];
  scheduleStaffPreview();
}

async function fillStaffMemberExpandPanel(panel, id) {
  if (!panel || !id) return;
  panel.innerHTML = "<p class=\"admin-muted\">加载中…</p>";
  try {
    const r = await fetch("/api/admin/staff/" + encodeURIComponent(id), {
      credentials: "include",
      cache: "no-store",
    });
    if (!r.ok) {
      panel.innerHTML = "<p class=\"admin-msg is-bad\">加载失败</p>";
      return;
    }
    const data = await r.json().catch(() => ({}));
    const files = Array.isArray(data.files) ? data.files : [];
    panel.innerHTML = "";
    const hint = document.createElement("p");
    hint.className = "admin-muted admin-staff-mem__hint";
    hint.textContent = "目录内图片（仅展示）。头像请在下方固定入口上传 head.png / portrait.png。";
    panel.appendChild(hint);
    if (!files.length) {
      const empty = document.createElement("p");
      empty.className = "admin-muted";
      empty.textContent = "（暂无图片文件）";
      panel.appendChild(empty);
      return;
    }
    const grid = document.createElement("div");
    grid.className = "admin-staff-mem__thumbs";
    const v = staffPreviewBust;
    for (const name of files) {
      const fig = document.createElement("figure");
      fig.className = "admin-staff-mem__thumb";
      const im = document.createElement("img");
      im.src = "/staff/" + encodeURIComponent(id) + "/" + encodeURIComponent(name) + "?v=" + encodeURIComponent(v);
      im.alt = "";
      const cap = document.createElement("figcaption");
      cap.textContent = name;
      fig.appendChild(im);
      fig.appendChild(cap);
      grid.appendChild(fig);
    }
    panel.appendChild(grid);
  } catch {
    panel.innerHTML = "<p class=\"admin-msg is-bad\">加载异常</p>";
  }
}

function renderStaffMembersList() {
  if (!staffMembersMount) return;
  staffMembersMount.innerHTML = "";
  for (const row of staffMembersListCache) {
    const wrap = document.createElement("div");
    wrap.className = "admin-staff-mem" + (row.id === staffSelectedId ? " is-selected" : "");

    const panel = document.createElement("div");
    panel.className = "admin-staff-mem__panel";
    panel.hidden = !staffExpandedIds.has(row.id);

    const bar = document.createElement("div");
    bar.className = "admin-staff-mem__bar";

    const main = document.createElement("button");
    main.type = "button";
    main.className = "admin-staff-mem__main";
    const orderEl = document.createElement("span");
    orderEl.className = "admin-staff-mem__order";
    orderEl.textContent = "order " + row.order;
    const nameEl = document.createElement("span");
    nameEl.className = "admin-staff-mem__name";
    nameEl.textContent = row.displayName || row.id;
    const idEl = document.createElement("code");
    idEl.className = "admin-staff-mem__id";
    idEl.textContent = row.id;
    main.appendChild(orderEl);
    main.appendChild(nameEl);
    main.appendChild(idEl);
    main.addEventListener("click", () => staffSelectMember(row.id));

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "outline secondary admin-staff-mem__toggle";
    toggle.textContent = staffExpandedIds.has(row.id) ? "收起" : "展开";
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (staffExpandedIds.has(row.id)) {
        staffExpandedIds.delete(row.id);
        panel.hidden = true;
        toggle.textContent = "展开";
      } else {
        staffExpandedIds.add(row.id);
        panel.hidden = false;
        toggle.textContent = "收起";
        void fillStaffMemberExpandPanel(panel, row.id);
      }
    });

    const del = document.createElement("button");
    del.type = "button";
    del.className = "outline secondary admin-staff-mem__del";
    del.textContent = "删除";
    del.disabled = row.id === "_template";
    del.addEventListener("click", (e) => {
      e.stopPropagation();
      void deleteStaffMember(row.id);
    });

    bar.appendChild(main);
    bar.appendChild(toggle);
    bar.appendChild(del);
    wrap.appendChild(bar);
    wrap.appendChild(panel);
    staffMembersMount.appendChild(wrap);

    if (staffExpandedIds.has(row.id)) void fillStaffMemberExpandPanel(panel, row.id);
  }
}

function staffSelectMember(id) {
  if (!id) return;
  if (staffSelectedId === id) return;
  staffSelectedId = id;
  renderStaffMembersList();
  staffUpdateEditVisibility();
  void loadStaffMemberDetail(id);
}

async function deleteStaffMember(id) {
  if (!id || id === "_template") return;
  if (!confirm("删除成员目录「" + id + "」？将删除该目录下全部文件，且不可恢复。")) return;
  const r = await fetch("/api/admin/staff/" + encodeURIComponent(id) + "/delete", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401) {
    showLoginOnly();
    return;
  }
  if (!r.ok) {
    if (staffSaveMsg) {
      staffSaveMsg.textContent = String((j && j.error) || "删除失败");
      staffSaveMsg.className = "admin-msg is-bad";
    }
    return;
  }
  staffExpandedIds.delete(id);
  if (staffSelectedId === id) staffSelectedId = "";
  if (staffSaveMsg) {
    staffSaveMsg.textContent = "已删除";
    staffSaveMsg.className = "admin-msg is-ok";
  }
  await loadStaffPanelFromServer();
}

async function loadStaffPanelFromServer() {
  if (!staffMembersMount) return;
  const prev = staffSelectedId;
  const r = await fetch("/api/admin/staff/list", { credentials: "include", cache: "no-store" });
  if (r.status === 401) {
    showLoginOnly();
    return;
  }
  if (!r.ok) {
    if (staffSaveMsg) {
      staffSaveMsg.textContent = "无法加载成员列表";
      staffSaveMsg.className = "admin-msg is-bad";
    }
    return;
  }
  const data = await r.json().catch(() => ({}));
  staffMembersListCache = Array.isArray(data.members) ? data.members : [];
  let next = prev && staffMembersListCache.some((m) => m.id === prev) ? prev : "";
  if (!next && staffMembersListCache.length) next = staffMembersListCache[0].id;
  staffSelectedId = next;
  renderStaffMembersList();
  staffUpdateEditVisibility();
  await refreshStaffBaseline();
  if (next) {
    await loadStaffMemberDetail(next);
  } else {
    clearStaffForm();
    staffSelectedId = "";
    if (staffSaveMsg) {
      staffSaveMsg.textContent = "暂无成员目录";
      staffSaveMsg.className = "admin-msg is-bad";
    }
  }
  renderStaffSimplePreview();
}

async function loadStaffMemberDetail(id) {
  if (!id) return;
  const r = await fetch("/api/admin/staff/" + encodeURIComponent(id), {
    credentials: "include",
    cache: "no-store",
  });
  if (r.status === 401) {
    showLoginOnly();
    return;
  }
  if (!r.ok) {
    if (staffSaveMsg) {
      staffSaveMsg.textContent = "无法加载成员数据";
      staffSaveMsg.className = "admin-msg is-bad";
    }
    return;
  }
  const data = await r.json().catch(() => ({}));
  applyStaffFormFromMetaText(typeof data.metaText === "string" ? data.metaText : "");
  if (staffSaveMsg) {
    staffSaveMsg.textContent = "";
    staffSaveMsg.className = "admin-msg";
  }
  renderStaffFiles(Array.isArray(data.files) ? data.files : [], id);
  await refreshStaffBaseline();
  scheduleStaffPreview();
}

function renderStaffFiles(files, memberId) {
  if (!staffFiles) return;
  staffFiles.innerHTML = "";
  const cap = document.createElement("p");
  cap.className = "admin-muted admin-staff-files-cap";
  cap.textContent = "当前目录图片（只读预览）";
  staffFiles.appendChild(cap);
  if (!files.length) {
    const p = document.createElement("p");
    p.className = "admin-muted";
    p.textContent = "暂无图片；可用上方按钮上传 head.png / portrait.png";
    staffFiles.appendChild(p);
    return;
  }
  const v = staffPreviewBust;
  for (const name of files) {
    const row = document.createElement("div");
    row.className = "admin-staff-file-row";
    const img = document.createElement("img");
    img.src = "/staff/" + encodeURIComponent(memberId) + "/" + encodeURIComponent(name) + "?v=" + encodeURIComponent(v);
    img.alt = "";
    const code = document.createElement("code");
    code.textContent = name;
    row.appendChild(img);
    row.appendChild(code);
    staffFiles.appendChild(row);
  }
}

async function uploadStaffFixedFile(file, fixedBaseName) {
  const id = staffSelectedId;
  if (!id || !file) return;
  if (staffSaveMsg) {
    staffSaveMsg.textContent = "上传中…";
    staffSaveMsg.className = "admin-msg";
  }
  try {
    const ct = file.type && /^image\//i.test(file.type) ? file.type : "application/octet-stream";
    const r = await fetch("/api/admin/staff/" + encodeURIComponent(id) + "/upload-bin", {
      method: "POST",
      headers: {
        "Content-Type": ct,
        "X-Upload-Name": encodeURIComponent(fixedBaseName),
      },
      credentials: "include",
      cache: "no-store",
      body: file,
    });
    const raw = await r.text();
    let j = {};
    try {
      j = raw ? JSON.parse(raw) : {};
    } catch {
      j = { error: raw.trim().slice(0, 240) || "上传失败" };
    }
    if (r.status === 401) {
      showLoginOnly();
      return;
    }
    if (!r.ok) {
      if (staffSaveMsg) {
        staffSaveMsg.textContent = String((j && j.error) || "上传失败");
        staffSaveMsg.className = "admin-msg is-bad";
      }
      return;
    }
    staffPreviewBust = String(Date.now());
    if (staffSaveMsg) {
      staffSaveMsg.textContent = "已更新 " + fixedBaseName;
      staffSaveMsg.className = "admin-msg is-ok";
    }
    await loadStaffMemberDetail(id);
    renderStaffMembersList();
  } catch (e) {
    if (staffSaveMsg) {
      staffSaveMsg.textContent = "上传异常：" + String((e && e.message) || e);
      staffSaveMsg.className = "admin-msg is-bad";
    }
  }
}

if (staffReloadListBtn) {
  staffReloadListBtn.addEventListener("click", () => void loadStaffPanelFromServer());
}
if (staffAddMemberBtn) {
  staffAddMemberBtn.addEventListener("click", async () => {
    const raw = window.prompt("新成员目录名（字母、数字、下划线、短横线；勿用 _ 开头）", "");
    if (raw == null) return;
    const nid = String(raw).trim();
    if (!nid) return;
    const r = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify({ id: nid }),
    });
    const j = await r.json().catch(() => ({}));
    if (r.status === 401) {
      showLoginOnly();
      return;
    }
    if (!r.ok) {
      if (staffSaveMsg) {
        staffSaveMsg.textContent = String((j && j.error) || "添加失败");
        staffSaveMsg.className = "admin-msg is-bad";
      }
      return;
    }
    const newId = (j && j.id) || nid;
    staffExpandedIds.add(newId);
    staffSelectedId = newId;
    if (staffSaveMsg) {
      staffSaveMsg.textContent = "已创建 " + newId;
      staffSaveMsg.className = "admin-msg is-ok";
    }
    await loadStaffPanelFromServer();
  });
}
const staffFormEls = [staffOrder, staffName, staffTitle, staffBio, staffColor, staffColorPick];
for (const el of staffFormEls) {
  if (el) {
    el.addEventListener("input", () => {
      if (el === staffColor) staffSyncPickFromText();
      if (el === staffColorPick) staffSyncTextFromPick();
      scheduleStaffPreview();
    });
    el.addEventListener("change", () => {
      if (el === staffColorPick) staffSyncTextFromPick();
      scheduleStaffPreview();
    });
  }
}
if (staffSaveBtn) {
  staffSaveBtn.addEventListener("click", async () => {
    if (staffSaveInFlight) return;
    const id = staffSelectedId;
    if (!id) return;
    staffSaveInFlight = true;
    if (staffSaveMsg) {
      staffSaveMsg.textContent = "保存中…";
      staffSaveMsg.className = "admin-msg";
    }
    staffSaveBtn.disabled = true;
    try {
      const r = await fetch("/api/admin/staff/" + encodeURIComponent(id) + "/meta", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ content: staffMetaJsonForSave() }),
      });
      if (r.status === 401) {
        showLoginOnly();
        return;
      }
      if (!r.ok) {
        let msg = "保存失败";
        try {
          const j = await r.json();
          if (j && j.error) msg = j.error;
        } catch {}
        if (staffSaveMsg) {
          staffSaveMsg.textContent = msg;
          staffSaveMsg.className = "admin-msg is-bad";
        }
        return;
      }
      staffPreviewBust = String(Date.now());
      if (staffSaveMsg) {
        staffSaveMsg.textContent = "已保存";
        staffSaveMsg.className = "admin-msg is-ok";
      }
      try {
        const lr = await fetch("/api/admin/staff/list", { credentials: "include", cache: "no-store" });
        if (lr.ok) {
          const ld = await lr.json().catch(() => ({}));
          staffMembersListCache = Array.isArray(ld.members) ? ld.members : [];
          renderStaffMembersList();
        }
      } catch (_) {}
      await refreshStaffBaseline();
      scheduleStaffPreview();
    } catch (e) {
      if (staffSaveMsg) {
        staffSaveMsg.textContent = "保存失败：" + String((e && e.message) || e);
        staffSaveMsg.className = "admin-msg is-bad";
      }
    } finally {
      staffSaveInFlight = false;
      staffUpdateEditVisibility();
    }
  });
}
if (staffUploadHead) {
  staffUploadHead.addEventListener("change", () => {
    const f = staffUploadHead.files && staffUploadHead.files[0];
    staffUploadHead.value = "";
    void uploadStaffFixedFile(f, "head.png");
  });
}
if (staffUploadPortrait) {
  staffUploadPortrait.addEventListener("change", () => {
    const f = staffUploadPortrait.files && staffUploadPortrait.files[0];
    staffUploadPortrait.value = "";
    void uploadStaffFixedFile(f, "portrait.png");
  });
}
if (fePreview) {
  fePreview.addEventListener("load", () => postFeaturesPreview());
}

function newEventId() {
  try {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    let s = "";
    for (const b of bytes) s += b.toString(16).padStart(2, "0");
    return "evt-" + s;
  } catch {
    return "evt-" + String(Date.now()) + "-" + String(Math.random()).slice(2, 10);
  }
}

function parseEventsJsonSafe(text) {
  try {
    return JSON.parse(String(text || "").replace(/^\uFEFF/, ""));
  } catch {
    return null;
  }
}

function emptyEventItem() {
  return { id: newEventId(), date: "", title: "", body: "", tier: "minor" };
}

function normalizeEventsData(raw) {
  const o = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const section = o.section && typeof o.section === "object" ? o.section : {};
  const title = section.title != null ? String(section.title) : "事件";
  const subtitle = section.subtitle != null ? String(section.subtitle) : "";
  const items = Array.isArray(o.items)
    ? o.items.map((it) => {
        const x = it && typeof it === "object" ? it : {};
        const tier = String(x.tier || "minor").toLowerCase() === "major" ? "major" : "minor";
        let id = x.id != null ? String(x.id).trim() : "";
        if (!id) id = newEventId();
        return {
          id,
          date: x.date != null ? String(x.date) : "",
          title: x.title != null ? String(x.title) : "",
          body: x.body != null ? String(x.body) : "",
          tier,
        };
      })
    : [];
  return { section: { title, subtitle }, items };
}

function parseEventDateMsAdmin(s) {
  const raw = String(s || "").trim();
  if (!raw) return 0;
  const t = Date.parse(raw + (raw.length <= 10 ? "T12:00:00" : ""));
  return Number.isNaN(t) ? 0 : t;
}

function eventDigits(s, max) {
  return String(s || "").replace(/\D/g, "").slice(0, max);
}

function parseEventDateForAdmin(s) {
  const raw = String(s || "").trim();
  if (!raw) return { y: "", m: "", d: "", hh: "", mm: "", ss: "" };
  const m = raw.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/
  );
  if (m) {
    return {
      y: m[1].slice(0, 4),
      m: m[2].padStart(2, "0"),
      d: m[3].padStart(2, "0"),
      hh: m[4] != null ? m[4].padStart(2, "0") : "",
      mm: m[5] != null ? m[5].padStart(2, "0") : "",
      ss: m[6] != null ? m[6].padStart(2, "0") : "",
    };
  }
  const t = Date.parse(raw.length <= 10 ? raw + "T12:00:00" : raw);
  if (Number.isNaN(t)) return { y: "", m: "", d: "", hh: "", mm: "", ss: "" };
  const dt = new Date(t);
  return {
    y: String(dt.getFullYear()),
    m: String(dt.getMonth() + 1).padStart(2, "0"),
    d: String(dt.getDate()).padStart(2, "0"),
    hh: String(dt.getHours()).padStart(2, "0"),
    mm: String(dt.getMinutes()).padStart(2, "0"),
    ss: String(dt.getSeconds()).padStart(2, "0"),
  };
}

function composeEventDateString(parts) {
  const y = eventDigits(parts.y, 4);
  const mo = eventDigits(parts.m, 2);
  const da = eventDigits(parts.d, 2);
  if (y.length !== 4 || !mo || !da) return "";
  const mo2 = mo.padStart(2, "0");
  const da2 = da.padStart(2, "0");
  const base = y + "-" + mo2 + "-" + da2;
  if (Number.isNaN(Date.parse(base + "T12:00:00"))) return "";
  const hh = eventDigits(parts.hh, 2);
  const mm = eventDigits(parts.mm, 2);
  const ss = eventDigits(parts.ss, 2);
  if (!hh && !mm && !ss) return base;
  const h2 = (hh + "0").slice(0, 2);
  const m2 = (mm + "0").slice(0, 2);
  const s2 = (ss + "0").slice(0, 2);
  return base + "T" + h2.padStart(2, "0") + ":" + m2.padStart(2, "0") + ":" + s2.padStart(2, "0");
}

function sortEventsItemsDesc(items) {
  const arr = items.slice();
  arr.sort((a, b) => {
    const d = parseEventDateMsAdmin(a.date) - parseEventDateMsAdmin(b.date);
    if (d !== 0) return -d;
    return String(b.title || "").localeCompare(String(a.title || ""), "zh");
  });
  return arr;
}

function adminEvDomId(id) {
  return "admin-ev-" + String(id || "").replace(/[^a-zA-Z0-9_-]/g, "_");
}

function evYmFromDateStr(date) {
  const v = date != null ? String(date).trim() : "";
  if (v.length >= 7) return v.slice(0, 7);
  return "_";
}

function evYearKeyFromYm(ym) {
  return ym === "_" ? "__" : ym.slice(0, 4);
}

function evMonthLabelZh(ym) {
  if (ym === "_") return "无日期";
  const m = parseInt(ym.slice(5, 7), 10);
  return (Number.isFinite(m) ? m : "?") + "月";
}

function getEventsDomRows() {
  const list = [];
  if (!evItemsMount) return list;
  evItemsMount.querySelectorAll(".admin-ev-item").forEach((det) => {
    const id = det.dataset.eventId;
    const dateEl = det.querySelector(".admin-ev-in-date");
    const titleEl = det.querySelector(".admin-ev-in-title");
    const date = dateEl && "value" in dateEl ? String(dateEl.value).trim() : "";
    const title = titleEl && "value" in titleEl ? String(titleEl.value).trim() : "（无标题）";
    const domId = det.id;
    if (!domId) return;
    const ym = evYmFromDateStr(date);
    const y = evYearKeyFromYm(ym);
    list.push({ det, id, date, title, domId, ym, y });
  });
  return list;
}

function rebuildEvNavSelects(prefs) {
  if (!evNavScope || !evNavMonth || !evNavItem || !evItemsMount || !evHeaderBlock) return;
  const rows = getEventsDomRows();
  const prevScope = evNavScope.value;
  const prevMonth = prefs && prefs.preferMonth != null ? prefs.preferMonth : evNavMonth.value;
  const prevItem = prefs && prefs.preferItem != null ? prefs.preferItem : evNavItem.value;

  const yearsSet = new Set();
  rows.forEach((r) => yearsSet.add(r.y));
  const years = Array.from(yearsSet).sort((a, b) => {
    if (a === "__") return 1;
    if (b === "__") return -1;
    return String(b).localeCompare(String(a), "en");
  });

  evNavScope.textContent = "";
  const oHead = document.createElement("option");
  oHead.value = "__header__";
  oHead.textContent = "页眉";
  evNavScope.appendChild(oHead);
  for (const y of years) {
    const o = document.createElement("option");
    o.value = "y:" + y;
    o.textContent = y === "__" ? "日期待定" : y + "年";
    evNavScope.appendChild(o);
  }
  if (prevScope && [...evNavScope.options].some((x) => x.value === prevScope)) {
    evNavScope.value = prevScope;
  } else {
    evNavScope.value = "__header__";
  }

  evNavMonth.textContent = "";
  evNavItem.textContent = "";
  const sc = evNavScope.value;
  if (sc === "__header__") {
    evNavMonth.hidden = true;
    evNavItem.hidden = true;
    applyEvNavPanel();
    return;
  }

  const yearKey = sc.slice(2);
  const monthsSet = new Set();
  rows.filter((r) => r.y === yearKey).forEach((r) => monthsSet.add(r.ym));
  const months = Array.from(monthsSet).sort((a, b) => {
    if (a === "_") return 1;
    if (b === "_") return -1;
    return String(b).localeCompare(String(a), "en");
  });
  for (const ym of months) {
    const o = document.createElement("option");
    o.value = "ym:" + ym;
    o.textContent = evMonthLabelZh(ym);
    evNavMonth.appendChild(o);
  }
  evNavMonth.hidden = months.length === 0;
  if (prevMonth && [...evNavMonth.options].some((x) => x.value === prevMonth)) {
    evNavMonth.value = prevMonth;
  } else if (evNavMonth.options.length) {
    evNavMonth.value = evNavMonth.options[0].value;
  }

  const mk = evNavMonth.value;
  if (!mk || !mk.startsWith("ym:")) {
    evNavItem.hidden = true;
    applyEvNavPanel();
    return;
  }
  const ymVal = mk.slice(3);
  const inMonth = rows.filter((r) => r.ym === ymVal);
  for (const r of inMonth) {
    const o = document.createElement("option");
    o.value = r.domId;
    o.textContent = (r.date || "—") + " · " + r.title;
    evNavItem.appendChild(o);
  }
  evNavItem.hidden = inMonth.length === 0;
  if (prevItem && [...evNavItem.options].some((x) => x.value === prevItem)) {
    evNavItem.value = prevItem;
  } else if (evNavItem.options.length) {
    evNavItem.value = evNavItem.options[0].value;
  }
  applyEvNavPanel();
}

function rebuildEvBrowseList() {
  if (!evBrowseMount || !evNavScope) return;
  evBrowseMount.textContent = "";
  const hdr = document.createElement("button");
  hdr.type = "button";
  hdr.className = "admin-ev-browse-row";
  hdr.textContent = "页眉";
  if (evNavScope.value === "__header__") hdr.classList.add("is-active");
  hdr.addEventListener("click", () => {
    evNavScope.value = "__header__";
    rebuildEvNavSelects();
  });
  evBrowseMount.appendChild(hdr);

  const rows = getEventsDomRows();
  const yearsSet = new Set();
  rows.forEach((r) => yearsSet.add(r.y));
  const years = Array.from(yearsSet).sort((a, b) => {
    if (a === "__") return 1;
    if (b === "__") return -1;
    return String(b).localeCompare(String(a), "en");
  });

  const itemActive =
    evNavScope.value !== "__header__" && evNavItem && !evNavItem.hidden ? evNavItem.value : "";

  for (const y of years) {
    const yl = document.createElement("div");
    yl.className = "admin-ev-browse-year";
    yl.textContent = y === "__" ? "日期待定" : y + "年";
    evBrowseMount.appendChild(yl);

    const inYear = rows.filter((r) => r.y === y);
    inYear.sort((a, b) => {
      const d = parseEventDateMsAdmin(a.date) - parseEventDateMsAdmin(b.date);
      if (d !== 0) return -d;
      return String(b.title || "").localeCompare(String(a.title || ""), "zh");
    });
    for (const r of inYear) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "admin-ev-browse-row";
      b.textContent = r.title || "（无标题）";
      if (itemActive && r.domId === itemActive) b.classList.add("is-active");
      b.addEventListener("click", () => setEvNavToEventDomId(r.domId));
      evBrowseMount.appendChild(b);
    }
  }
}

function applyEvNavPanel() {
  if (!evHeaderBlock || !evItemsMount || !evNavScope) return;
  if (evNavScope.value === "__header__") {
    evHeaderBlock.hidden = false;
    evItemsMount.hidden = true;
    rebuildEvBrowseList();
    return;
  }
  const itemId = evNavItem && !evNavItem.hidden && evNavItem.value;
  evHeaderBlock.hidden = true;
  evItemsMount.hidden = false;
  evItemsMount.querySelectorAll(".admin-ev-item").forEach((det) => {
    const show = !!itemId && det.id === itemId;
    det.hidden = !show;
  });
  rebuildEvBrowseList();
}

function setEvNavToEventDomId(domId) {
  if (!domId || !evNavScope) return;
  const rows = getEventsDomRows();
  const r = rows.find((x) => x.domId === domId);
  if (!r) return;
  evNavScope.value = "y:" + r.y;
  rebuildEvNavSelects({ preferMonth: "ym:" + r.ym, preferItem: domId });
}

function bindEvItemLiveSummary(wrap, dateHost, titleIn, tierSel) {
  const tierTag = wrap.querySelector(".admin-ev-item__tier-tag");
  function upd() {
    if (tierTag && tierSel && "value" in tierSel) {
      tierTag.textContent = tierSel.value === "major" ? "大" : "小";
    }
    const id = wrap.id;
    const rows = getEventsDomRows();
    const r = rows.find((x) => x.domId === id);
    if (r && evNavScope) {
      evNavScope.value = "y:" + r.y;
      rebuildEvNavSelects({ preferMonth: "ym:" + r.ym, preferItem: id });
    } else {
      rebuildEvNavSelects();
    }
  }
  if (dateHost) {
    dateHost.addEventListener("input", upd, true);
    dateHost.addEventListener("change", upd, true);
  }
  titleIn.addEventListener("input", upd);
  tierSel.addEventListener("change", upd);
  upd();
}

function appendEventEditor(item) {
  if (!evItemsMount) return;
  const d = item || emptyEventItem();
  const wrap = document.createElement("div");
  wrap.className = "admin-ev-item";
  wrap.dataset.eventId = d.id;
  wrap.id = adminEvDomId(d.id);

  const panel = document.createElement("div");
  panel.className = "admin-ev-item__fields";

  const headRow = document.createElement("div");
  headRow.className = "admin-ev-item__head";
  const tierTag = document.createElement("span");
  tierTag.className = "admin-ev-item__tier-tag";
  tierTag.setAttribute("aria-hidden", "true");
  tierTag.textContent = d.tier === "major" ? "大" : "小";
  const idSpan = document.createElement("span");
  idSpan.className = "admin-muted admin-ev-item__id-mini";
  idSpan.textContent = d.id;
  const rm = document.createElement("button");
  rm.type = "button";
  rm.className = "outline secondary admin-ev-item__rm";
  rm.textContent = "删除";
  rm.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const wasActive = !wrap.hidden;
    wrap.remove();
    if (wasActive && evNavScope) {
      evNavScope.value = "__header__";
    }
    rebuildEvNavSelects();
  });
  headRow.appendChild(tierTag);
  headRow.appendChild(idSpan);
  headRow.appendChild(rm);
  panel.appendChild(headRow);

  function addField(labelText, child) {
    const lb = document.createElement("label");
    lb.textContent = labelText;
    lb.appendChild(child);
    panel.appendChild(lb);
    return child;
  }

  const p0 = parseEventDateForAdmin(d.date);
  const dateRow = document.createElement("div");
  dateRow.className = "admin-ev-datetime";
  const mkPart = (cls, v, len, ph) => {
    const i = document.createElement("input");
    i.type = "text";
    i.className = cls;
    i.setAttribute("inputmode", "numeric");
    i.setAttribute("autocomplete", "off");
    i.setAttribute("spellcheck", "false");
    i.setAttribute("maxlength", String(len));
    i.setAttribute("size", String(len + 1));
    i.setAttribute("placeholder", ph);
    i.value = v;
    return i;
  };
  const yIn = mkPart("admin-ev-in-y", p0.y, 4, "年");
  const mIn = mkPart("admin-ev-in-m", p0.m, 2, "月");
  const dIn = mkPart("admin-ev-in-d", p0.d, 2, "日");
  const tLab = document.createElement("span");
  tLab.className = "admin-ev-datetime__time-lab";
  tLab.textContent = "时间(选) ";
  const hhIn = mkPart("admin-ev-in-hh", p0.hh, 2, "");
  const mmIn = mkPart("admin-ev-in-mm", p0.mm, 2, "");
  const ssIn = mkPart("admin-ev-in-ss", p0.ss, 2, "");
  yIn.setAttribute("aria-label", "年（四位数）");
  mIn.setAttribute("aria-label", "月");
  dIn.setAttribute("aria-label", "日");
  hhIn.setAttribute("aria-label", "时");
  mmIn.setAttribute("aria-label", "分");
  ssIn.setAttribute("aria-label", "秒");
  const dateHidden = document.createElement("input");
  dateHidden.type = "hidden";
  dateHidden.className = "admin-ev-in-date";
  function getParts() {
    return { y: yIn.value, m: mIn.value, d: dIn.value, hh: hhIn.value, mm: mmIn.value, ss: ssIn.value };
  }
  function sync() {
    dateHidden.value = composeEventDateString(getParts());
  }
  const chain = [yIn, mIn, dIn, hhIn, mmIn, ssIn];
  const lens = [4, 2, 2, 2, 2, 2];
  function pad2(el) {
    const v = eventDigits(el.value, 2);
    if (v.length === 1 && Number(v) > 0) el.value = v.padStart(2, "0");
  }
  chain.forEach((el, i) => {
    const next = chain[i + 1] || null;
    const prev = i > 0 ? chain[i - 1] : null;
    const len = lens[i];
    el.addEventListener("input", () => {
      const v0 = el.value;
      const v = eventDigits(v0, len);
      if (v !== v0) el.value = v;
      sync();
      if (v.length >= len && next) {
        next.focus();
        if (next.select) next.select();
      }
    });
    el.addEventListener("keydown", (e) => {
      if (e.key !== "Backspace" || el.value !== "") return;
      if (prev) {
        e.preventDefault();
        prev.focus();
        if (typeof prev.select === "function") prev.select();
      }
    });
  });
  [mIn, dIn, hhIn, mmIn, ssIn].forEach((el) => {
    el.addEventListener("blur", () => {
      pad2(el);
      sync();
    });
  });
  yIn.addEventListener("paste", (e) => {
    e.preventDefault();
    const text = (e.clipboardData && e.clipboardData.getData("text")) || "";
    const parsed = parseEventDateForAdmin(text);
    yIn.value = parsed.y;
    mIn.value = parsed.m;
    dIn.value = parsed.d;
    hhIn.value = parsed.hh;
    mmIn.value = parsed.mm;
    ssIn.value = parsed.ss;
    sync();
  });
  sync();
  const tc1 = document.createElement("span");
  tc1.className = "admin-ev-datetime__sep";
  tc1.setAttribute("aria-hidden", "true");
  tc1.textContent = ":";
  const tc2 = document.createElement("span");
  tc2.className = "admin-ev-datetime__sep";
  tc2.setAttribute("aria-hidden", "true");
  tc2.textContent = ":";
  const col1 = document.createElement("span");
  col1.className = "admin-ev-datetime__sep";
  col1.setAttribute("aria-hidden", "true");
  col1.textContent = "-";
  const col2 = document.createElement("span");
  col2.className = "admin-ev-datetime__sep";
  col2.setAttribute("aria-hidden", "true");
  col2.textContent = "-";
  const datePart = document.createElement("div");
  datePart.className = "admin-ev-datetime__date";
  datePart.appendChild(yIn);
  datePart.appendChild(col1);
  datePart.appendChild(mIn);
  datePart.appendChild(col2);
  datePart.appendChild(dIn);
  const timePart = document.createElement("div");
  timePart.className = "admin-ev-datetime__time";
  timePart.appendChild(tLab);
  timePart.appendChild(hhIn);
  timePart.appendChild(tc1);
  timePart.appendChild(mmIn);
  timePart.appendChild(tc2);
  timePart.appendChild(ssIn);
  dateRow.appendChild(dateHidden);
  dateRow.appendChild(datePart);
  dateRow.appendChild(timePart);
  addField("日期", dateRow);

  const tierSel = document.createElement("select");
  tierSel.className = "admin-ev-in-tier";
  tierSel.innerHTML = "<option value=\"major\">大事件</option><option value=\"minor\">小事件</option>";
  tierSel.value = d.tier === "major" ? "major" : "minor";
  addField("类型", tierSel);

  const titleIn = document.createElement("input");
  titleIn.type = "text";
  titleIn.className = "admin-ev-in-title";
  titleIn.autocomplete = "off";
  titleIn.value = d.title;
  addField("标题", titleIn);

  const bodyTa = document.createElement("textarea");
  bodyTa.className = "admin-ev-in-body";
  bodyTa.rows = 4;
  bodyTa.spellcheck = false;
  bodyTa.value = d.body;
  addField("正文", bodyTa);

  wrap.appendChild(panel);
  evItemsMount.appendChild(wrap);
  bindEvItemLiveSummary(wrap, dateRow, titleIn, tierSel);
}

function applyEventsDataToForm(data) {
  if (!evSecTitle || !evSecSubtitle || !evItemsMount) return;
  const n = normalizeEventsData(data);
  evSecTitle.value = n.section.title;
  evSecSubtitle.value = n.section.subtitle;
  evItemsMount.innerHTML = "";
  const items = sortEventsItemsDesc(n.items);
  if (!items.length) {
    appendEventEditor(emptyEventItem());
  } else {
    items.forEach((it) => appendEventEditor(it));
  }
  evNavScope.value = "__header__";
  rebuildEvNavSelects();
}

function collectEventsFromForm() {
  const section = {
    title: evSecTitle ? evSecTitle.value.trim() : "",
    subtitle: evSecSubtitle ? evSecSubtitle.value.trim() : "",
  };
  const rawItems = [];
  if (evItemsMount) {
    evItemsMount.querySelectorAll(".admin-ev-item").forEach((wrap) => {
      let id = String(wrap.dataset.eventId || "").trim();
      if (!id) id = newEventId();
      const date = wrap.querySelector(".admin-ev-in-date");
      const tierEl = wrap.querySelector(".admin-ev-in-tier");
      const titleEl = wrap.querySelector(".admin-ev-in-title");
      const bodyEl = wrap.querySelector(".admin-ev-in-body");
      const dateVal = date && "value" in date ? String(date.value).trim() : "";
      const tierRaw = tierEl && "value" in tierEl ? String(tierEl.value) : "minor";
      const tier = tierRaw === "major" ? "major" : "minor";
      const titleVal = titleEl && "value" in titleEl ? String(titleEl.value).trim() : "";
      const bodyVal = bodyEl && "value" in bodyEl ? String(bodyEl.value) : "";
      rawItems.push({ id, date: dateVal, title: titleVal, body: bodyVal, tier });
    });
  }
  const items = sortEventsItemsDesc(
    rawItems.filter((it) => it.date || it.title || String(it.body || "").trim())
  );
  return { section, items };
}

function eventsJsonPretty() {
  return JSON.stringify(collectEventsFromForm(), null, 2) + "\n";
}

async function loadEventsFromServer() {
  if (!evItemsMount) return;
  const r = await fetch("/api/admin/events", { credentials: "include", cache: "no-store" });
  if (r.status === 401) {
    showLoginOnly();
    return;
  }
  if (!r.ok) {
    if (evSaveMsg) {
      evSaveMsg.textContent = "无法加载 events.json";
      evSaveMsg.className = "admin-msg is-bad";
    }
    return;
  }
  const data = await r.json().catch(() => ({}));
  const raw = typeof data.content === "string" ? data.content : "";
  const parsed = parseEventsJsonSafe(raw);
  if (!parsed || typeof parsed !== "object") {
    if (evSaveMsg) {
      evSaveMsg.textContent = "服务端 JSON 无效，已用空白表单";
      evSaveMsg.className = "admin-msg is-bad";
    }
    applyEventsDataToForm({ section: { title: "事件", subtitle: "" }, items: [] });
    return;
  }
  if (evSaveMsg) {
    evSaveMsg.textContent = "";
    evSaveMsg.className = "admin-msg";
  }
  applyEventsDataToForm(parsed);
}

let evSaveInFlight = false;
if (evSaveBtn) {
  evSaveBtn.addEventListener("click", async () => {
    if (evSaveInFlight) return;
    evSaveInFlight = true;
    if (evSaveMsg) {
      evSaveMsg.textContent = "保存中…";
      evSaveMsg.className = "admin-msg";
    }
    evSaveBtn.disabled = true;
    try {
      const r = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ content: eventsJsonPretty() }),
      });
      if (r.status === 401) {
        showLoginOnly();
        return;
      }
      if (!r.ok) {
        let msg = "保存失败";
        try {
          const j = await r.json();
          if (j && j.error) msg = j.error;
        } catch {}
        if (evSaveMsg) {
          evSaveMsg.textContent = msg;
          evSaveMsg.className = "admin-msg is-bad";
        }
        return;
      }
      if (evSaveMsg) {
        evSaveMsg.textContent = "已保存";
        evSaveMsg.className = "admin-msg is-ok";
      }
    } catch (e) {
      if (evSaveMsg) {
        evSaveMsg.textContent = "保存失败：" + String((e && e.message) || e);
        evSaveMsg.className = "admin-msg is-bad";
      }
    } finally {
      evSaveInFlight = false;
      evSaveBtn.disabled = false;
    }
  });
}
if (evReloadBtn) {
  evReloadBtn.addEventListener("click", () => void loadEventsFromServer());
}
if (evAddItem) {
  evAddItem.addEventListener("click", () => {
    appendEventEditor(emptyEventItem());
    const last = evItemsMount && evItemsMount.querySelector(".admin-ev-item:last-of-type");
    if (last && last.id) setEvNavToEventDomId(last.id);
  });
}
if (evNavScope) {
  evNavScope.addEventListener("change", () => rebuildEvNavSelects());
}
if (evNavMonth) {
  evNavMonth.addEventListener("change", () => rebuildEvNavSelects());
}
if (evNavItem) {
  evNavItem.addEventListener("change", () => applyEvNavPanel());
}

const SITE_ASSET_NAMES = {
  favicon: "favicon.png",
  brand: "brand-logo.png",
  "hero-float": "hero-float.png",
};

async function uploadSitePng(kind, file) {
  if (!file || !siteAssetMsg) return;
  if (file.type && file.type !== "image/png") {
    siteAssetMsg.textContent = "请选择 PNG";
    siteAssetMsg.className = "admin-msg is-bad";
    return;
  }
  siteAssetMsg.textContent = "上传中…";
  siteAssetMsg.className = "admin-msg";
  try {
    const r = await fetch("/api/admin/site-asset", {
      method: "POST",
      headers: {
        "Content-Type": "image/png",
        "X-Site-Asset": kind,
      },
      credentials: "include",
      cache: "no-store",
      body: file,
    });
    const j = await r.json().catch(() => ({}));
    if (r.status === 401) {
      showLoginOnly();
      return;
    }
    if (!r.ok) {
      siteAssetMsg.textContent = String((j && j.error) || "上传失败");
      siteAssetMsg.className = "admin-msg is-bad";
      return;
    }
    siteImgV = Date.now();
    const v = siteImgV;
    if (kind === "favicon" && siteFaviconPrev) siteFaviconPrev.src = "/img/favicon.png?v=" + v;
    if (kind === "brand" && siteBrandLogoPrev) siteBrandLogoPrev.src = "/img/brand-logo.png?v=" + v;
    if (kind === "hero-float" && siteHeroFloatPrev) siteHeroFloatPrev.src = "/img/hero-float.png?v=" + v;
    siteAssetMsg.textContent = "已替换 " + (SITE_ASSET_NAMES[kind] || kind);
    siteAssetMsg.className = "admin-msg is-ok";
  } catch (e) {
    siteAssetMsg.textContent = "上传异常：" + String((e && e.message) || e);
    siteAssetMsg.className = "admin-msg is-bad";
  }
}

if (siteFaviconInput) {
  siteFaviconInput.addEventListener("change", () => {
    const f = siteFaviconInput.files && siteFaviconInput.files[0];
    siteFaviconInput.value = "";
    void uploadSitePng("favicon", f);
  });
}
if (siteBrandLogoInput) {
  siteBrandLogoInput.addEventListener("change", () => {
    const f = siteBrandLogoInput.files && siteBrandLogoInput.files[0];
    siteBrandLogoInput.value = "";
    void uploadSitePng("brand", f);
  });
}
if (siteHeroFloatInput) {
  siteHeroFloatInput.addEventListener("change", () => {
    const f = siteHeroFloatInput.files && siteHeroFloatInput.files[0];
    siteHeroFloatInput.value = "";
    void uploadSitePng("hero-float", f);
  });
}

(async () => {
  await applyPreflight();
  if (await sessionOk()) {
    showApp();
    await refreshSessionUser();
    setPanel("wiki");
    await setEditMode("source");
    await loadWikiMd();
  } else {
    showLoginOnly();
  }
})();
