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
const logoutBtn = document.getElementById("logoutBtn");
const navWiki = document.getElementById("navWiki");
const navOther = document.getElementById("navOther");
const panelWiki = document.getElementById("panelWiki");
const panelOther = document.getElementById("panelOther");
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

const WIKI_UPLOAD_NAME_RE = /^[a-zA-Z0-9._-]+\.(png|jpe?g|gif|webp|svg|avif)$/i;

function showLoginOnly() {
  loginPanel.hidden = false;
  appPanel.hidden = true;
}

function showApp() {
  loginPanel.hidden = true;
  appPanel.hidden = false;
}

async function sessionOk() {
  const r = await fetch("/api/admin/session", { credentials: "same-origin" });
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
  const tryFetch = () => fetch("/api/admin/wiki", { credentials: "same-origin" });
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

function setPanel(name) {
  const isWiki = name === "wiki";
  navWiki.classList.toggle("is-active", isWiki);
  navOther.classList.toggle("is-active", !isWiki);
  panelWiki.hidden = !isWiki;
  panelOther.hidden = !isWiki;
}

function setGalleryStatus(text, ok) {
  if (!wikiUploadsDlgStatus) return;
  wikiUploadsDlgStatus.textContent = text || "";
  wikiUploadsDlgStatus.className =
    "admin-uploads-dlg__status" + (ok === true ? " is-ok" : ok === false ? " is-bad" : "");
}

async function fetchWikiUploadsList() {
  const r = await fetch("/api/admin/wiki-uploads", { credentials: "same-origin", cache: "no-store" });
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
        credentials: "same-origin",
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
  const r = await fetch("/api/admin/wiki-uploads/item", {
    method: "DELETE",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    credentials: "same-origin",
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
  const r = await fetch("/api/admin/wiki-uploads/item", {
    method: "PATCH",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    credentials: "same-origin",
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
    credentials: "same-origin",
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
  setPanel("wiki");
  await setEditMode("source");
  await loadWikiMd();
});

logoutBtn.addEventListener("click", async () => {
  try {
    const r = await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" });
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

navOther.addEventListener("click", () => {
  setPanel("other");
});

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
      method: "PUT",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      credentials: "same-origin",
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

(async () => {
  if (await sessionOk()) {
    showApp();
    setPanel("wiki");
    await setEditMode("source");
    await loadWikiMd();
  } else {
    showLoginOnly();
  }
})();
