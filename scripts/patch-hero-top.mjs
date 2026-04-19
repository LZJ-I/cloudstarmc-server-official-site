import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mainJs = path.join(__dirname, "..", "web", "js", "main.js");
let t = fs.readFileSync(mainJs, "utf8");

if (!t.includes("atPageTop")) {
  t = t.replace(
    "  var FEATURES_MARGIN = 64;\n  var scrolling = false;",
    `  var FEATURES_MARGIN = 64;
  var PAGE_TOP_EPS = 8;
  function atPageTop() {
    return window.scrollY <= PAGE_TOP_EPS;
  }
  var scrolling = false;`
  );
}

t = t.replace(
  "      if (!beforeFeatures() || e.deltaY <= 0) return;",
  "      if (!atPageTop() || !beforeFeatures() || e.deltaY <= 0) return;"
);

t = t.replace(
  "      if (!beforeFeatures()) return;\n      touchY = e.touches[0]",
  "      if (!atPageTop() || !beforeFeatures()) return;\n      touchY = e.touches[0]"
);

t = t.replace(
  "      if (!beforeFeatures()) return;\n      var t = e.changedTouches[0]",
  "      if (!atPageTop() || !beforeFeatures()) return;\n      var t = e.changedTouches[0]"
);

fs.writeFileSync(mainJs, t);
console.log("patched", mainJs);
