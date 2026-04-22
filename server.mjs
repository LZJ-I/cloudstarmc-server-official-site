import http from "node:http";
import crypto from "node:crypto";
import { existsSync } from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import url from "node:url";
import express from "express";
import { marked } from "marked";
import { createAdminRouter } from "./admin-routes.mjs";

marked.setOptions({ gfm: true, breaks: true });

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const webDir = path.join(__dirname, "web");
const WEB_ROOT = existsSync(path.join(webDir, "index.html")) ? webDir : __dirname;
const PORT = Number(process.env.PORT || 8080); // port
const HOST = process.env.HOST || "0.0.0.0";

const ADMIN_USER = "zxcvbnm";
const PW_SCRYPT_SALT = Buffer.from("wiki-admin-pw-v1", "utf8");
const PW_HASH_HEX =
  "57817384768e87b5f3b32731e95efa08acbc0e0e3d6f1e754e9b1bfc54a1294e750600ff3d1b7096e6d774f4f98e79f003c7873e819166b75a194a5df7fb4438";
const SESSION_MAX_MS = 48 * 60 * 60 * 1000;
const WIKI_MD = path.join(webDir, "wiki", "content.md");

function verifyPassword(pw) {
  let h;
  try {
    h = crypto.scryptSync(String(pw), PW_SCRYPT_SALT, 64);
  } catch {
    return false;
  }
  const expected = Buffer.from(PW_HASH_HEX, "hex");
  if (h.length !== expected.length) return false;
  return crypto.timingSafeEqual(h, expected);
}

function verifyUser(u) {
  const a = Buffer.from(String(u || ""), "utf8");
  const b = Buffer.from(ADMIN_USER, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

const adminExpress = express();
adminExpress.set("trust proxy", 1);
adminExpress.use((req, res, next) => {
  let line = "[admin-in] " + req.method + " " + (req.originalUrl || req.url || "");
  const ct = req.headers["content-type"];
  if (ct) line += " ct=" + String(ct).slice(0, 96);
  const cl = req.headers["content-length"];
  if (cl) line += " cl=" + cl;
  process.stderr.write(line + "\n");
  next();
});
adminExpress.use(
  "/api/admin",
  createAdminRouter({
    wikiMdPath: WIKI_MD,
    verifyUser,
    verifyPassword,
    sessionMaxMs: SESSION_MAX_MS,
  })
);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".webp": "image/webp",
};

function safePath(requestUrl) {
  const u = new URL(requestUrl, "http://127.0.0.1");
  let rel = u.pathname.replace(/^\/+/, "") || "index.html";
  rel = path.normalize(rel).replace(/^(\.\.(\/|\\|$))+/, "");
  const abs = path.resolve(WEB_ROOT, rel);
  const rootResolved = path.resolve(WEB_ROOT);
  const relToRoot = path.relative(rootResolved, abs);
  if (relToRoot.startsWith("..") || path.isAbsolute(relToRoot)) return null;
  return abs;
}

function cacheControlForExt(ext) {
  const e = String(ext || "").toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico", ".woff2"].includes(e)) {
    return "public, max-age=604800";
  }
  if (e === ".css" || e === ".js" || e === ".mjs") return "public, max-age=3600";
  return "no-cache";
}

function teamParseErrorEntry(dName) {
  return {
    id: dName,
    name: dName,
    title: "",
    bio: dName + "：meta.json解析失败",
    color: "#6B7280",
    __sortDir: dName
  };
}

async function buildTeamJson() {
  const staffRoot = path.join(webDir, "staff");
  let entries = [];
  try {
    const names = await fsp.readdir(staffRoot, { withFileTypes: true });
    for (const d of names) {
      if (!d.isDirectory() || d.name.startsWith("_") || d.name.startsWith(".")) continue;
      const metaPath = path.join(staffRoot, d.name, "meta.json");
      let raw;
      try {
        raw = await fsp.readFile(metaPath, "utf8");
      } catch {
        continue;
      }
      let meta;
      try {
        meta = JSON.parse(raw.replace(/^\uFEFF/, ""));
      } catch {
        entries.push(teamParseErrorEntry(d.name));
        continue;
      }
      if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
        entries.push(teamParseErrorEntry(d.name));
        continue;
      }
      meta.id = d.name;
      const disp = meta.name != null ? String(meta.name).trim() : "";
      meta.name = disp || "示例";
      meta.__sortDir = d.name;
      entries.push(meta);
    }
  } catch {
    return "[]";
  }
  function orderValue(m) {
    const o = m && m.order;
    if (typeof o === "number" && Number.isFinite(o)) return o;
    return 1_000_000;
  }
  entries.sort((a, b) => {
    const d = orderValue(a) - orderValue(b);
    if (d !== 0) return d;
    return String(a.__sortDir || a.id || "").localeCompare(String(b.__sortDir || b.id || ""), "en");
  });
  for (const e of entries) delete e.__sortDir;
  return JSON.stringify(entries);
}

function escapeHtmlAttr(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function safeDomId(id) {
  const s = String(id || "").trim();
  if (/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(s)) return s;
  return "wiki-block";
}

async function readFeaturesJson() {
  const p = path.join(webDir, "features", "features.json");
  try {
    const raw = (await fsp.readFile(p, "utf8")).replace(/^\uFEFF/, "");
    JSON.parse(raw);
    return raw;
  } catch {
    return "{}";
  }
}

async function buildWikiPageJson() {
  const wikiDir = path.join(webDir, "wiki");
  const mdPath = path.join(wikiDir, "content.md");
  const metaPath = path.join(wikiDir, "meta.json");
  let nav = [];
  try {
    const meta = JSON.parse(await fsp.readFile(metaPath, "utf8"));
    if (meta && Array.isArray(meta.nav)) nav = meta.nav;
  } catch {}
  let md = "";
  try {
    md = await fsp.readFile(mdPath, "utf8");
  } catch {
    return JSON.stringify({ html: "", nav });
  }
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const h2Starts = [];
  for (let i = 0; i < lines.length; i++) {
    const m = /^##\s+(.+)$/.exec(lines[i]);
    if (m) h2Starts.push({ line: i, title: m[1].trim() });
  }
  const heroMd = h2Starts.length ? lines.slice(0, h2Starts[0].line).join("\n").trim() : md.trim();
  const bodies = [];
  for (let i = 0; i < h2Starts.length; i++) {
    const start = h2Starts[i].line + 1;
    const end = i + 1 < h2Starts.length ? h2Starts[i + 1].line : lines.length;
    bodies.push(lines.slice(start, end).join("\n").trim());
  }
  const heroId = safeDomId(nav[0] && nav[0].id ? nav[0].id : "wiki-top");
  let html = '<div class="wiki-page">';
  html += `<section class="section wiki-hero" id="${escapeHtmlAttr(heroId)}"><div class="wiki-hero__inner reveal wiki-md">`;
  html += marked.parse(heroMd || "");
  html += "</div></section>";
  for (let i = 0; i < bodies.length; i++) {
    const navItem = nav[i + 1];
    const sid = safeDomId(navItem && navItem.id ? navItem.id : "wiki-s" + i);
    const alt = i % 2 === 0 ? "section--alt " : "";
    const last = i === bodies.length - 1 ? " wiki-section--last" : "";
    const piece = "## " + h2Starts[i].title + "\n\n" + bodies[i];
    html += `<section class="section ${alt}wiki-section${last}" id="${escapeHtmlAttr(sid)}"><div class="wiki-section__inner reveal wiki-md">`;
    html += marked.parse(piece);
    html += "</div></section>";
  }
  html += "</div>";
  return JSON.stringify({ html, nav });
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, "http://127.0.0.1");
  if (u.pathname.startsWith("/api/admin")) {
    if (String(req.headers.expect || "").toLowerCase() === "100-continue") {
      try {
        res.writeContinue();
      } catch (e) {
        process.stderr.write("[server] writeContinue: " + String(e && e.message ? e.message : e) + "\n");
      }
    }
    adminExpress(req, res);
    return;
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405).end();
    return;
  }
  if (u.pathname === "/admin") {
    res.writeHead(302, { Location: "/admin/", "Cache-Control": "no-store" });
    res.end();
    return;
  }
  if (u.pathname === "/admin/wiki.html" || u.pathname === "/admin/wiki") {
    res.writeHead(302, { Location: "/admin/", "Cache-Control": "no-store" });
    res.end();
    return;
  }
  if (u.pathname === "/api/team") {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    try {
      const body = await buildTeamJson();
      if (req.method === "HEAD") {
        res.writeHead(200).end();
        return;
      }
      res.writeHead(200).end(body);
    } catch (e) {
      res.writeHead(500).end(JSON.stringify({ error: String(e && e.message ? e.message : e) }));
    }
    return;
  }
  if (u.pathname === "/api/features") {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    try {
      const body = await readFeaturesJson();
      if (req.method === "HEAD") {
        res.writeHead(200).end();
        return;
      }
      res.writeHead(200).end(body);
    } catch (e) {
      res.writeHead(500).end(JSON.stringify({ error: String(e && e.message ? e.message : e) }));
    }
    return;
  }
  if (u.pathname === "/api/wiki") {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    try {
      const body = await buildWikiPageJson();
      if (req.method === "HEAD") {
        res.writeHead(200).end();
        return;
      }
      res.writeHead(200).end(body);
    } catch (e) {
      res.writeHead(500).end(JSON.stringify({ error: String(e && e.message ? e.message : e) }));
    }
    return;
  }
  const abs = safePath(req.url);
  if (!abs) {
    res.writeHead(403).end();
    return;
  }
  const sendFile = async (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || "application/octet-stream";
    const st = await fsp.stat(filePath);
    res.setHeader("Content-Type", type);
    const relW = path.relative(path.resolve(WEB_ROOT), path.resolve(filePath)).replace(/\\/g, "/");
    const underWikiUploads =
      relW === "wiki/uploads" || relW.startsWith("wiki/uploads/");
    const underAdmin = relW === "admin" || relW.startsWith("admin/");
    res.setHeader(
      "Cache-Control",
      underWikiUploads
        ? "private, max-age=0, must-revalidate"
        : underAdmin
          ? "no-store"
          : cacheControlForExt(ext)
    );
    res.setHeader("Last-Modified", st.mtime.toUTCString());
    const ims = req.headers["if-modified-since"];
    const imsMs = ims ? Date.parse(ims) : NaN;
    if (!Number.isNaN(imsMs) && st.mtimeMs <= imsMs) {
      res.writeHead(304).end();
      return;
    }
    if (req.method === "HEAD") {
      res.setHeader("Content-Length", String(st.size));
      res.writeHead(200).end();
      return;
    }
    const data = await fsp.readFile(filePath);
    res.setHeader("Content-Length", String(data.length));
    res.writeHead(200).end(data);
  };

  try {
    const st = await fsp.stat(abs);
    if (st.isDirectory()) {
      await sendFile(path.join(abs, "index.html"));
      return;
    }
    await sendFile(abs);
  } catch {
    const relExt = path.extname(abs).toLowerCase();
    if (relExt && MIME[relExt]) {
      res.writeHead(404).end("Not Found");
      return;
    }
    try {
      await sendFile(path.join(WEB_ROOT, "index.html"));
    } catch {
      res.writeHead(404).end("Not Found");
    }
  }
});

server.on("clientError", (err, socket) => {
  try {
    process.stderr.write("[server] clientError: " + String(err && err.message ? err.message : err) + "\n");
  } catch {}
  try {
    socket.destroy();
  } catch {}
});
server.on("error", (err) => {
  if (err.code === "EACCES") {
    process.stderr.write(
      `端口 ${PORT} 被拒绝绑定（常见于 HTTP.sys/系统保留）。请换端口或调整系统监听配置。\n`
    );
  } else if (err.code === "EADDRINUSE") {
    process.stderr.write(
      `端口 ${PORT} 已被占用（例如 HTTP.sys / 其他服务）。请释放该端口或设置 PORT 环境变量改用其他端口。\n`
    );
  } else {
    process.stderr.write(String(err) + "\n");
  }
  process.exit(1);
});

const who = WEB_ROOT === webDir ? "web/" : "项目根目录";
server.listen(PORT, HOST, () => {
  process.stdout.write(
    `云星官网 (${who}): http://127.0.0.1:${PORT}/  内网其它电脑请用本机局域网 IP:${PORT}\n`
  );
});