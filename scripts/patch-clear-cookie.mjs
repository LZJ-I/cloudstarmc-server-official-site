import fs from "node:fs";

const p = new URL("../server.mjs", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const s0 = fs.readFileSync(p, "utf8");
const old = `function clearSessionCookie(res, req) {
  const parts = [\`${"${"}COOKIE_NAME}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (cookieSecure(req)) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}`;
