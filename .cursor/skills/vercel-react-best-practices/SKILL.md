---
name: vercel-react-best-practices
description: React and Next.js performance optimization guidelines from Vercel Engineering. Use when writing, reviewing, or refactoring React/Next.js code for performance, data fetching, bundle size, or load times.
license: MIT
metadata:
 author: vercel
 version: "1.0.0"
---

# Vercel React Best Practices

上游完整版约 70 条规则（含反例/正例）。本地网络异常时，用 WebFetch 按需拉取：

- 全量：`https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/react-best-practices/AGENTS.md`
- 单条：`https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/react-best-practices/rules/<rule-id>.md`（例：`async-parallel.md`）

## 优先级与前缀

| Priority | Category | Prefix |
|----------|----------|--------|
| 1 | Eliminating Waterfalls | `async-` |
| 2 | Bundle Size Optimization | `bundle-` |
| 3 | Server-Side Performance | `server-` |
| 4 | Client-Side Data Fetching | `client-` |
| 5 | Re-render Optimization | `rerender-` |
| 6 | Rendering Performance | `rendering-` |
| 7 | JavaScript Performance | `js-` |
| 8 | Advanced Patterns | `advanced-` |

## 用法

1. 先判断涉及类别，再 WebFetch 对应 `rules/*.md` 或整份 `AGENTS.md`。
2. 对照用户代码给出可改点；大文件优先只拉相关规则以省 token。

## 官方仓库

`https://github.com/vercel-labs/agent-skills` — 有 Node 时可 `npx skills add vercel-labs/agent-skills` 安装完整包（含 rules 目录）。
