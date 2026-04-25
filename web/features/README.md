# 主页「特色」怎么配

首页「特色」轮播/区块数据在 **`web/features/features.json`**。接口 **`GET /api/features`**；静态部署时可请求 **`/features/features.json`**。

## JSON 结构

```json
{
  "section": { "title": "", "subtitle": "" },
  "tabs": [
    { "title": "", "body": "" }
  ]
}
```

## 字段说明

| 字段 | 填什么 |
|------|--------|
| `section.title` | 区块 **主标题**（大屏上特色区标题）。 |
| `section.subtitle` | **副标题**，支持多行。 |
| `tabs` | 条目列表；顺序即前台展示顺序。 |
| `tabs[].title` | 单条 **Tab 标题**（切换条上的名字）。 |
| `tabs[].body` | 单条 **正文**（说明文字，可多行）。 |

## 在管理后台里怎么改（`/admin/` → 特色）

1. 左侧编辑 **区块标题 / 副标题**。
2. **添加条目** 增加 `tabs` 一项；每条填标题与正文，可在列表里调整顺序（以界面为准）。
3. 右侧 **预览 iframe** 接近前台效果；满意后点 **保存** 写入 `features.json`。
4. **从服务端重新加载** 重新拉取磁盘文件，丢弃未保存编辑。
