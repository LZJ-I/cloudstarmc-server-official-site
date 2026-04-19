import crypto from "node:crypto";
import express from "express";
import multer from "multer";
import session from "express-session";
import fsp from "node:fs/promises";
import path from "node:path";

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
  const { wikiMdPath, verifyUser, verifyPassword, sessionMaxMs } = options;
  const wikiMdResolved = path.resolve(wikiMdPath);
  const wikiUploadDir = path.resolve(path.join(path.dirname(wikiMdResolved), "uploads"));
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

  router.use((req, res, next) => {
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Upload-Name");
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

  function requireAdmin(req, res, next) {
    if (!req.session.admin) {
      res.setHeader("Cache-Control", "no-store");
      return res.status(401).json({ error: "unauthorized" });
    }
    next();
  }

  const json64k = express.json({ limit: "64kb" });
  const jsonWiki = express.json({ limit: "12mb" });
  const rawUploadBody = express.raw({ limit: "8mb", type: () => true });

  router.post("/login", json64k, (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    const user = req.body && typeof req.body.user === "string" ? req.body.user : "";
    const password = req.body && typeof req.body.password === "string" ? req.body.password : "";
    if (!verifyUser(user) || !verifyPassword(password)) {
      return res.status(401).json({ error: "账号或密码错误" });
    }
    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({ error: String(err && err.message ? err.message : err) });
      }
      req.session.admin = true;
      return res.json({ ok: true });
    });
  });

  router.post("/logout", (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: String(err && err.message ? err.message : err) });
      }
      return res.json({ ok: true });
    });
  });

  router.get("/session", (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    if (!req.session.admin) {
      return res.status(401).json({ ok: false });
    }
    return res.json({ ok: true });
  });

  router.head("/session", (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    if (!req.session.admin) {
      return res.status(401).end();
    }
    return res.status(200).end();
  });

  router.get("/wiki", requireAdmin, async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    try {
      let content = "";
      try {
        content = await fsp.readFile(wikiMdResolved, "utf8");
      } catch {}
      return res.json({ content });
    } catch (e) {
      return res.status(500).json({ error: String(e && e.message ? e.message : e) });
    }
  });

  router.put("/wiki", requireAdmin, jsonWiki, async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    try {
      const body = req.body;
      if (!body || typeof body.content !== "string") {
        return res.status(400).json({ error: "missing content" });
      }
      await fsp.mkdir(path.dirname(wikiMdResolved), { recursive: true });
      await fsp.writeFile(wikiMdResolved, body.content, "utf8");
      return res.json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: String(e && e.message ? e.message : e) });
    }
  });

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

  function assertWikiUploadName(name) {
    const s = String(name || "").trim();
    if (!s || s !== path.basename(s)) throw new Error("非法文件名");
    if (s.includes("..")) throw new Error("非法文件名");
    if (s.startsWith(".") || s.length > 120) throw new Error("非法文件名");
    if (!WIKI_UPLOAD_IMAGE_RE.test(s)) throw new Error("仅支持 png/jpg/gif/webp/svg/avif");
    return s;
  }

  const uploadImage = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 8 * 1024 * 1024, files: 1 },
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
              ? "文件超过 8MB 上限"
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

  router.delete("/wiki-uploads/item", requireAdmin, json64k, async (req, res) => {
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
  });

  router.patch("/wiki-uploads/item", requireAdmin, json64k, async (req, res) => {
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
          ? "文件超过 8MB 上限"
          : err.code === "LIMIT_UNEXPECTED_FILE"
            ? "请单文件上传，表单字段名须为 file"
            : String(err.message || err.code || err);
      return res.status(400).json({ error: msg });
    }
    if (err && (err.status === 413 || err.statusCode === 413 || err.type === "entity.too.large")) {
      return res.status(413).json({ error: "正文过大，请删减后重试（上限约 12MB）" });
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
