import fsp from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: true });

const SLUG_RE = /^[a-z0-9][a-z0-9_-]*$/;
/** 与前端一致：不属任何可编辑分类的顶层页（目前仅 about） */
export const WIKI_TOP_CATEGORY_ID = "__wiki_top__";

export function isValidChapterSlug(s) {
  return typeof s === "string" && SLUG_RE.test(s) && s.length <= 64;
}

function slugifyAnchor(s) {
  return String(s || "")
    .replace(/<[^>]+>/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s/\\]+/g, "-")
    .replace(/[^a-z0-9\u4e00-\u9fff-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "section";
}

function stripHtml(s) {
  return String(s || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

export function addHeadingIdsToHtml(html, pageSlug) {
  const toc = [];
  const used = new Set();
  let h2i = 0;
  const out = String(html || "").replace(
    /<h([2-3])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi,
    (full, level, attrs, inner) => {
      const d = parseInt(level, 10);
      if (d !== 2 && d !== 3) return full;
      const a = attrs || "";
      if (/\sid\s*=/.test(a)) return full;
      const text = stripHtml(inner);
      let base = slugifyAnchor(text);
      if (!base) base = "h" + h2i;
      let id = pageSlug + "--" + base;
      let n = 0;
      while (used.has(id)) {
        n++;
        id = pageSlug + "--" + base + (n > 0 ? "-" + n : "");
      }
      used.add(id);
      h2i++;
      toc.push({ id, label: text || id, depth: d === 2 ? 2 : 3 });
      return "<h" + level + a + ' id="' + id.replace(/"/g, "&quot;") + '">' + inner + "</h" + level + ">";
    }
  );
  return { html: out, toc };
}

function sortByOrder(list) {
  return list
    .slice()
    .sort((a, b) => {
      const oa = typeof a.order === "number" && Number.isFinite(a.order) ? a.order : 1e9;
      const ob = typeof b.order === "number" && Number.isFinite(b.order) ? b.order : 1e9;
      if (oa !== ob) return oa - ob;
      return String(a.id || a.slug || "").localeCompare(String(b.id || b.slug || ""), "en");
    });
}

export function extractFirstH1FromMd(md) {
  const t = String(md || "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n");
  for (const line of t.split("\n")) {
    const s = line.trim();
    if (!s) continue;
    const m = /^#\s+(.+)$/.exec(s);
    if (m) return m[1].trim();
  }
  return "";
}

function categoryOrder(a, b) {
  const oa = typeof a.order === "number" && Number.isFinite(a.order) ? a.order : 1e9;
  const ob = typeof b.order === "number" && Number.isFinite(b.order) ? b.order : 1e9;
  if (oa !== ob) return oa - ob;
  return String(a.id || "").localeCompare(String(b.id || ""), "en");
}

function normalizeTocState(raw) {
  const j = raw && typeof raw === "object" ? raw : {};
  let pages = Array.isArray(j.pages) ? j.pages.filter((x) => x && typeof x === "object") : [];
  let categories = Array.isArray(j.categories) ? j.categories.filter((x) => x && typeof x === "object") : [];
  if (categories.length === 0) {
    categories = [{ id: "cat-default", label: "文档", order: 0, defaultOpen: false }];
  }
  const catIds = new Set(categories.map((c) => String(c.id || "")));
  const firstId = String(categories[0].id || "cat-default");
  const TOP = WIKI_TOP_CATEGORY_ID;
  pages = pages.map((p) => {
    const sl = p.slug != null ? String(p.slug) : "";
    if (sl === "about") {
      return { ...p, categoryId: TOP };
    }
    if (String(p.categoryId || "") === TOP && sl !== "about") {
      return { ...p, categoryId: firstId };
    }
    const cid = p.categoryId != null && catIds.has(String(p.categoryId)) ? String(p.categoryId) : firstId;
    return { ...p, categoryId: cid };
  });
  categories = categories.slice().sort(categoryOrder);
  return { version: 2, categories, pages };
}

function parseChaptersJson(raw) {
  try {
    const j = JSON.parse(raw);
    if (!j || !Array.isArray(j.chapters)) return { chapters: [] };
    return { chapters: j.chapters };
  } catch {
    return { chapters: [] };
  }
}

export async function migrateLegacyWikiIfNeeded(wikiDir) {
  const chaptersPath = path.join(wikiDir, "chapters.json");
  try {
    await fsp.access(chaptersPath);
    return;
  } catch {}
  const legacyPath = path.join(wikiDir, "content.md");
  let md = "";
  try {
    md = (await fsp.readFile(legacyPath, "utf8")).replace(/\r\n/g, "\n");
  } catch {}
  if (!md.trim()) {
    await fsp.mkdir(wikiDir, { recursive: true });
    await fsp.writeFile(chaptersPath, JSON.stringify({ chapters: [] }, null, 2), "utf8");
    return;
  }
  const lines = md.split("\n");
  const h2Starts = [];
  for (let i = 0; i < lines.length; i++) {
    const m = /^##\s+(.+)$/.exec(lines[i]);
    if (m) h2Starts.push({ line: i, title: m[1].trim() });
  }
  const heroMd = h2Starts.length ? lines.slice(0, h2Starts[0].line).join("\n").trim() : md.trim();
  let metaNav = [];
  try {
    const meta = JSON.parse(await fsp.readFile(path.join(wikiDir, "meta.json"), "utf8"));
    if (meta && Array.isArray(meta.nav)) metaNav = meta.nav;
  } catch {}
  const readmeText =
    (await fsp.readFile(path.join(wikiDir, "README.md"), "utf8").catch(() => "")) || "# 百科\n\n在后台编辑本索引与各章节。";
  const readmeOut = heroMd.trim() ? heroMd + "\n" : readmeText;
  await fsp.writeFile(path.join(wikiDir, "README.md"), readmeOut, "utf8");
  const chapters = [];
  for (let i = 0; i < h2Starts.length; i++) {
    const start = h2Starts[i].line + 1;
    const end = i + 1 < h2Starts.length ? h2Starts[i + 1].line : lines.length;
    const body = lines.slice(start, end).join("\n").trim();
    const navItem = metaNav[i + 1] || {};
    const rawId = (navItem.id && String(navItem.id)) || "";
    let slug = rawId.replace(/^wiki-/, "").replace(/[^a-z0-9_-]/gi, "");
    if (!isValidChapterSlug(slug)) {
      const fromTitle = slugifyAnchor(h2Starts[i].title);
      const asc = fromTitle.replace(/[^a-z0-9-]/g, "");
      slug = isValidChapterSlug(asc) ? asc : "ch" + i;
    }
    chapters.push({
      id: "mig-" + i + "-" + Date.now().toString(36),
      title: h2Starts[i].title,
      slug,
      body: body || "_（本页正文为空）_",
      order: i,
    });
  }
  await fsp.mkdir(wikiDir, { recursive: true });
  await fsp.writeFile(chaptersPath, JSON.stringify({ chapters }, null, 2), "utf8");
}

export async function migrateChaptersToPageFiles(wikiDir) {
  const tocFile = path.join(wikiDir, "toc.json");
  try {
    await fsp.access(tocFile);
    return;
  } catch {
    // need migration from chapters.json
  }
  const chaptersPath = path.join(wikiDir, "chapters.json");
  let raw = '{"chapters":[]}';
  try {
    raw = await fsp.readFile(chaptersPath, "utf8");
  } catch {
    await fsp.mkdir(wikiDir, { recursive: true });
    await fsp.mkdir(path.join(wikiDir, "pages"), { recursive: true });
    await fsp.writeFile(tocFile, JSON.stringify({ pages: [] }, null, 2), "utf8");
    return;
  }
  const { chapters } = parseChaptersJson(raw);
  const list = sortByOrder(chapters.filter((c) => c && typeof c === "object"));
  const pagesDir = path.join(wikiDir, "pages");
  await fsp.mkdir(pagesDir, { recursive: true });
  const meta = [];
  for (const c of list) {
    if (!c.slug || String(c.slug) === "index") continue;
    const slug = String(c.slug).toLowerCase();
    const body = c.body != null ? String(c.body) : "";
    await fsp.writeFile(path.join(pagesDir, slug + ".md"), body, "utf8");
    meta.push({
      id: c.id != null ? String(c.id) : "p-" + slug,
      title: c.title != null ? String(c.title) : slug,
      slug,
      order: typeof c.order === "number" && Number.isFinite(c.order) ? c.order : meta.length,
    });
  }
  await fsp.writeFile(tocFile, JSON.stringify({ pages: sortByOrder(meta) }, null, 2), "utf8");
  try {
    await fsp.rename(chaptersPath, path.join(wikiDir, "chapters.json.bak"));
  } catch {
    try {
      await fsp.unlink(chaptersPath);
    } catch {
      // ignore
    }
  }
}

export function renderMarkdownToPage(slug, md) {
  const raw = marked.parse(String(md || ""), { gfm: true, breaks: true });
  return addHeadingIdsToHtml(raw, slug);
}

export async function readWikiReadme(wikiDir) {
  const p = path.join(wikiDir, "README.md");
  try {
    return (await fsp.readFile(p, "utf8")).replace(/\r\n/g, "\n");
  } catch {
    return "# 百科\n\n在后台「百科」中编辑索引与章节。";
  }
}

async function readWikiTocData(wikiDir) {
  const p = path.join(wikiDir, "toc.json");
  try {
    const raw = (await fsp.readFile(p, "utf8")).replace(/^\uFEFF/, "");
    const j = JSON.parse(raw);
    return normalizeTocState(j);
  } catch {
    return normalizeTocState({});
  }
}

async function readPageMd(wikiDir, slug) {
  const p = path.join(wikiDir, "pages", slug + ".md");
  try {
    return (await fsp.readFile(p, "utf8")).replace(/\r\n/g, "\n");
  } catch {
    return "";
  }
}

async function fileMtimeMs(absPath) {
  try {
    const st = await fsp.stat(absPath);
    return st && typeof st.mtimeMs === "number" && Number.isFinite(st.mtimeMs) ? Math.floor(st.mtimeMs) : 0;
  } catch {
    return 0;
  }
}

export async function buildWikiPublicJson(webDir) {
  const wikiDir = path.join(webDir, "wiki");
  await migrateLegacyWikiIfNeeded(wikiDir);
  await migrateChaptersToPageFiles(wikiDir);
  const tocState = await readWikiTocData(wikiDir);
  const listRaw = sortByOrder(tocState.pages);
  const topId = WIKI_TOP_CATEGORY_ID;
  const list = listRaw
    .filter((p) => p && String(p.categoryId) === topId)
    .concat(listRaw.filter((p) => !p || String(p.categoryId) !== topId));
  const pages = [];
  for (const p of list) {
    if (!p || !p.slug) continue;
    const slug = String(p.slug);
    if (slug === "index") continue;
    const md = await readPageMd(wikiDir, slug);
    const r = renderMarkdownToPage(slug, md);
    const h1 = extractFirstH1FromMd(md);
    const title = p.title != null ? String(p.title).trim() : "";
    const label = h1 || title || slug;
    const pageMtime = await fileMtimeMs(path.join(wikiDir, "pages", slug + ".md"));
    pages.push({
      slug,
      id: "wiki-" + slug.replace(/[^a-z0-9_-]/gi, ""),
      label,
      categoryId: p.categoryId != null ? String(p.categoryId) : null,
      order: typeof p.order === "number" && Number.isFinite(p.order) ? p.order : 0,
      updatedAt: pageMtime,
      html: r.html,
      toc: r.toc,
    });
  }
  const nav = pages.map((p) => ({
    id: p.id,
    label: p.label,
    slug: p.slug,
    categoryId: p.categoryId,
  }));
  const categories = (tocState.categories || []).map((c) => ({
    id: String(c.id || ""),
    label: c.label != null ? String(c.label) : "",
    order: typeof c.order === "number" && Number.isFinite(c.order) ? c.order : 0,
    defaultOpen: c && c.defaultOpen === true,
  }));
  return JSON.stringify({
    version: 2,
    pages,
    nav,
    categories,
  });
}

export async function readWikiAdminBundle(wikiDir) {
  await migrateLegacyWikiIfNeeded(wikiDir);
  await migrateChaptersToPageFiles(wikiDir);
  const readme = await readWikiReadme(wikiDir);
  const tocState = await readWikiTocData(wikiDir);
  const sorted = sortByOrder(tocState.pages);
  const outPages = [];
  for (const p of sorted) {
    if (!p || !p.slug) continue;
    const slug = String(p.slug);
    if (slug === "index") continue;
    const content = await readPageMd(wikiDir, slug);
    outPages.push({
      id: p.id != null ? String(p.id) : "p-" + slug,
      title: p.title != null ? String(p.title) : "",
      slug,
      categoryId: p.categoryId != null ? String(p.categoryId) : String(tocState.categories[0].id),
      order: typeof p.order === "number" && Number.isFinite(p.order) ? p.order : outPages.length,
      content,
    });
  }
  const categories = (tocState.categories || []).map((c) => ({
    id: String(c.id || ""),
    label: c.label != null ? String(c.label) : "",
    order: typeof c.order === "number" && Number.isFinite(c.order) ? c.order : 0,
    defaultOpen: c && c.defaultOpen === true,
  }));
  return { readme, pages: outPages, categories };
}

function normalizeCategoriesForSave(categories) {
  if (!Array.isArray(categories) || !categories.length) {
    return [{ id: "cat-default", label: "文档", order: 0, defaultOpen: false }];
  }
  const used = new Set();
  const out = [];
  for (let i = 0; i < categories.length; i++) {
    const c = categories[i];
    if (!c || typeof c !== "object") continue;
    let id = String(c.id || "")
      .trim()
      .replace(/[^a-z0-9_-]/gi, "");
    if (!id) id = "cat-" + i + "-" + Date.now().toString(36).slice(-4);
    let b = id;
    let n = 0;
    while (used.has(id)) {
      n++;
      id = b + "-" + n;
    }
    used.add(id);
    out.push({
      id,
      label: c.label != null ? String(c.label) : "分类",
      order: i,
      defaultOpen: c && c.defaultOpen === true,
    });
  }
  return out.length ? out : [{ id: "cat-default", label: "文档", order: 0, defaultOpen: false }];
}

function normalizePagesForSave(pages, categoryMeta) {
  if (!Array.isArray(pages)) throw new Error("pages 须为数组");
  const TOP = WIKI_TOP_CATEGORY_ID;
  const catIds = new Set(categoryMeta.map((c) => c.id));
  const firstCat = categoryMeta[0] && categoryMeta[0].id;
  const byCat = new Map();
  const raw = [];
  const slugs = new Set(["index"]);
  for (let i = 0; i < pages.length; i++) {
    const c = pages[i];
    if (!c || typeof c !== "object") continue;
    let slug = String(c.slug || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");
    if (slug === "index" || !slug) slug = "pg-" + i + "-" + Math.random().toString(36).slice(2, 6);
    let n = 0;
    const base = slug;
    while (slugs.has(slug)) {
      n++;
      slug = base + "-" + n;
    }
    slugs.add(slug);
    if (!isValidChapterSlug(slug)) throw new Error("无效 slug: " + slug);
    let cid = String(c.categoryId || "").trim();
    if (slug === "about" || cid === TOP) {
      if (slug !== "about") {
        cid = firstCat;
      } else {
        cid = TOP;
        raw.push({
          id: String(c.id || "p-" + i + "-" + Date.now().toString(36)),
          title: c.title != null ? String(c.title) : "",
          slug,
          content: c.content != null ? String(c.content) : "",
          categoryId: TOP,
          inOrder: typeof c.order === "number" && Number.isFinite(c.order) ? c.order : i * 0.001,
        });
        continue;
      }
    }
    if (!cid || !catIds.has(cid)) cid = firstCat;
    raw.push({
      id: String(c.id || "p-" + i + "-" + Date.now().toString(36)),
      title: c.title != null ? String(c.title) : "",
      slug,
      content: c.content != null ? String(c.content) : "",
      categoryId: cid,
      inOrder: typeof c.order === "number" && Number.isFinite(c.order) ? c.order : i * 0.001,
    });
  }
  for (const p of raw) {
    if (!byCat.has(p.categoryId)) byCat.set(p.categoryId, []);
    byCat.get(p.categoryId).push(p);
  }
  for (const [, arr] of byCat) {
    arr.sort((a, b) => a.inOrder - b.inOrder);
  }
  const out = [];
  const topArr = byCat.get(TOP) || [];
  topArr.forEach((p, j) => {
    out.push({
      id: p.id,
      title: p.title,
      slug: p.slug,
      content: p.content,
      categoryId: TOP,
      order: j,
    });
  });
  for (const c of categoryMeta) {
    const arr = byCat.get(c.id) || [];
    arr.forEach((p, j) => {
      out.push({
        id: p.id,
        title: p.title,
        slug: p.slug,
        content: p.content,
        categoryId: c.id,
        order: j,
      });
    });
  }
  return out;
}

export async function saveWikiAdminBundle(wikiDir, { readme, pages, categories }) {
  const rdm = typeof readme === "string" ? readme : "";
  const normCats = normalizeCategoriesForSave(categories);
  const norm = normalizePagesForSave(pages, normCats);
  await fsp.mkdir(wikiDir, { recursive: true });
  const pagesDir = path.join(wikiDir, "pages");
  await fsp.mkdir(pagesDir, { recursive: true });
  await fsp.writeFile(path.join(wikiDir, "README.md"), rdm, "utf8");
  const meta = norm.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    order: p.order,
    categoryId: p.categoryId,
  }));
  const tocOut = { version: 2, categories: normCats, pages: meta };
  await fsp.writeFile(path.join(wikiDir, "toc.json"), JSON.stringify(tocOut, null, 2), "utf8");
  const want = new Set(norm.map((p) => p.slug));
  try {
    const names = await fsp.readdir(pagesDir);
    for (const n of names) {
      if (!n.endsWith(".md")) continue;
      const s = n.slice(0, -3);
      if (!want.has(s)) await fsp.unlink(path.join(pagesDir, n));
    }
  } catch {
    // ignore
  }
  const normMd = (s) => String(s == null ? "" : s).replace(/\r\n/g, "\n");
  for (const p of norm) {
    const fp = path.join(pagesDir, p.slug + ".md");
    const wantText = normMd(p.content);
    let prev = null;
    try {
      prev = normMd(await fsp.readFile(fp, "utf8"));
    } catch {
      prev = null;
    }
    if (prev !== wantText) {
      await fsp.writeFile(fp, p.content, "utf8");
    }
  }
}
