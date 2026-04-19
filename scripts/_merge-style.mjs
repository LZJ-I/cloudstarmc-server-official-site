import fs from "node:fs";
import path from "node:path";
import url from "node:url";
const d = path.dirname(url.fileURLToPath(import.meta.url));
const out = path.join(d, "../web/css/style.css");
const names = ["style-part-a.css", "style-part-b.css", "style-part-c.css"];
let buf = "";
for (const n of names) {
  buf += fs.readFileSync(path.join(d, n), "utf8") + "\n";
}
fs.writeFileSync(out, buf, "utf8");
console.log("bytes", buf.length);
