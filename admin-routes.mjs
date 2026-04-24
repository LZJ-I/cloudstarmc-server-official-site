import crypto from "node:crypto";
import express from "express";
import multer from "multer";
import session from "express-session";
import fsp from "node:fs/promises";
import path from "node:path";
import { SUPER_ADMIN_USER } from "./admin-auth-store.mjs";
import { createAuditLog } from "./admin-audit-log.mjs";
import { getAuditLabel } from "./admin-audit-labels.mjs";
import { readWikiAdminBundle, saveWikiAdminBundle } from "./wiki-build.mjs";

const WIKI_UPLOAD_IMAGE_RE = /\.(png|jpe?g|gif|webp|svg|avif)$/i;

function extFromMime(m) {
  const map = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/pjpeg": ".jpg",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "image/avif": ".avif",
  };
  return map[String(m || "").toLowerCase()] || ".png";
}

function imageExtForUpload(file) {
  const m = String(file && file.mimetype ? file.mimetype : "").toLowerCase();
  if (m.startsWith("image/")) return extFromMime(m);
  const ext = path.extname(String((file && file.originalname) || "")).toLowerCase();
  if (ext === ".jpeg") return ".jpg";
  if (/^\.(png|jpg|gif|webp|svg|avif)$/.test(ext)) return ext;
  return ".png";
}

function sniffImageMime(buf) {
  if (!buf || buf.length < 4) return "";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8) return "image/jpeg";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "image/gif";
  if (buf.length >= 12) {
    const h = buf.toString("ascii", 0, 4);
    const mid = buf.toString("ascii", 8, 12);
    if (h === "RIFF" && mid === "WEBP") return "image/webp";
  }
  if (buf.length >= 12 && buf.toString("ascii", 4, 8) === "ftyp") {
    const br = buf.subarray(8, 16).toString("ascii");
    if (br.includes("avif") || br.includes("avis")) return "image/avif";
  }
  const t = buf.toString("utf8", 0, Math.min(512, buf.length)).trimStart();
  if (t.startsWith("<svg") || t.startsWith("<?xml")) return "image/svg+xml";
  return "";
}

export function createAdminRouter(options) {
  const { wikiDir, wikiMdPath, featuresJsonPath, joinGuideJsonPath, eventsJsonPath, staffRootPath, webDir, authStore, sessionMaxMs, auditLogPath } = options;
  const auditLog = createAuditLog(auditLogPath || "");
  const wikiDirResolved = path.resolve(
    wikiDir || (wikiMdPath ? path.dirname(path.resolve(wikiMdPath)) : path.join(path.resolve(webDir || "."), "wiki"))
  );
  const wikiUploadDir = path.join(wikiDirResolved, "uploads");
  const featuresJsonResolved = featuresJsonPath ? path.resolve(featuresJsonPath) : null;
  const joinGuideJsonResolved = joinGuideJsonPath ? path.resolve(joinGuideJsonPath) : null;
  const eventsJsonResolved = eventsJsonPath ? path.resolve(eventsJsonPath) : null;
  const staffRootResolved = staffRootPath ? path.resolve(staffRootPath) : null;
  const webDirResolved = webDir ? path.resolve(webDir) : path.resolve(path.join(wikiDirResolved, ".."));
  void fsp.mkdir(wikiUploadDir, { recursive: true }).catch(() => {});

  let sessionSecret = process.env.ADMIN_SESSION_SECRET;
  if (!sessionSecret || String(sessionSecret).length < 16) {
    process.stderr.write(
      "[admin] 请设置环境变量 ADMIN_SESSION_SECRET（至少 16 字符）；当前为随机密钥，进程重启后会话全部失效。\n"
    );
    sessionSecret = crypto.randomBytes(32).toString("hex");
  } else {
    sessionSecret = String(sessionSecret);
  }

  const router = express.Router();

  function setAdminCors(req, res) {
    const o = req.headers.origin;
    if (o) {
      res.setHeader("Access-Control-Allow-Origin", o);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      if (!res.getHeader("Vary")) {
        res.setHeader("Vary", "Origin");
      }
    }
  }

  router.use((req, res, next) => {
    if (req.method === "OPTIONS") {
      setAdminCors(req, res);
      res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, X-Upload-Name, X-Site-Asset, X-Http-Action, Authorization, Cookie"
      );
      res.setHeader("Access-Control-Max-Age", "86400");
      return res.sendStatus(204);
    }
    next();
  });

  router.use(
    session({
      name: "cs.sid",
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: sessionMaxMs,
        secure: process.env.ADMIN_COOKIE_SECURE === "1",
      },
    })
  );

  router.use((req, res, next) => {
    setAdminCors(req, res);
    next();
  });

  router.use((req, res, next) => {
    const t0 = Date.now();
    const cl = req.headers["content-length"];
    res.on("finish", () => {
      const extra = cl ? " content-length=" + cl : "";
      process.stderr.write(
        "[admin] " +
          req.ip +
          " " +
          req.method +
          " " +
          (req.originalUrl || req.url) +
          " -> " +
          res.statusCode +
          " " +
          (Date.now() - t0) +
          "ms" +
          extra +
          "\n"
      );
    });
    next();
  });

  function fullApiPath(req) {
    const b = String(req.baseUrl || "");
    const p = String(req.path || "");
    if (b + p) return b + p;
    return String(req.originalUrl || "").split("?")[0] || "";
  }

  router.use((req, res, next) => {
    const m = req.method;
    if (m === "GET" || m === "HEAD" || m === "OPTIONS") return next();
    if (m === "POST" && (req.path === "/logout" || String(req.path || "").endsWith("/logout"))) return next();
    const t0 = Date.now();
    res.on("finish", () => {
      const u = String((req.session && req.session.adminUser) || "");
      if (!u) return;
      const routePath = String(req.path || "");
      if (m === "PUT" && routePath === "/me/password") return;
      const pth = fullApiPath(req);
      if (pth.includes("/audit-logs")) return;
      const label = getAuditLabel(m, routePath);
      const ip = String((req.ip != null && req.ip) || (req.socket && req.socket.remoteAddress) || "");
      void auditLog.append({
        user: u,
        ip,
        method: m,
        path: pth,
        status: res.statusCode,
        ms: Date.now() - t0,
        op: label.op,
        summary: label.summary,
      });
    });
    next();
  });

  function requireAdmin(req, res, next) {
    if (!req.session.admin || !req.session.adminUser) {
      res.setHeader("Cache-Control", "no-store");
      return res.status(401).json({ error: "unauthorized" });
    }
    next();
  }

  function requireSuperAdmin(req, res, next) {
    if (String(req.session.adminUser || "") !== SUPER_ADMIN_USER) {
      res.setHeader("Cache-Control", "no-store");
      return res.status(403).json({ error: "需要主管理员权限" });
    }
    next();
  }

  const json64k = express.json({ limit: "64kb" });
  const jsonWiki = express.json({ limit: "12mb" });
  const jsonMid = express.json({ limit: "512kb" });
  const jsonStaffMeta = express.json({ limit: "1mb" });
  const rawUploadBody = express.raw({ limit: "32mb", type: () => true });
  const rawSiteAssetBody = express.raw({ limit: "32mb", type: () => true });

  function assertStaffMemberId(id) {
    const s = String(id || "").trim();
    if (!s || s !== path.basename(s)) throw new Error("非法成员目录");
    if (s.includes("..") || /[/\\]/.test(s)) throw new Error("非法成员目录");
    if (s.startsWith(".")) throw new Error("非法成员目录");
    if (s.length > 80) throw new Error("非法成员目录");
    if (!/^[A-Za-z0-9_-]+$/.test(s)) throw new Error("非法成员目录");
    return s;
  }

  function assertStaffFileName(name) {
    return assertWikiUploadName(name);
  }

  function assertWikiUploadName(name) {
    const s = String(name || "").trim();
    if (!s || s !== path.basename(s)) throw new Error("非法文件名");
    if (s.includes("..")) throw new Error("非法文件名");
    if (s.startsWith(".") || s.length > 120) throw new Error("非法文件名");
    if (!WIKI_UPLOAD_IMAGE_RE.test(s)) throw new Error("仅支持 png/jpg/gif/webp/svg/avif");
    return s;
  }

  router.get("/preflight", async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    try {
      const p = await authStore.preflight();
      return res.json(p);
    } catch (e) {
      return res.status(500).json({ encryptionOk: false, needsInitialSetup: false, error: String((e && e.message) || e) });
    }
  });

  router.post("/initial-setup", json64k, async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    const password = req.body && typeof req.body.password === "string" ? req.body.password : "";
    try {
      await authStore.initialSetupSuperOnly(password);
    } catch (e) {
      const msg = String((e && e.message) || e);
      const code = msg.includes("已初始化") ? 403 : 400;
      return res.status(code).json({ error: msg });
    }
    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({ error: String(err && err.message ? err.message : err) });
      }
      req.session.admin = true;
      req.session.adminUser = SUPER_ADMIN_USER;
      return res.json({ ok: true, user: SUPER_ADMIN_USER });
    });
  });

  router.get("/accounts", requireAdmin, requireSuperAdmin, async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    try {
      const users = await authStore.listUsernames();
      return res.json({ users });
    } catch (e) {
      return res.status(500).json({ error: String((e && e.message) || e) });
    }
  });

  router.post("/accounts", requireAdmin, requireSuperAdmin, json64k, async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    const user = req.body && typeof req.body.user === "string" ? req.body.user : "";
    const password = req.body && typeof req.body.password === "string" ? req.body.password : "";
    try {
      await authStore.addUser(user, password);
    } catch (e) {
      const msg = String((e && e.message) || e);
      return res.status(400).json({ error: msg });
    }
    return res.json({ ok: true });
  });

  router.put("/accounts/:name", requireAdmin, requireSuperAdmin, json64k, async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    let name = "";
    try {
      name = decodeURIComponent(String(req.params.name || "").trim());
    } catch {
      return res.status(400).json({ error: "非法账号" });
    }
    const password = req.body && typeof req.body.password === "string" ? req.body.password : "";
    try {
      await authStore.setUserPassword(name, password);
    } catch (e) {
      const msg = String((e && e.message) || e);
      return res.status(400).json({ error: msg });
    }
    return res.json({ ok: true });
  });

  router.delete("/accounts/:name", requireAdmin, requireSuperAdmin, async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    let name = "";
    try {
      name = decodeURIComponent(String(req.params.name || "").trim());
    } catch {
      return res.status(400).json({ error: "非法账号" });
    }
    try {
      await authStore.removeUser(name);
    } catch (e) {
      const msg = String((e && e.message) || e);
      const code = msg.includes("不能删除") || msg.includes("不存在") ? 400 : 500;
      return res.status(code).json({ error: msg });
    }
    return res.json({ ok: true });
  });

  router.get("/audit-logs", requireAdmin, async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    const q = req.query && req.query.limit != null ? Number(req.query.limit) : 200;
    const userQ = req.query && req.query.user != null ? String(req.query.user) : "";
    try {
      const entries = await auditLog.readLast(q, userQ);
      return res.json({ entries });
    } catch (e) {
      return res.status(500).json({ error: String((e && e.message) || e) });
    }
  });

  router.post("/login", json64k, async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    const user = req.body && typeof req.body.user === "string" ? req.body.user : "";
    const password = req.body && typeof req.body.password === "string" ? req.body.password : "";
    let ok = false;
    try {
      ok = await authStore.verifyLogin(user, password);
    } catch {
      ok = false;
    }
    if (!ok) {
      return res.status(401).json({ error: "账号或密码错误" });
    }
    const u = String(user || "").trim();
    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({ error: String(err && err.message ? err.message : err) });
      }
      req.session.admin = true;
      req.session.adminUser = u;
      return res.json({ ok: true, user: u });
    });
  });

  router.post("/logout", (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    const u = String(req.session && req.session.adminUser ? req.session.adminUser : "");
    const ip = String((req.ip != null && req.ip) || (req.socket && req.socket.remoteAddress) || "");
    const pth = fullApiPath(req);
    const label = getAuditLabel("POST", "/logout");
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: String(err && err.message ? err.message : err) });
      }
      if (u) {
        void auditLog.append({
          user: u,
          ip,
          method: "POST",
          path: pth,
          status: 200,
          op: label.op,
          summary: label.summary,
        });
      }
      return res.json({ ok: true });
    });
  });

  router.get("/session", (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    if (!req.session.admin || !req.session.adminUser) {
      return res.status(401).json({ ok: false });
    }
    const u = String(req.session.adminUser || "");
    return res.json({ ok: true, user: u, isSuper: u === SUPER_ADMIN_USER });
  });

  router.head("/session", (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    if (!req.session.admin || !req.session.adminUser) {
      return res.status(401).end();
    }
    return res.status(200).end();
  });

  router.put("/me/password", requireAdmin, json64k, async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    const t0 = Date.now();
    const me = String(req.session.adminUser || "").trim();
    const currentPassword =
      req.body && typeof req.body.currentPassword === "string" ? req.body.currentPassword : "";
    const newPassword = req.body && typeof req.body.newPassword === "string" ? req.body.newPassword : "";
    const pth = fullApiPath(req);
    const ip = String((req.ip != null && req.ip) || (req.socket && req.socket.remoteAddress) || "");
    const pwLabel = getAuditLabel("PUT", "/me/password");
    try {
      await authStore.changeOwnPassword(me, currentPassword, newPassword);
    } catch (e) {
      const msg = String((e && e.message) || e);
      const code =
        msg.includes("当前密码") || msg.includes("请填写") || msg.includes("至少") || msg.includes("缺少")
          ? 400
          : 500;
      return res.status(code).json({ error: msg });
    }
    void auditLog.append({
      user: me,
      ip,
      method: "PUT",
      path: pth,
      status: 200,
      ms: Date.now() - t0,
      op: pwLabel.op,
      summary: pwLabel.summary,
    });
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: String(err && err.message ? err.message : err) });
      }
      return res.json({ ok: true });
    });
  });

  router.get("/wiki", requireAdmin, async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    try {
      const bundle = await readWikiAdminBundle(wikiDirResolved);
      return res.json({ readme: bundle.readme, chapters: bundle.chapters });
    } catch (e) {
      return res.status(500).json({ error: String(e && e.message ? e.message : e) });
    }
  });

  const putWiki = async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    try {
      const body = req.body;
      if (!body || typeof body.readme !== "string" || !Array.isArray(body.chapters)) {
        return res.status(400).json({ error: "missing readme 或 chapters" });
      }
      await saveWikiAdminBundle(wikiDirResolved, { readme: body.readme, chapters: body.chapters });
      return res.json({ ok: true });
    } catch (e) {
      const msg = String(e && e.message ? e.message : e);
      return res.status(400).json({ error: msg });
    }
  };
  router.put("/wiki", requireAdmin, jsonWiki, putWiki);
  router.post("/wiki", requireAdmin, jsonWiki, putWiki);

  router.get("/wiki-uploads", requireAdmin, async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    try {
      await fsp.mkdir(wikiUploadDir, { recursive: true });
      const names = await fsp.readdir(wikiUploadDir);
      const files = names
        .filter((n) => n && !n.startsWith(".") && WIKI_UPLOAD_IMAGE_RE.test(n))
        .sort((a, b) => a.localeCompare(b, "en"))
        .map((name) => ({ name, repoPath: `web/wiki/uploads/${name}` }));
      return res.json({ files });
    } catch (e) {
      return res.status(500).json({ error: String(e && e.message ? e.message : e) });
    }
  });

  const uploadImage = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 32 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
      const m = String(file.mimetype || "").toLowerCase();
      if (m.startsWith("image/")) return cb(null, true);
      if (m === "application/octet-stream" || m === "") {
        const ext = path.extname(String(file.originalname || "")).toLowerCase();
        if (/^\.(png|jpe?g|gif|webp|svg|avif)$/.test(ext)) return cb(null, true);
      }
      cb(new Error("仅支持图片"));
    },
  });

  router.post("/wiki-uploads/upload", requireAdmin, (req, res, next) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    const tUp = Date.now();
    process.stderr.write("[admin] upload enter\n");
    req.once("aborted", () => {
      process.stderr.write("[admin] upload req.aborted after " + (Date.now() - tUp) + "ms\n");
    });
    req.once("error", (e) => {
      process.stderr.write("[admin] upload req.error " + String(e && e.message ? e.message : e) + "\n");
    });
    uploadImage.single("file")(req, res, (err) => {
      process.stderr.write(
        "[admin] upload multer " +
          (Date.now() - tUp) +
          "ms err=" +
          (err ? String(err.message || err.name || err) : "null") +
          " bytes=" +
          (req.file && req.file.buffer ? req.file.buffer.length : 0) +
          "\n"
      );
      if (err) {
        if (err.name === "MulterError") {
          const msg =
            err.code === "LIMIT_FILE_SIZE"
              ? "文件超过 32MB 上限"
              : err.code === "LIMIT_UNEXPECTED_FILE"
                ? "请单文件上传，表单字段名须为 file"
                : String(err.message || err.code || err);
          return res.status(400).json({ error: msg });
        }
        return next(err);
      }
      if (!req.file || !req.file.buffer) return res.status(400).json({ error: "未选择文件" });
      const name = crypto.randomBytes(8).toString("hex") + imageExtForUpload(req.file);
      if (!WIKI_UPLOAD_IMAGE_RE.test(name)) return res.status(400).json({ error: "无效文件" });
      fsp
        .mkdir(wikiUploadDir, { recursive: true })
        .then(() => fsp.writeFile(path.join(wikiUploadDir, name), req.file.buffer))
        .then(() => res.json({ name, repoPath: `web/wiki/uploads/${name}` }))
        .catch((e) => next(e));
    });
  });

  router.post("/wiki-uploads/upload-bin", requireAdmin, rawUploadBody, async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    try {
      const buf = req.body;
      if (!Buffer.isBuffer(buf) || !buf.length) return res.status(400).json({ error: "空文件" });
      let mime = String(req.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
      if (!mime.startsWith("image/")) mime = sniffImageMime(buf);
      if (!mime || !mime.startsWith("image/")) return res.status(400).json({ error: "仅支持图片" });
      let origName = "";
      try {
        origName = decodeURIComponent(String(req.headers["x-upload-name"] || ""));
      } catch {}
      origName = String(origName).slice(0, 200) || "image";
      const name =
        crypto.randomBytes(8).toString("hex") +
        imageExtForUpload({ mimetype: mime, originalname: origName });
      if (!WIKI_UPLOAD_IMAGE_RE.test(name)) return res.status(400).json({ error: "无效文件" });
      await fsp.mkdir(wikiUploadDir, { recursive: true });
      await fsp.writeFile(path.join(wikiUploadDir, name), buf);
      return res.json({ name, repoPath: `web/wiki/uploads/${name}` });
    } catch (e) {
      return res.status(500).json({ error: String((e && e.message) || e) });
    }
  });

  const deleteWikiUploadItem = async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    try {
      const name = assertWikiUploadName(req.body && req.body.name);
      await fsp.unlink(path.join(wikiUploadDir, name));
      return res.json({ ok: true });
    } catch (e) {
      if (e && e.code === "ENOENT") return res.status(404).json({ error: "文件不存在" });
      const msg = String((e && e.message) || e);
      if (msg.includes("非法") || msg.includes("仅支持")) return res.status(400).json({ error: msg });
      return res.status(500).json({ error: msg });
    }
  };
  const patchWikiUploadItem = async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    try {
      const from = assertWikiUploadName(req.body && req.body.from);
      const to = assertWikiUploadName(req.body && req.body.to);
      if (from === to) return res.json({ ok: true, name: to, repoPath: `web/wiki/uploads/${to}` });
      const fromAbs = path.join(wikiUploadDir, from);
      const toAbs = path.join(wikiUploadDir, to);
      try {
        await fsp.access(toAbs);
        return res.status(409).json({ error: "目标文件名已存在" });
      } catch {}
      await fsp.rename(fromAbs, toAbs);
      return res.json({ ok: true, name: to, repoPath: `web/wiki/uploads/${to}` });
    } catch (e) {
      if (e && e.code === "ENOENT") return res.status(404).json({ error: "源文件不存在" });
      const msg = String((e && e.message) || e);
      if (msg.includes("非法") || msg.includes("仅支持")) return res.status(400).json({ error: msg });
      return res.status(500).json({ error: msg });
    }
  };
  router.delete("/wiki-uploads/item", requireAdmin, json64k, deleteWikiUploadItem);
  router.post("/wiki-uploads/item-delete", requireAdmin, json64k, deleteWikiUploadItem);
  router.patch("/wiki-uploads/item", requireAdmin, json64k, patchWikiUploadItem);
  router.post("/wiki-uploads/item-rename", requireAdmin, json64k, patchWikiUploadItem);

  if (featuresJsonResolved) {
    router.get("/features", requireAdmin, async (req, res) => {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      try {
        let content = "";
        try {
          content = await fsp.readFile(featuresJsonResolved, "utf8");
        } catch {}
        return res.json({ content });
      } catch (e) {
        return res.status(500).json({ error: String((e && e.message) || e) });
      }
    });

    const putFeatures = async (req, res) => {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      try {
        const body = req.body;
        if (!body || typeof body.content !== "string") {
          return res.status(400).json({ error: "missing content" });
        }
        JSON.parse(String(body.content).replace(/^\uFEFF/, ""));
        await fsp.mkdir(path.dirname(featuresJsonResolved), { recursive: true });
        await fsp.writeFile(featuresJsonResolved, body.content, "utf8");
        return res.json({ ok: true });
      } catch (e) {
        if (e instanceof SyntaxError) {
          return res.status(400).json({ error: "不是合法 JSON：" + String((e && e.message) || e) });
        }
        return res.status(500).json({ error: String((e && e.message) || e) });
      }
    };
    router.put("/features", requireAdmin, jsonMid, putFeatures);
    router.post("/features", requireAdmin, jsonMid, putFeatures);
  }

  if (joinGuideJsonResolved) {
    router.get("/join-guide", requireAdmin, async (req, res) => {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      try {
        let content = "";
        try {
          content = await fsp.readFile(joinGuideJsonResolved, "utf8");
        } catch {}
        return res.json({ content });
      } catch (e) {
        return res.status(500).json({ error: String((e && e.message) || e) });
      }
    });

    const putJoinGuide = async (req, res) => {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      try {
        const body = req.body;
        if (!body || typeof body.content !== "string") {
          return res.status(400).json({ error: "missing content" });
        }
        JSON.parse(String(body.content).replace(/^\uFEFF/, ""));
        await fsp.mkdir(path.dirname(joinGuideJsonResolved), { recursive: true });
        await fsp.writeFile(joinGuideJsonResolved, body.content, "utf8");
        return res.json({ ok: true });
      } catch (e) {
        if (e instanceof SyntaxError) {
          return res.status(400).json({ error: "不是合法 JSON：" + String((e && e.message) || e) });
        }
        return res.status(500).json({ error: String((e && e.message) || e) });
      }
    };
    router.put("/join-guide", requireAdmin, jsonMid, putJoinGuide);
    router.post("/join-guide", requireAdmin, jsonMid, putJoinGuide);
  }

  if (eventsJsonResolved) {
    router.get("/events", requireAdmin, async (req, res) => {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      try {
        let content = "";
        try {
          content = await fsp.readFile(eventsJsonResolved, "utf8");
        } catch {}
        return res.json({ content });
      } catch (e) {
        return res.status(500).json({ error: String((e && e.message) || e) });
      }
    });

    const putEvents = async (req, res) => {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      try {
        const body = req.body;
        if (!body || typeof body.content !== "string") {
          return res.status(400).json({ error: "missing content" });
        }
        JSON.parse(String(body.content).replace(/^\uFEFF/, ""));
        await fsp.mkdir(path.dirname(eventsJsonResolved), { recursive: true });
        await fsp.writeFile(eventsJsonResolved, body.content, "utf8");
        return res.json({ ok: true });
      } catch (e) {
        if (e instanceof SyntaxError) {
          return res.status(400).json({ error: "不是合法 JSON：" + String((e && e.message) || e) });
        }
        return res.status(500).json({ error: String((e && e.message) || e) });
      }
    };
    router.put("/events", requireAdmin, jsonMid, putEvents);
    router.post("/events", requireAdmin, jsonMid, putEvents);
  }

  if (staffRootResolved) {
    router.get("/staff/list", requireAdmin, async (req, res) => {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      try {
        const names = await fsp.readdir(staffRootResolved, { withFileTypes: true });
        const members = [];
        for (const d of names) {
          if (!d.isDirectory() || d.name.startsWith(".")) continue;
          if (d.name === "_template") continue;
          let order = 1_000_000;
          let displayName = d.name;
          try {
            const raw = (await fsp.readFile(path.join(staffRootResolved, d.name, "meta.json"), "utf8")).replace(/^\uFEFF/, "");
            const meta = JSON.parse(raw);
            if (meta && typeof meta === "object" && !Array.isArray(meta)) {
              if (typeof meta.order === "number" && Number.isFinite(meta.order)) order = meta.order;
              const nm = meta.name != null ? String(meta.name).trim() : "";
              if (nm) displayName = nm;
            }
          } catch {}
          members.push({ id: d.name, order, displayName });
        }
        members.sort((a, b) => {
          const d = a.order - b.order;
          if (d !== 0) return d;
          return String(a.id).localeCompare(String(b.id), "en");
        });
        return res.json({ members });
      } catch (e) {
        return res.status(500).json({ error: String((e && e.message) || e) });
      }
    });

    router.post("/staff", requireAdmin, json64k, async (req, res) => {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      try {
        const rawId = req.body && typeof req.body.id === "string" ? req.body.id.trim() : "";
        if (!rawId) return res.status(400).json({ error: "缺少 id" });
        const id = assertStaffMemberId(rawId);
        if (id === "_template") return res.status(400).json({ error: "不能使用 _template 作为目录名" });
        const dir = path.join(staffRootResolved, id);
        try {
          await fsp.access(dir);
          return res.status(409).json({ error: "目录已存在" });
        } catch {}
        let metaBody =
          '{\n  "order": 100,\n  "name": "新成员",\n  "title": "",\n  "bio": "",\n  "color": "#EA323C",\n  "headFile": "head.png",\n  "portraitFile": "portrait.png"\n}\n';
        try {
          metaBody = await fsp.readFile(path.join(staffRootResolved, "_template", "meta.json"), "utf8");
        } catch {}
        await fsp.mkdir(dir, { recursive: true });
        await fsp.writeFile(path.join(dir, "meta.json"), metaBody, "utf8");
        return res.json({ ok: true, id });
      } catch (e) {
        const msg = String((e && e.message) || e);
        if (msg.includes("非法")) return res.status(400).json({ error: msg });
        return res.status(500).json({ error: msg });
      }
    });

    const deleteStaffDir = async (req, res) => {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      try {
        const id = assertStaffMemberId(req.params.memberId);
        if (id === "_template") return res.status(400).json({ error: "不能删除 _template" });
        const dir = path.join(staffRootResolved, id);
        await fsp.rm(dir, { recursive: true, force: true });
        return res.json({ ok: true });
      } catch (e) {
        if (e && e.code === "ENOENT") return res.status(404).json({ error: "成员目录不存在" });
        const msg = String((e && e.message) || e);
        if (msg.includes("非法")) return res.status(400).json({ error: msg });
        return res.status(500).json({ error: msg });
      }
    };
    router.delete("/staff/:memberId", requireAdmin, deleteStaffDir);
    router.post("/staff/:memberId/delete", requireAdmin, deleteStaffDir);

    router.get("/staff/:memberId", requireAdmin, async (req, res) => {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      try {
        const id = assertStaffMemberId(req.params.memberId);
        const dir = path.join(staffRootResolved, id);
        const st = await fsp.stat(dir);
        if (!st.isDirectory()) return res.status(404).json({ error: "成员目录不存在" });
        let metaText = "";
        try {
          metaText = await fsp.readFile(path.join(dir, "meta.json"), "utf8");
        } catch {
          metaText = "";
        }
        const all = await fsp.readdir(dir);
        const files = all
          .filter((n) => n && !n.startsWith(".") && n !== "meta.json" && WIKI_UPLOAD_IMAGE_RE.test(n))
          .sort((a, b) => a.localeCompare(b, "en"));
        return res.json({ id, metaText, files });
      } catch (e) {
        const msg = String((e && e.message) || e);
        if (msg.includes("非法")) return res.status(400).json({ error: msg });
        if (e && e.code === "ENOENT") return res.status(404).json({ error: "成员目录不存在" });
        return res.status(500).json({ error: msg });
      }
    });

    const saveStaffMeta = async (req, res) => {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      try {
        const id = assertStaffMemberId(req.params.memberId);
        const body = req.body;
        if (!body || typeof body.content !== "string") {
          return res.status(400).json({ error: "missing content" });
        }
        const text = String(body.content).replace(/^\uFEFF/, "");
        JSON.parse(text);
        const dir = path.join(staffRootResolved, id);
        await fsp.mkdir(dir, { recursive: true });
        await fsp.writeFile(path.join(dir, "meta.json"), text, "utf8");
        return res.json({ ok: true });
      } catch (e) {
        if (e instanceof SyntaxError) {
          return res.status(400).json({ error: "不是合法 JSON：" + String((e && e.message) || e) });
        }
        if (e && (e.code === "EACCES" || e.code === "EPERM")) {
          return res
            .status(500)
            .json({ error: "无权限写入 web/staff 下文件，请检查服务进程用户与目录权限" });
        }
        const msg = String((e && e.message) || e);
        if (msg.includes("非法")) return res.status(400).json({ error: msg });
        return res.status(500).json({ error: msg });
      }
    };
    router.put("/staff/:memberId/meta", requireAdmin, jsonStaffMeta, saveStaffMeta);
    router.post("/staff/:memberId/meta", requireAdmin, jsonStaffMeta, saveStaffMeta);

    router.post("/staff/:memberId/upload-bin", requireAdmin, rawUploadBody, async (req, res) => {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      try {
        const id = assertStaffMemberId(req.params.memberId);
        const buf = req.body;
        if (!Buffer.isBuffer(buf) || !buf.length) return res.status(400).json({ error: "空文件" });
        let mime = String(req.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
        if (!mime.startsWith("image/")) mime = sniffImageMime(buf);
        if (!mime || !mime.startsWith("image/")) return res.status(400).json({ error: "仅支持图片" });
        let origName = "";
        try {
          origName = decodeURIComponent(String(req.headers["x-upload-name"] || ""));
        } catch {}
        let base = path.basename(String(origName).replace(/\\/g, "/").slice(0, 200)) || "image.png";
        if (!base || base === ".") base = "image.png";
        let name = base;
        if (!WIKI_UPLOAD_IMAGE_RE.test(name)) {
          const stem = base.includes(".") ? base.slice(0, base.lastIndexOf(".")) : base;
          name = (stem || "image") + imageExtForUpload({ mimetype: mime, originalname: base });
        }
        name = assertStaffFileName(name);
        const dir = path.join(staffRootResolved, id);
        await fsp.mkdir(dir, { recursive: true });
        await fsp.writeFile(path.join(dir, name), buf);
        return res.json({ name, repoPath: `web/staff/${id}/${name}` });
      } catch (e) {
        const msg = String((e && e.message) || e);
        if (msg.includes("非法") || msg.includes("仅支持")) return res.status(400).json({ error: msg });
        return res.status(500).json({ error: msg });
      }
    });

  }

  router.post("/site-asset", requireAdmin, rawSiteAssetBody, async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    try {
      const kind = String(req.headers["x-site-asset"] || "").toLowerCase();
      const relMap = {
        favicon: path.join("img", "favicon.png"),
        brand: path.join("img", "brand-logo.png"),
        "hero-float": path.join("img", "hero-float.png"),
      };
      if (!Object.prototype.hasOwnProperty.call(relMap, kind)) {
        return res.status(400).json({ error: "请求头 X-Site-Asset 须为 favicon、brand 或 hero-float" });
      }
      const buf = req.body;
      if (!Buffer.isBuffer(buf) || !buf.length) return res.status(400).json({ error: "空文件" });
      let mime = String(req.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
      if (!mime.startsWith("image/")) mime = sniffImageMime(buf);
      if (mime !== "image/png") {
        return res.status(400).json({ error: "仅支持 PNG（favicon.png / brand-logo.png / hero-float.png）" });
      }
      const rel = relMap[kind];
      const dest = path.join(webDirResolved, rel);
      await fsp.mkdir(path.dirname(dest), { recursive: true });
      await fsp.writeFile(dest, buf);
      return res.json({ ok: true, path: "web/" + rel.replace(/\\/g, "/") });
    } catch (e) {
      return res.status(500).json({ error: String((e && e.message) || e) });
    }
  });

  router.use((err, req, res, next) => {
    try {
      const u = req.originalUrl || req.url || "";
      const msg = err && err.stack ? err.stack : String(err);
      process.stderr.write("[admin] ERR " + req.method + " " + u + "\n" + msg + "\n");
    } catch {}
    if (res.headersSent) {
      next(err);
      return;
    }
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    if (err && err.name === "MulterError") {
      const msg =
        err.code === "LIMIT_FILE_SIZE"
          ? "文件超过 32MB 上限"
          : err.code === "LIMIT_UNEXPECTED_FILE"
            ? "请单文件上传，表单字段名须为 file"
            : String(err.message || err.code || err);
      return res.status(400).json({ error: msg });
    }
    if (err && (err.status === 413 || err.statusCode === 413 || err.type === "entity.too.large")) {
      return res.status(413).json({ error: "正文过大，请删减后重试（单文件/上传体上限约 32MB）" });
    }
    if (err instanceof SyntaxError && "body" in err) {
      return res.status(400).json({ error: "请求体不是合法 JSON" });
    }
    let code = 500;
    if (err && typeof err.status === "number" && err.status >= 400 && err.status < 600) code = err.status;
    else if (err && typeof err.statusCode === "number" && err.statusCode >= 400 && err.statusCode < 600) code = err.statusCode;
    return res.status(code).json({ error: String((err && err.message) || err) });
  });

  return router;
}
