# Git 基础备忘

（整理自各发行版常见用法，用于测试代码块与列表。）

## 常用命令

| 操作 | 命令 |
|------|------|
| 查看状态 | `git status` |
| 暂存全部 | `git add -A` |
| 提交 | `git commit -m "msg"` |
| 推送 | `git push` |

## 分支

```bash
git branch          # 列出分支
git checkout -b feat/foo   # 新建并切换
```

## 撤销工作区改动（危险）

`git restore <file>` 或旧版 `git checkout -- <file>`

> 以本机 Git 版本为准，勿在生产仓库随意执行。
