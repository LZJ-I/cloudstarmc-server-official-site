# 百科配置

- **`content.md`**：Markdown 正文；第一个 `##` 之前为 hero 区。
- **`meta.json`**：`nav` 数组，`{ id, label }`；首项 id 用于 hero 区块，其后每项对应按顺序的每个 `##` 小节。

页面由 `GET /api/wiki` 返回 HTML；失败时用 `partials/wiki.html`。

