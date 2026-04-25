# 加入指南怎么配

首页「加入指南」区块数据在 **`web/join-guide/join-guide.json`**。接口 **`GET /api/join-guide`** 与前台一致。

## JSON 结构（概要）

- **`section`**：区块主标题、副标题。
- **`serverInfo`**：一块「服务器信息」——`title` + **`rows`**（`dt` / `dd` / `code` 是否代码样式）。
- **`requirements`**：「系统要求」——同样 `title` + **`rows`**。
- **`stepsCard`**：**`title`**、**`steps`**（`title` + `body`）、**`cta`**（QQ 链接、复制地址文案、`serverIp` 等）。

## 字段说明（`rows` / `steps`）

| 字段 | 填什么 |
|------|--------|
| `dt` | 左侧标签（如「服务器地址」）。 |
| `dd` | 右侧内容。 |
| `code` | `true` 时以更偏代码样式展示 `dd`（如 IP）。 |
| `steps[].title` | 步骤小标题。 |
| `steps[].body` | 步骤说明。 |
| `cta.qqLabel` / `cta.qqUrl` | 按钮文案与 QQ 群链接。 |
| `cta.copyLabel` / `cta.serverIp` | 「复制服务器地址」类文案与要复制的 IP/域名。 |

完整嵌套以当前 `join-guide.json` 为准。

## 在管理后台里怎么改（`/admin/` → 加入指南）

1. 看 **右侧预览**（与首页同布局），**用鼠标点** 要高亮的区域。
2. 左侧出现对应编辑表单；工具栏可 **+ 服务器信息行**、**+ 系统要求行**、**+ 步骤**。
3. **保存** 写入 `join-guide.json`；**从服务端重新加载** 丢弃未保存修改。
