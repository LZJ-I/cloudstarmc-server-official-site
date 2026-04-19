import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const mainPath = path.join(__dirname, "../web/js/main.js");
const s = fs.readFileSync(mainPath, "utf8");
const lines = s.split(/\n/);

const teamStart = lines.findIndex((l) => l.startsWith("function initOriginTeam"));
const fetchStart = lines.findIndex((l) => l.trim().startsWith('fetch("/api/team")'));
const oldBootStart = lines.findIndex((l) => l.trim().startsWith("seedStars();"));

if (teamStart < 0 || fetchStart < 0 || oldBootStart < 0) {
  console.error("markers not found", { teamStart, fetchStart, oldBootStart });
  process.exit(1);
}

const teamHeader = `const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const OR_TEAM_TICK_MS = 8000;
const OR_TEAM_PROGRESS_STEP_MS = 80;
const OR_TEAM_XF_DONE_MS = 560;
function teamStaticJsonUrl() {
  try {
    return new URL("staff/team.json", document.baseURI).href;
  } catch (e) {
    return "/staff/team.json";
  }
}
var IMG_DEFAULT_HEAD = "/img/default-head.png";
function staffAssetUrl(memberId, file) {
  var f = String(file == null ? "" : file).replace(/\\\\/g, "/").trim();
  if (!f) return IMG_DEFAULT_HEAD;
  if (f.indexOf("/") >= 0) {
    var parts = f.split("/").filter(function (p) {
      return p && p !== "." && p !== "..";
    });
    if (!parts.length) return IMG_DEFAULT_HEAD;
    return "/staff/" + parts.map(encodeURIComponent).join("/");
  }
  if (!memberId) return IMG_DEFAULT_HEAD;
  return "/staff/" + encodeURIComponent(String(memberId)) + "/" + encodeURIComponent(f);
}
function staffHeadUrl(id, headFile) {
  return staffAssetUrl(id, headFile || "head.png");
}
function staffPortraitUrl(id, portraitFile) {
  return staffAssetUrl(id, portraitFile || "portrait.png");
}
`;

const teamBody = lines.slice(teamStart, fetchStart).join("\n");
const fetchBody = lines.slice(fetchStart, oldBootStart).join("\n");
const indented = fetchBody
  .split("\n")
  .map((l) => (l ? "  " + l : l))
  .join("\n");
const bootTeam = `export function bootTeam() {
${indented}
}
`;

const teamPath = path.join(__dirname, "../web/js/team.js");
fs.writeFileSync(teamPath, teamHeader + "\n" + teamBody + "\n" + bootTeam);

const mainHead = [
  'import { mountPartials, initRoutes } from "./routes.js";',
  'import { bootTeam } from "./team.js";',
  "",
  'const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;',
  'const QQ_GROUP_URL = "https://qm.qq.com/q/O79LWnwEAU";',
  "",
].join("\n");

const seedStart = lines.findIndex((l) => l.startsWith("function seedStars"));
if (seedStart < 0) {
  console.error("function seedStars not found");
  process.exit(1);
}
const mainMiddle = lines.slice(seedStart, teamStart).join("\n");
const newBoot = `
async function boot() {
  await mountPartials();
  initRoutes();
  seedStars();
  initNav();
  initNavMobile();
  initTabs();
  initCopyIp();
  initJoinLinks();
  observeReveals(document.querySelectorAll(".reveal"));
  var __ot = document.getElementById("orTeam");
  if (__ot) __ot.classList.add("is-visible");
  bootTeam();
}
boot();
`;

const newMain = mainHead + mainMiddle + newBoot;
fs.writeFileSync(mainPath, newMain);
console.log("ok");

