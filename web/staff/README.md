# Staff（团队）配置

**成员列表以 `web/staff/team.json` 为准**：`GET /api/team` 与静态页优先用该文件（合法 JSON 数组，含空数组）。仅当缺少 `team.json` 或解析失败时，才由各成员目录的 `meta.json` 汇总。

成员目录在 **`web/staff/`**：每人一文件夹名为默认 **id**（`meta.json` 可写 `id` 覆盖）。汇总模式下 **以下划线 `_` 开头**的目录不参与。

## 缓存

静态图有较长缓存；换图可强刷或改文件名并改 `headFile`/`portraitFile`。

## meta.json

| 字段 | 说明 |
|------|------|
| `name` | 姓名 |
| `title` | 职位 |
| `bio` | 介绍 |
| `color` | 主题色 |
| `headFile` | 小头像：仅文件名在成员目录；含 `/` 相对 `web/staff/` |
| `portraitFile` | 大图，规则同上 |

顺序：文件夹名字母序。参考 `web/staff.meta.example.json`、`web/staff/_template/meta.json`。

