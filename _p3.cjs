const fs = require("fs");
const p = "d:/server-official-site/server.mjs";
let s = fs.readFileSync(p, "utf8");
s = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
s = s.replace(/\nconst COOKIE_NAME = "[^"]+";/, "");
s = s.replace(/\nfunction sessionSecret\(\)[\s\S]*?\nfunction verifyPassword/, "\nfunction verifyPassword");
s = s.replace(/\nasync function readBody\(req, maxBytes\) \{[\s\S]*?\n\}\n\nconst MIME/, "\n\nconst MIME");
const anchor = "  return crypto.timingSafeEqual(a, b);\n}\n\nconst MIME";
const rep =
  "  return crypto.timingSafeEqual(a, b);\n}\n\nconst adminExpress = express();\nadminExpress.disable(\"x-powered-by\");\nadminExpress.set(\"trust proxy\", 1);\nadminExpress.use(\n  \"/api/admin\",\n  createAdminRouter({\n    wikiMdPath: WIKI_MD,\n    verifyUser,\n    verifyPassword,\n    sessionMaxMs: SESSION_MAX_MS,\n  })\n);\n\nconst MIME";
if (!s.includes("const adminExpress")) {
  if (!s.includes(anchor)) throw new Error("anchor1 missing");
  s = s.replace(anchor, rep);
}
const start = s.indexOf("  const adminPrefix = \"/api/admin\";");
const end = s.indexOf("  if (req.method !== \"GET\" && req.method !== \"HEAD\")");
if (start === -1 || end === -1 || end < start) throw new Error("admin block markers missing");
s =
  s.slice(0, start) +
  "  if (u.pathname.startsWith(\"/api/admin\")) {\n    adminExpress(req, res);\n    return;\n  }\n\n" +
  s.slice(end);
fs.writeFileSync(p, s);
console.log("ok");