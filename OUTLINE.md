# 云星 Minecraft 服务器官网 — 实现大纲（参考 originrealms.com 信息架构与动效节奏）

## 品牌与定位
- 名称：**云星**（副标题：下一代 Minecraft 社区体验）
- 气质：深色沉浸、金色强调、全宽分段、强 CTA

## 页面板块
1. 顶栏：Logo、锚点、主按钮；滚动后毛玻璃与细边线。
2. Hero：大标题、卖点、双按钮；云星渐变背景 + 星点；方块漂浮装饰。
3. 特色 Tab：3-4 Tab，切换淡入淡出 + 位移；内容栅格。
4. 认识成员：标题+副文案；卡片网格（头像/昵称/职位/简介）；悬停上浮光晕；stagger 入场。
5. 社交板块：Discord 文案 + CTA。
6. 页脚：版权与链接占位。

## 动效
- whileInView 分段 reveal；Tab AnimatePresence；顶栏滚动过渡；prefers-reduced-motion 降级。

## 技术
- 静态站点：`index.html` + `css/style.css` + `js/main.js`
- 本地预览：**仅** `npm run start` 或 `node server.mjs`（`server.mjs`），不使用 Python `http.server`
