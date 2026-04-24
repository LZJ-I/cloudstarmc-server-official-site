# 百科配置

- **`README.md`**（本文件）：站点的「索引」页，对应前台左侧「索引」；Markdown 正文由服务端渲染。
- **`chapters.json`**：章节列表，字段含 `id`、`title`、`slug`（小写字母/数字/短横线，勿用 `index`）、`body`（Markdown）、`order`。
- **`content.md`**：旧版单文件；若不存在 `chapters.json`，首次启动会自动迁移并生成本结构。
- 首存在 **`meta.json`** 时迁移会参考其 `nav` 与 `##` 小节对齐。

在后台 **百科** 中可编辑本索引、增删与排序章节。
