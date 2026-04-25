# 管理后台怎么用来配内容

在浏览器打开 **`/admin/`**，用管理员账号登录。下面每个 Tab 对应一块前台内容；保存后写入仓库里的文件（和直接改 JSON/Markdown 是同一套数据）。

## 模块一览

| Tab | 配什么 | 写入 / 说明文件 |
|-----|--------|------------------|
| **百科** | 分类、页面、正文 Markdown、图库 | `web/wiki/` · 详见 [`web/wiki/README.md`](../wiki/README.md) |
| **特色** | 首页「特色」区块标题与条目 | `web/features/features.json` · 详见 [`web/features/README.md`](../features/README.md) |
| **加入指南** | 首页加入指南各卡片与步骤 | `web/join-guide/join-guide.json` · 详见 [`web/join-guide/README.md`](../join-guide/README.md) |
| **事件** | 时间线标题与每条事件 | `web/events/events.json` · 详见 [`web/events/README.md`](../events/README.md) |
| **成员** | 成员顺序、文案、颜色、头像图 | `web/staff/<成员目录>/` · 详见 [`web/staff/README.md`](../staff/README.md) |
| **账号** | 改密码、子账号、操作审计 | 凭据在 `data/`；审计日志 `data/admin-audit.jsonl` |
| **站点图** | 站点图标与导航/Hero 用图 | `web/img/favicon.png`、`brand-logo.png`、`hero-float.png`（仅 PNG） |

## 各 Tab 操作要点（和成员区一样：先选对再保存）

### 百科

- 左侧树里选分类或页面；**+ 分类 / + 页面** 增删结构；分类可设默认展开、排序。
- 页面正文是 **Markdown**，文件落在 `web/wiki/pages/<slug>.md`；首行 `# 标题` 与侧栏一致。
- **图库** 打开对话框：上传到 `web/wiki/uploads/`，可点缩略图复制 `![…](/wiki/uploads/…)` 插入语法。
- **保存** 会更新 `toc.json`、页面文件，并由服务端生成百科对外 JSON（与前台一致）。

### 特色

- 左侧填 **区块主标题 / 副标题**，下面每条 **Tab 条目** 有标题与正文。
- 右侧 iframe 实时预览；改完点 **保存** 写入 `features.json`。

### 加入指南

- **在右侧预览里点** 要高亮的区块，左侧出现对应表单（服务器信息行、系统要求行、步骤等）。
- 工具栏可 **加行 / 加步骤**；底部 **保存** 写入 `join-guide.json`。

### 事件

- 左侧按 **年份** 浏览；右侧用 **索引** 下拉与列表对齐，展开当前一条编辑。
- **页眉** 是整块时间线区的大标题、副标题；下面列表是 **`items`**，每条有日期、标题、正文、**大事件 / 小事件**。
- **保存** 写入 `events.json`。

### 成员

- 上方列表 **添加成员** 或点一行选中；左侧编辑 **order / name / title / bio / 颜色**。
- 头像：**上传小头像 → head.png**，**上传立绘 → portrait.png**（固定文件名，覆盖即更新）。
- 与直接维护 `meta.json` + 文件夹 等价；字段说明见 [`web/staff/README.md`](../staff/README.md)。

### 账号

- 任意管理员可 **改本账号密码**、看 **操作记录**（按账号筛选）。
- **主账号** 多一块：新增 / 改密 / 删除子账号；主账号本身不可删。

### 站点图

- 三个槽位分别对应根路径 **`/img/`** 下三个 PNG；选文件即上传替换，无需再点「保存」（上传成功即生效）。

## 和「只改仓库文件」的关系

- 后台 **保存** = 改磁盘上的 JSON / Markdown / 图片；部署前照常 **提交 Git**。
- 若你更习惯编辑器，可直接改各目录文件；结构以对应 **`README.md`** 里的字段表为准，和后台写的是同一格式。
