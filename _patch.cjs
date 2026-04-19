const fs = require("fs");
const p = "d:/server-official-site/server.mjs";
const lines = fs.readFileSync(p, "utf8").split(/\r?\n/);
function join(a) {
  return a.join("\n");
}
const out = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const n = i + 1;
  if (n === 7) {
    out.push('import express from "express";');
    out.push(line);
    out.push('import { createAdminRouter } from "./admin-routes.mjs";');
    continue;
  }
  if (n === 21) continue;
  if (n >= 25 && n <= 122) continue;
  if (n >= 143 && n <= 157) continue;
  out.push(line);
}
let s = join(out);
const adminMount =
  "  return crypto.timingSafeEqual(a, b);\n" +
  "}\n\n" +
  "const adminExpress = express();\n" +
  "adminExpress.disable(\"x-powered-by\");\n" +
  "adminExpress.set(\"trust proxy\", 1);\n" +
  "adminExpress.use(\n" +
  "  \"/api/admin\",\n" +
  "  createAdminRouter({\n" +
  "    wikiMdPath: WIKI_MD,\n" +
  "    verifyUser,\n" +
  "    verifyPassword,\n" +
  "    sessionMaxMs: SESSION_MAX_MS,\n" +
  "  })\n" +
  ");\n\n" +
  "const MIME";
if (!s.includes("  return crypto.timingSafeEqual(a, b);\n}\n\nconst MIME")) {
  throw new Error("anchor1 missing");
}
s = s.replace("  return crypto.timingSafeEqual(a, b);\n}\n\nconst MIME", adminMount);
const start = s.indexOf("  const adminPrefix = \"/api/admin\";");
const end = s.indexOf("  if (req.method !== \"GET\" && req.method !== \"HEAD\")");
if (start === -1 || end === -1 || end < start) throw new Error("admin block markers");
s = s.slice(0, start) + "  if (u.pathname.startsWith(\"/api/admin\")) {\n    adminExpress(req, res);\n    return;\n  }\n\n" + s.slice(end);
fs.writeFileSync(p, s);
console.log("ok lines", lines.length, "->", s.split("\n").length);