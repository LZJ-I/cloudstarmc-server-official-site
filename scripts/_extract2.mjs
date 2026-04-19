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
const hits = [];
for (const fp of walk(root)) {
  const lines = fs.readFileSync(fp, "utf8").split("\n");
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    if (!line.includes('"path"') || !line.includes("style.css")) continue;
    let o;
    try { o = JSON.parse(line); } catch { continue; }
    const msg = o.message?.content;
    if (!Array.isArray(msg)) continue;
    for (const part of msg) {
      if (part?.type !== "tool_use" || part?.name !== "Write") continue;
      const inp = part.input;
      const pth = inp?.path || "";
      if (!pth.endsWith("/style.css") && !pth.endsWith("\\style.css")) continue;
      const c = inp.contents;
      if (typeof c === "string") hits.push({ len: c.length, fp, li, pth });
    }
  }
}
hits.sort((a, b) => b.len - a.len);
console.log("count", hits.length);
console.log(hits.slice(0, 10).map(h => h.len + " " + h.fp.split("\\").pop() + ":" + h.li));
