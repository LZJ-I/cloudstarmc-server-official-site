import fsp from "node:fs/promises";
import path from "node:path";

const MAX_LINE = 8192;
const TAIL_MAX_BYTES = 2 * 1024 * 1024;
const FILTER_READ_MAX = 2 * 1024 * 1024;

export function createAuditLog(auditFilePath) {
  if (!auditFilePath) {
    return {
      append: async () => {},
      readLast: async () => [],
    };
  }
  const dir = path.dirname(auditFilePath);

  async function append(entry) {
    if (!auditFilePath) return;
    const o = { ...entry, t: entry.t || new Date().toISOString() };
    let line;
    try {
      line = JSON.stringify(o);
    } catch {
      return;
    }
    if (line.length > MAX_LINE) return;
    try {
      await fsp.mkdir(dir, { recursive: true });
      await fsp.appendFile(auditFilePath, line + "\n", "utf8");
    } catch (e) {
      process.stderr.write("[admin-audit] append: " + String((e && e.message) || e) + "\n");
    }
  }

  async function readTailRaw(maxBytes) {
    const st = await fsp.stat(auditFilePath);
    if (st.size === 0) return "";
    if (st.size <= maxBytes) {
      return await fsp.readFile(auditFilePath, "utf8");
    }
    const fh = await fsp.open(auditFilePath, "r");
    try {
      const take = maxBytes;
      const buf = Buffer.alloc(take);
      const pos = st.size - take;
      const { bytesRead } = await fh.read(buf, 0, take, pos);
      let raw = buf.subarray(0, bytesRead).toString("utf8");
      const firstNl = raw.indexOf("\n");
      if (firstNl > 0) raw = raw.slice(firstNl + 1);
      return raw;
    } finally {
      await fh.close();
    }
  }

  async function readLast(limit, userFilter) {
    if (!auditFilePath) return [];
    const n = Math.min(Math.max(1, Number(limit) | 0), 1000) || 200;
    const filter = userFilter != null ? String(userFilter).trim() : "";

    try {
      const st = await fsp.stat(auditFilePath);
      if (st.size === 0) return [];
    } catch (e) {
      if (e && e.code === "ENOENT") return [];
      throw e;
    }

    if (filter) {
      let raw;
      const st = await fsp.stat(auditFilePath);
      if (st.size <= FILTER_READ_MAX) {
        raw = await fsp.readFile(auditFilePath, "utf8");
      } else {
        raw = await readTailRaw(FILTER_READ_MAX);
      }
      const lines = String(raw)
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const rows = lines
        .map((l) => {
          try {
            return JSON.parse(l);
          } catch {
            return null;
          }
        })
        .filter(Boolean)
        .filter((e) => String(e.user || "") === filter);
      return rows.slice(-n).reverse();
    }

    let raw;
    try {
      const st = await fsp.stat(auditFilePath);
      if (st.size === 0) return [];
      if (st.size > TAIL_MAX_BYTES) {
        raw = await readTailRaw(TAIL_MAX_BYTES);
      } else {
        raw = await fsp.readFile(auditFilePath, "utf8");
      }
    } catch (e) {
      if (e && e.code === "ENOENT") return [];
      throw e;
    }
    const lines = String(raw)
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const rows = lines.slice(-n).map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    });
    return rows.filter(Boolean).reverse();
  }

  return { append, readLast };
}
