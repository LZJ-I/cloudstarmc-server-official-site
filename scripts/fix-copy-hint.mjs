import fs from "fs";
const p = new URL("../web/js/main.js", import.meta.url);
let s = fs.readFileSync(p, "utf8");
const ok =
  'hint.textContent = "\\u5df2\\u590d\\u5236\\u5230\\u526a\\u8d34\\u677f";';
const fail = 'hint.textContent = "\\u8bf7\\u624b\\u52a8\\u590d\\u5236\\uff1a" + ip;';
s = s.replace(
  /hint\.textContent = "[^"]+";(?=[\s\S]*?function showFail)/,
  ok + "\n"
);
s = s.replace(
  /hint\.textContent = "[^"]+" \+ ip;/,
  fail
);
fs.writeFileSync(p, s);
