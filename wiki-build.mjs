import fsp from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: true });

const SLUG_RE = /^[a-z0-9][a-z0-9_-]*$/;

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

function parseChaptersFile(raw) {
  try {
    const j = JSON.parse(raw);
    if (!j || !Array.isArray(j.chapters)) return { chapters: [] };
    return { chapters: j.chapters };
  } catch {
    return { chapters: [] };
  }
}

function sortChapters(list) {
  return list
    .slice()
    .sort((a, b) => {
      const oa = typeof a.order === "number" && Number.isFinite(a.order) ? a.order : 1e9;
      const ob = typeof b.order === "number" && Number.isFinite(b.order) ? b.order : 1e9;
      if (oa !== ob) return oa - ob;
      return String(a.id || "").localeCompare(String(b.id || ""), "en");
    });
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

export function renderMarkdownToPage(slug, md) {
  const raw = marked.parse(String(md || ""));
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

export async function readWikiChapters(wikiDir) {
  const p = path.join(wikiDir, "chapters.json");
  let raw = '{"chapters":[]}';
  try {
    raw = await fsp.readFile(p, "utf8");
  } catch {}
  return parseChaptersFile(raw);
}

export async function buildWikiPublicJson(webDir) {
  const wikiDir = path.join(webDir, "wiki");
  await migrateLegacyWikiIfNeeded(wikiDir);
  const indexMd = await readWikiReadme(wikiDir);
  const { chapters: rawList } = await readWikiChapters(wikiDir);
  const list = sortChapters(rawList.filter((c) => c && typeof c === "object"));
  const indexRender = renderMarkdownToPage("index", indexMd);
  const pages = [
    {
      slug: "index",
      id: "wiki-index",
      label: "索引",
      html: indexRender.html,
      toc: indexRender.toc,
    },
  ];
  for (const ch of list) {
    const slug = (ch.slug && String(ch.slug)) || "page";
    if (slug === "index") continue;
    const r = renderMarkdownToPage(slug, ch.body != null ? String(ch.body) : "");
    const title = ch.title != null ? String(ch.title) : slug;
    pages.push({
      slug,
      id: "wiki-" + slug.replace(/[^a-z0-9_-]/gi, ""),
      label: title,
      html: r.html,
      toc: r.toc,
    });
  }
  const nav = pages.map((p) => ({
    id: p.id,
    label: p.label,
    slug: p.slug,
  }));
  return JSON.stringify({ version: 1, pages, nav, indexLabel: "索引" });
}

export async function readWikiAdminBundle(wikiDir) {
  await migrateLegacyWikiIfNeeded(wikiDir);
  const readme = await readWikiReadme(wikiDir);
  const { chapters } = await readWikiChapters(wikiDir);
  return { readme, chapters: sortChapters((chapters || []).filter((c) => c && typeof c === "object")) };
}

function normalizeChaptersForSave(chapters) {
  if (!Array.isArray(chapters)) throw new Error("chapters 须为数组");
  const out = [];
  const slugs = new Set(["index"]);
  for (let i = 0; i < chapters.length; i++) {
    const c = chapters[i];
    if (!c || typeof c !== "object") continue;
    let slug = String(c.slug || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "");
    if (slug === "index" || !slug) slug = "ch-" + i + "-" + Math.random().toString(36).slice(2, 6);
    let n = 0;
    const base = slug;
    while (slugs.has(slug)) {
      n++;
      slug = base + "-" + n;
    }
    slugs.add(slug);
    if (!isValidChapterSlug(slug)) throw new Error("无效 slug: " + slug);
    out.push({
      id: String(c.id || "ch-" + i + "-" + Date.now().toString(36)),
      title: c.title != null ? String(c.title) : "",
      slug,
      body: c.body != null ? String(c.body) : "",
      order: i,
    });
  }
  return out;
}

export async function saveWikiAdminBundle(wikiDir, { readme, chapters }) {
  if (typeof readme !== "string") throw new Error("missing readme");
  const norm = normalizeChaptersForSave(chapters);
  await fsp.mkdir(wikiDir, { recursive: true });
  await fsp.writeFile(path.join(wikiDir, "README.md"), readme, "utf8");
  await fsp.writeFile(path.join(wikiDir, "chapters.json"), JSON.stringify({ chapters: norm }, null, 2), "utf8");
}
