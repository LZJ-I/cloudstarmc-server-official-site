const fs = require("fs");
const p = "D:/server-official-site/web/index.html";
let h = fs.readFileSync(p, "utf8");
const newTeam = `<section class="section section--alt" id="team">
<div class="section__head reveal"><h2>认识我们的团队</h2><p>了解让「云星」保持运转的人们 — 布局与交互参考 <a href="https://originrealms.com/" rel="noopener noreferrer" target="_blank" style="color:var(--gold2)">Origin Realms</a> 成员区。</p></div>
<div class="team-showcase reveal" id="teamShowcase">
<div class="team-showcase__box" id="teamShowcaseBox">
<div class="team-showcase__grid">
<div class="team-showcase__copy">
<h3 id="teamCharName"></h3>
<p class="team-showcase__role" id="teamCharRole"></p>
<p class="team-showcase__bio" id="teamCharBio"></p>
</div>
<div class="team-showcase__art">
<div class="team-showcase__layers" id="teamLayers">
<div class="team-showcase__layer is-top" data-layer="0"><img alt="" decoding="async"/></div>
<div class="team-showcase__layer is-under" data-layer="1"><img alt="" decoding="async"/></div>
</div>
</div>
</div>
<div class="team-showcase__row" id="teamAvatars" role="tablist" aria-label="选择成员"></div>
<div class="team-showcase__track" aria-hidden="true"><div class="team-showcase__fill" id="teamProgressFill"></div></div>
</div>
</div>
</section>`;
h = h.replace(
  /<section class="section section--alt" id="team">[\s\S]*?<\/section>\s*<section class="section social">/,
  newTeam + "\n<section class=\"section social\">"
);
h = h.replace(
  "我们相信沟通是社区的灵魂：QQ 群与游戏内公告联动",
  "我们相信沟通是社区的灵魂：官方 QQ 群与游戏内频道联动"
);
fs.writeFileSync(p, h);
console.log("patched team html");
