import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const rootReadme = `# 云星官网仓库

静态前端在 \`web/\`。本地预览：\`npm install\` 后 \`npm start\`（\`server.mjs\`）。

## 可配置模块

| 模块 | 路径 |
|------|------|
| 主页特色 Tab | \`web/features/\` |
| 团队 | \`web/staff/\` |
| 百科 | \`web/wiki/\` |

各目录内有 **README.md**。接口：\`GET /api/features\`、\`GET /api/wiki\`、\`GET /api/team\`。
`;

const staffReadme = `# Staff（团队）配置

**成员列表以 \`web/staff/team.json\` 为准**：\`GET /api/team\` 与静态页优先用该文件（合法 JSON 数组，含空数组）。仅当缺少 \`team.json\` 或解析失败时，才由各成员目录的 \`meta.json\` 汇总。

成员目录在 **\`web/staff/\`**：每人一文件夹名为默认 **id**（\`meta.json\` 可写 \`id\` 覆盖）。汇总模式下 **以下划线 \`_\` 开头**的目录不参与。

## 缓存

静态图有较长缓存；换图可强刷或改文件名并改 \`headFile\`/\`portraitFile\`。

## meta.json

| 字段 | 说明 |
|------|------|
| \`name\` | 姓名 |
| \`title\` | 职位 |
| \`bio\` | 介绍 |
| \`color\` | 主题色 |
| \`headFile\` | 小头像：仅文件名在成员目录；含 \`/\` 相对 \`web/staff/\` |
| \`portraitFile\` | 大图，规则同上 |

顺序：文件夹名字母序。参考 \`web/staff.meta.example.json\`、\`web/staff/_template/meta.json\`。
`;

const featuresReadme = `# 主页「特色」配置

编辑同目录 **\`features.json\`**。\`GET /api/features\` 读取；无 Node 时可请求 \`/features/features.json\`。

## JSON 结构

\`\`\`json
{
  "section": { "title": "", "subtitle": "" },
  "tabs": [
    {
      "label": "Tab 名",
      "title": "左栏标题",
      "body": "段落",
      "ticks": ["条目"],
      "card": { "kicker": "", "big": "", "sub": "", "variant": "alt" }
    }
  ]
}
\`\`\`

\`card.variant\` 为 \`"alt"\` 时用备用卡片样式。
`;

const wikiReadme = `# 百科配置

- **\`content.md\`**：Markdown 正文；第一个 \`##\` 之前为 hero 区。
- **\`meta.json\`**：\`nav\` 数组，\`{ id, label }\`；首项 id 用于 hero 区块，其后每项对应按顺序的每个 \`##\` 小节。

页面由 \`GET /api/wiki\` 返回 HTML；失败时用 \`partials/wiki.html\`。
`;

fs.writeFileSync(path.join(root, "README.md"), rootReadme + "\n", "utf8");
fs.writeFileSync(path.join(root, "web/staff/README.md"), staffReadme + "\n", "utf8");
fs.writeFileSync(path.join(root, "web/features/README.md"), featuresReadme + "\n", "utf8");
fs.writeFileSync(path.join(root, "web/wiki/README.md"), wikiReadme + "\n", "utf8");
console.log("ok");