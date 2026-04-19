import fs from "node:fs";
import path from "node:path";

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (ent.name.endsWith(".jsonl")) out.push(p);
  }
  return out;
}

const root = "C:/Users/Administrator/.cursor/projects/d/agent-transcripts";
let best = "";
let bestLen = 0;
const files = fs.existsSync(root) ? walk(root) : [];
for (const f of files) {
  const txt = fs.readFileSync(f, "utf8");
  const needle = '"path":"server-official-site/web/css/style.css"';
  let i = 0;
  while ((i = txt.indexOf(needle, i)) !== -1) {
    const cIdx = txt.indexOf('"contents":"', i);
    if (cIdx === -1 || cIdx > i + 200) {
      i += 1;
      continue;
    }
    const start = cIdx + '"contents":"'.length;
    let j = start;
    let out = "";
    while (j < txt.length) {
      const ch = txt[j];
      if (ch === "\\" && txt[j + 1] === "n") {
        out += "\n";
        j += 2;
        continue;
      }
      if (ch === "\\" && txt[j + 1] === '"') {
        out += '"';
        j += 2;
        continue;
      }
      if (ch === "\\" && txt[j + 1] === "\\") {
        out += "\\";
        j += 2;
        continue;
      }
      if (ch === '"' && txt[j - 1] !== "\\") break;
      if (ch !== "\\") out += ch;
      j++;
    }
    if (out.length > bestLen) {
      bestLen = out.length;
      best = out;
    }
    i = j;
  }
}
console.log("transcript files", files.length, "bestLen", bestLen);
const outPath = new URL("../web/css/_recovered-from-transcript.css", import.meta.url);
if (bestLen > 500) {
  fs.writeFileSync(outPath, best);
  console.log("wrote", outPath.pathname);
} else {
  console.log("no usable Write payload found");
  process.exit(1);
}
