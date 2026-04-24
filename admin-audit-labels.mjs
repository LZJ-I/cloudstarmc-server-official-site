/**
 * 将管理后台 API 请求映射为中文操作说明（op：类型，summary：具体说明）
 */
export function getAuditLabel(method, routePath) {
  const m = String(method || "").toUpperCase();
  const p = String(routePath || "");
  if (p === "/login" && m === "POST") {
    return { op: "登录", summary: "登录管理后台" };
  }
  if (p === "/logout" && m === "POST") {
    return { op: "退出", summary: "退出登录" };
  }
  if (p === "/initial-setup" && m === "POST") {
    return { op: "初始化", summary: "首次设置主管理员密码" };
  }
  if (p === "/me/password" && m === "PUT") {
    return { op: "修改", summary: "修改本账号密码" };
  }
  if (p === "/wiki" && (m === "PUT" || m === "POST")) {
    return { op: "保存", summary: "保存百科 Wiki" };
  }
  if (p.startsWith("/wiki-uploads/") || p === "/wiki-uploads/item") {
    if (m === "DELETE" && (p === "/wiki-uploads/item" || p.endsWith("/wiki-uploads/item"))) {
      return { op: "删除", summary: "删除 Wiki 图库中的图片" };
    }
    if (m === "POST" && (p.includes("upload") || p.endsWith("/upload-bin"))) {
      return { op: "添加", summary: "上传 Wiki 图库图片" };
    }
    if (m === "DELETE" || p.includes("item-delete")) {
      return { op: "删除", summary: "删除 Wiki 图库中的图片" };
    }
    if (m === "PATCH" || p.includes("item-rename")) {
      return { op: "修改", summary: "重命名 Wiki 图库图片" };
    }
  }
  if (p === "/features" && (m === "PUT" || m === "POST")) {
    return { op: "保存", summary: "保存「特色」配置" };
  }
  if (p === "/join-guide" && (m === "PUT" || m === "POST")) {
    return { op: "保存", summary: "保存「加入指南」" };
  }
  if (p === "/events" && (m === "PUT" || m === "POST")) {
    return { op: "保存", summary: "保存「事件」数据" };
  }
  if (p === "/site-asset" && m === "POST") {
    return { op: "替换", summary: "上传/替换站点图（favicon/品牌/浮动图等）" };
  }
  if (p === "/staff" && m === "POST") {
    return { op: "添加", summary: "新增成员目录" };
  }
  if (m === "DELETE" && /^\/staff\/[^/]+\/?$/.test(p)) {
    return { op: "删除", summary: "删除成员目录" };
  }
  if (m === "POST" && /\/staff\/[^/]+\/delete$/.test(p)) {
    return { op: "删除", summary: "删除成员目录" };
  }
  if (m === "PUT" || m === "POST") {
    const meta = /^\/staff\/([^/]+)\/meta$/.exec(p);
    if (meta) {
      return { op: "修改", summary: "保存成员「" + safeSeg(meta[1]) + "」的 meta" };
    }
    if (/\/upload-bin$/.test(p)) {
      const mid = /^\/staff\/([^/]+)\//.exec(p);
      return { op: "添加", summary: (mid ? "成员「" + safeSeg(mid[1]) + "」" : "成员") + "上传图片" };
    }
  }
  if (m === "POST" && p === "/accounts") {
    return { op: "添加", summary: "添加管理员账号" };
  }
  if (m === "PUT" && p.startsWith("/accounts/")) {
    const name = segAfter(p, "/accounts/");
    return { op: "修改", summary: "修改管理员「" + name + "」的密码" };
  }
  if (m === "DELETE" && p.startsWith("/accounts/")) {
    const name = segAfter(p, "/accounts/");
    return { op: "删除", summary: "删除管理员「" + name + "」" };
  }
  if (m === "GET" && p === "/audit-logs") {
    return { op: "查询", summary: "查看操作记录" };
  }
  return {
    op: m || "—",
    summary: p ? m + " " + p : "请求",
  };
}

function safeSeg(s) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function segAfter(full, prefix) {
  if (!full.startsWith(prefix)) return "—";
  const rest = full.slice(prefix.length);
  const i = rest.indexOf("/");
  const seg = i === -1 ? rest : rest.slice(0, i);
  return safeSeg(seg) || "—";
}
