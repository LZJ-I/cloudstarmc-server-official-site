# 云星官网仓库

## 文档索引

| 文档 | 说明 |
|------|------|
| [依赖与部署](依赖与部署.md) | 运行环境、npm 依赖、启动方式与上线注意点 |

---

静态前端在 `web/`。本地预览：`npm install` 后 `npm start` 或（Windows）双击 `run.bat` 启动 `server.mjs`（不自动打开浏览器，终端会打印本机地址）。

## 可配置模块

| 模块 | 路径 |
|------|------|
| 主页特色 Tab | `web/features/` |
| 团队 | `web/staff/` |
| 百科 | `web/wiki/` |

各目录内有 **README.md**。接口：`GET /api/features`、`GET /api/wiki`、`GET /api/team`。
