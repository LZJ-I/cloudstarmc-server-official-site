# 主页「特色」配置

编辑同目录 **`features.json`**。`GET /api/features` 读取；无 Node 时可请求 `/features/features.json`。

## JSON 结构

```json
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
```

`card.variant` 为 `"alt"` 时用备用卡片样式。

