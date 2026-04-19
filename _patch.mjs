const fs = require("fs");
const p = "d:/server-official-site/server.mjs";
let s = fs.readFileSync(p, "utf8");
const nl = s.includes("\r\n") ? "\r\n" : "\n";
function rep(old, neu) {
  if (!s.includes(old)) throw new Error("missing: " + old.slice(0, 60));
  s = s.split(old).join(neu);
}
rep(
  "import { marked } from \"marked\";" + nl + nl + "marked.setOptions",
  "import express from \"express\";" + nl + "import { marked } from \"marked\";" + nl + "import { createAdminRouter } from \"./admin-routes.mjs\";" + nl + nl + "marked.setOptions"
);
rep("const COOKIE_NAME = \"cs_admin\";" + nl + "const SESSION_MAX_MS", "const SESSION_MAX_MS");
const oldSession = `function sessionSecret() {
  const env = process.env.ADMIN_SESSION_SECRET;
  if (env && String(env).length >= 16) {
    return crypto.createHash("sha256").update(String(env), "utf8").digest();
  }
  return crypto.scryptSync("cloudstar-admin-session-key", "cs-admin-v1", 32);
}

function parseCookies(h) {
  const raw = h && h.cookie;
  if (!raw || typeof raw !== "string") return {};
  const out = {};
  for (const part of raw.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

function b64url(buf) {
  return buf.toString("base64").replace(/\\+/g, "-").replace(/\\//g, "_").replace(/=+$/g, "");
}

function b64urlDecode(s) {
  let t = String(s || "").replace(/-/g, "+").replace(/_/g, "/");
  while (t.length % 4) t += "=";
  return Buffer.from(t, "base64");
}

function signPayload(obj) {
  const payload = Buffer.from(JSON.stringify(obj), "utf8");
  const sig = crypto.createHmac("sha256", sessionSecret()).update(payload).digest();
  return `${b64url(payload)}.${b64url(sig)}`;
}

function verifySignedToken(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 2) return null;
  let payloadBuf;
  try {
    payloadBuf = b64urlDecode(parts[0]);
  } catch {
    return null;
  }
  let sig;
  try {
    sig = b64urlDecode(parts[1]);
  } catch {
    return null;
  }
  const expect = crypto.createHmac("sha256", sessionSecret()).update(payloadBuf).digest();
  if (sig.length !== expect.length || !crypto.timingSafeEqual(sig, expect)) return null;
  let obj;
  try {
    obj = JSON.parse(payloadBuf.toString("utf8"));
  } catch {
    return null;
  }
  if (!obj || typeof obj !== "object") return null;
  if (obj.u !== ADMIN_USER) return null;
  if (typeof obj.exp !== "number" || Date.now() > obj.exp) return null;
  return obj;
}

function cookieSecure(req) {
  if (process.env.ADMIN_COOKIE_SECURE === "1") return true;
  const xf = req.headers["x-forwarded-proto"];
  return xf === "https";
}

function setSessionCookie(res, req) {
  const exp = Date.now() + SESSION_MAX_MS;
  const token = signPayload({ u: ADMIN_USER, exp });
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.floor(SESSION_MAX_MS / 1000)}`,
  ];
  if (cookieSecure(req)) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}

function clearSessionCookie(res, req) {
  const expire = "Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
  const a = `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; ${expire}`;
  const b = `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Secure; ${expire}`;
  res.setHeader("Set-Cookie", [a, b]);
}

function readSession(req) {
  const c = parseCookies(req.headers);
  return verifySignedToken(c[COOKIE_NAME]);
}

function verifyPassword`;
if (s.includes(oldSession)) s = s.split(oldSession).join("function verifyPassword");
else throw new Error("oldSession block not found");
const readBodyBlock = `async function readBody(req, maxBytes) {
  const max = maxBytes ?? 2_000_000;
  const chunks = [];
  let n = 0;
  for await (const chunk of req) {
    n += chunk.length;
    if (n > max) {
      const err = new Error("payload too large");
      err.code = "PAYLOAD_TOO_LARGE";
      throw err;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

const MIME`;
const adminExpressBlock = `  return crypto.timingSafeEqual(a, b);
}

const adminExpress = express();
adminExpress.disable("x-powered-by");
adminExpress.set("trust proxy", 1);
adminExpress.use(
  "/api/admin",
  createAdminRouter({
    wikiMdPath: WIKI_MD,
    verifyUser,
    verifyPassword,
    sessionMaxMs: SESSION_MAX_MS,
  })
);

const MIME`;
if (s.includes(readBodyBlock)) s = s.split(readBodyBlock).join("const MIME");
else throw new Error("readBody not found");
rep(
  "  return crypto.timingSafeEqual(a, b);" + nl + "}" + nl + nl + "const MIME",
  adminExpressBlock.replace(/\n/g, nl)
);
const adminHandlers = `  const adminPrefix = "/api/admin";
  if (u.pathname.startsWith(adminPrefix) && req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    });
    res.end();
    return;
  }
  if (u.pathname === "/api/admin/login" && req.method === "POST") {`;
const adminHandlersNew = `  if (u.pathname.startsWith("/api/admin")) {
    adminExpress(req, res);
    return;
  }
  if (false) {`;
if (!s.includes(adminHandlers)) throw new Error("admin handlers anchor missing");
s = s.split(adminHandlers).join(adminHandlersNew);
const junk = `  if (false) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    try {
      const raw = await readBody(req, 65536);`;
const endAnchor = `  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405).end();
    return;
  }
  if (u.pathname === "/admin") {`;
if (!s.includes(endAnchor)) throw new Error("end anchor missing");
const i = s.indexOf(junk);
const j = s.indexOf(endAnchor);
if (i === -1) throw new Error("junk start missing");
if (j === -1 || j < i) throw new Error("bad range");
s = s.slice(0, i) + s.slice(j);
fs.writeFileSync(p, s);
console.log("patched server.mjs");