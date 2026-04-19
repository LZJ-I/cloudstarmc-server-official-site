# 工作人员（staff）配置说明

成员数据在 **`web/staff/`** 下：每人一个文件夹，文件夹名即成员 **id**（也可用 `meta.json` 里的 `id` 覆盖，一般与文件夹名一致即可）。

## 目录结构

```
web/staff/
  <成员id>/
    meta.json      # 必填，成员信息
  img/             # 可选：集中放共用示例图等
```

以下划线 `_` 开头的目录（如 `_template`）不会被接口扫描。

## `meta.json` 字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | 是 | 页面显示姓名 |
| `title` | 否 | 职位或一句话 |
| `bio` | 否 | 介绍正文 |
| `role` | 否 | `admin` 或 `team`，影响标签样式 |
| `order` | 否 | 数字，越小越靠前；`/api/team` 按此排序 |
| `id` | 否 | 不写则用**上级文件夹名** |
| `headFile` | 否 | 小头像文件名，默认 `head.png` |
| `portraitFile` | 否 | 大图文件名，默认 `portrait.png` |

接口：`GET /api/team` 会合并上述目录中的 `meta.json` 为 JSON 数组。

## 图片放哪里（自行准备）

- **成员小头像**：放在 **`web/staff/<成员id>/head.png`**（若 `meta.json` 里写了 `headFile`，则文件名与之一致，仍在本目录下）。
- **成员大图**：放在 **`web/staff/<成员id>/portrait.png`**（或 `portraitFile` 指定的文件名，同目录）。
- **全站默认头像**（某人没有大图时的兜底链由前端处理）：放在 **`web/img/default-head.png`**。

浏览器访问路径对应为：

- `/staff/<id>/head.png`（或 `headFile`）
- `/staff/<id>/portrait.png`（或 `portraitFile`）
- `/img/default-head.png`

确保上述文件在磁盘上存在即可，无需脚本拉取。

参考示例键说明：`web/staff.meta.example.json`；可复制模板：`web/staff/_template/meta.json`。

