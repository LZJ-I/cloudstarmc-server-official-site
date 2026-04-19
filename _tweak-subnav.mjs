import fs from "node:fs";
const p = new URL("./web/css/style.css", import.meta.url);
let t = fs.readFileSync(p, "utf8");
if (!t.includes("translate3d(-22px")) && !t.includes("translate3d(-32px")) {
  console.error("unexpected css");
  process.exit(1);
}
t = t.replace(
  `  transform: translate3d(-22px, 0, 0) scale(0.97);
  transition:
    opacity 0.2s var(--ease),
    transform 0.24s var(--ease),
    visibility 0s linear 0.24s;`,
  `  transform: translate3d(-32px, 0, 0) scale(0.96);
  transition:
    opacity 0.22s var(--ease),
    transform 0.26s var(--ease),
    visibility 0s linear 0.26s;`
);
t = t.replace(
  `  transition:
    opacity 0.3s var(--ease) 0.07s,
    transform 0.34s var(--ease) 0.07s,
    visibility 0s;`,
  `  transition:
    opacity 0.34s var(--ease) 0.1s,
    transform 0.38s var(--ease) 0.1s,
    visibility 0s;`
);
fs.writeFileSync(p, t);
console.log("ok");
