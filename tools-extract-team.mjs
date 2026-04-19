import fs from "fs";
const s = fs.readFileSync(new URL("./or.js", import.meta.url), "utf8");
const needle = "l=[{name:\"Eraze\"";
const start = s.indexOf(needle);
const sub = s.slice(start, start + 20000);
const end = sub.indexOf("}],m(\"div\",lp");
fs.writeFileSync(new URL("./team-data-snippet.txt", import.meta.url), sub.slice(2, end + 1));
