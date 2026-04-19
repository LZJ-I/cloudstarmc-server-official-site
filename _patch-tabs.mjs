import fs from "fs";
const p = "web/js/main.js";
let text = fs.readFileSync(p, "utf8");
const old = `    var tr = track.getBoundingClientRect();
    var br = btn.getBoundingClientRect();
    var padL = parseFloat(window.getComputedStyle(track).paddingLeft) || 0;
    var x = br.left - tr.left - padL + track.scrollLeft;
    indicator.style.width = br.width + "px";
    indicator.style.transform = "translateX(" + x + "px)";`;
const neu = `    var br = btn.getBoundingClientRect();
    var x;
    if (btn.offsetParent === track.offsetParent) {
      x = btn.offsetLeft - track.offsetLeft;
    } else {
      var tr = track.getBoundingClientRect();
      var padL = parseFloat(window.getComputedStyle(track).paddingLeft) || 0;
      x = br.left - tr.left - padL + track.scrollLeft;
    }
    indicator.style.width = Math.round(br.width) + "px";
    indicator.style.transform = "translateX(" + Math.round(x) + "px)";`;
if (!text.includes(old)) {
  console.error("pattern not found");
  process.exit(1);
}
fs.writeFileSync(p, text.replace(old, neu), "utf8");
console.log("patched", p);
