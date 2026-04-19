import fs from "node:fs";
import path from "node:path";
function walk(d) {
  const out = [];
  for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (ent.name.endsWith(".jsonl")) out.push(p);
  }
  return out;
}
const root = "C:/Users/Administrator/.cursor/projects/d/agent-transcripts";
let seed = "";
for (const fp of walk(root)) {
  const lines = fs.readFileSync(fp, "utf8").split("\n");
  for (const line of lines) {
    let o;
    try { o = JSON.parse(line); } catch { continue; }
    const msg = o.message?.content;
    if (!Array.isArray(msg)) continue;
    for (const part of msg) {
      if (part?.type !== "tool_use" || part?.name !== "Write") continue;
      const inp = part.input;
      if (!inp?.path?.endsWith("/style.css") && !inp?.path?.endsWith("\\style.css")) continue;
      const c = inp.contents;
      if (typeof c === "string" && c.length > seed.length) seed = c;
    }
  }
}
console.log("seed len", seed.length);
const all = walk(root).sort();
let content = seed;
let applied = 0, skipped = 0;
for (const fp of all) {
  const lines = fs.readFileSync(fp, "utf8").split("\n");
  for (const line of lines) {
    if (!line.includes("style.css")) continue;
    let o;
    try { o = JSON.parse(line); } catch { continue; }
    const msg = o.message?.content;
    if (!Array.isArray(msg)) continue;
    for (const part of msg) {
      if (part?.type !== "tool_use" || part?.name !== "StrReplace") continue;
      const inp = part.input;
      if (!inp?.path?.includes("web/css/style.css")) continue;
      const oldS = inp.old_string;
      const newS = inp.new_string;
      if (typeof oldS !== "string" || typeof newS !== "string") continue;
      if (!content.includes(oldS)) { skipped++; continue; }
      content = content.split(oldS).join(newS);
      applied++;
    }
  }
}
console.log("final len", content.length, "applied", applied, "skipped", skipped);
fs.writeFileSync("D:/server-official-site/web/css/_replay.css", content);
