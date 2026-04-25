# 百科怎么配

官网百科是 **目录（toc v2）+ Markdown 页面 + 可选图库**。前台读服务端根据 `toc` 与 `pages` 生成的公开数据；也可直接维护文件再启动站点。

## 落盘位置

| 路径 | 用途 |
|------|------|
| `web/wiki/toc.json` | **v2**：`categories`、`pages`（slug、所属分类、排序等） |
| `web/wiki/pages/<slug>.md` | 各页正文，Markdown |
| `web/wiki/uploads/` | 百科配图；正文里引用 `/wiki/uploads/文件名` |

## 在管理后台里怎么改（`/admin/` → 百科）

1. 左侧 **树** 选分类或页面；用 **+ 分类 / + 页面** 调整结构，**↑ ↓** 排序，**删分类 / 删页** 删除（注意删页会删对应 md，需确认）。
2. 选中页面后，大文本框里编辑 **Markdown**；首行 `# 标题` 会作为页面主标题并与侧栏一致。
3. **图库**：上传、改名（安全字符）、点图复制插入语法。
4. 点 **保存**：写回 `toc.json` 与 `pages/*.md`，并触发服务端构建百科 JSON。

**从服务端重新加载**：丢弃当前未保存编辑，重新拉取磁盘内容。

## 手工维护时注意

- 页面 **`slug`** 与文件名一致：`slug` 为 `about` → 文件必须是 `pages/about.md`。
- **顶层页**（如 about）在 toc 里 `categoryId` 为 `__wiki_top__`，与 `wiki-build.mjs` 里常量一致。
- `categories[].id`、`pages[].id` 由后台生成；手工改时勿重复，并保留合法 JSON。

更细的 slug 规则以实现代码（`wiki-build.mjs`、`admin-index.js`）为准。
