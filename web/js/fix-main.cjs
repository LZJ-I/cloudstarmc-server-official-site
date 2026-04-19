const fs = require("fs");
const p = require("path").join(__dirname, "main.js");
const lines = fs.readFileSync(p, "utf8").split(/\n/);
const iSeed = lines.findIndex((l) => l.startsWith("function seedStars"));
if (iSeed < 0) { console.error("no seedStars"); process.exit(1); }
const out = lines.slice(0, 5).concat(lines.slice(iSeed));
fs.writeFileSync(p, out.join("\n"));
console.log("ok", iSeed);
