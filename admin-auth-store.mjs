import crypto from "node:crypto";
import fsp from "node:fs/promises";
import path from "node:path";

const SCRYPT_SALT_BASE = "admin-user-pw-v2";
const SCRYPT_KEYLEN = 64;
const KEY_FILE = "admin-encryption.key";

/** 主管理员账号名，仅此账号可在后台添加/修改/删除其他管理员 */
export const SUPER_ADMIN_USER = "3158299835";

function encryptRecord(obj, keyBuf) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyBuf, iv);
  const plain = Buffer.from(JSON.stringify(obj), "utf8");
  const enc = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]);
}

function decryptRecord(buf, keyBuf) {
  if (buf.length < 12 + 16) throw new Error("凭据文件损坏或过短");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const dec = crypto.createDecipheriv("aes-256-gcm", keyBuf, iv);
  dec.setAuthTag(tag);
  const plain = Buffer.concat([dec.update(data), dec.final()]);
  return JSON.parse(plain.toString("utf8"));
}

function scryptDigest(password, userSaltHex) {
  const mix = Buffer.concat([Buffer.from(SCRYPT_SALT_BASE, "utf8"), Buffer.from(userSaltHex, "hex")]);
  return crypto.scryptSync(String(password), mix, SCRYPT_KEYLEN);
}

function verifyPasswordScrypt(password, userSaltHex, hashHex) {
  let h;
  try {
    h = scryptDigest(password, userSaltHex);
  } catch {
    return false;
  }
  const expected = Buffer.from(hashHex, "hex");
  if (h.length !== expected.length) return false;
  return crypto.timingSafeEqual(h, expected);
}

function assertUsername(user) {
  const u = String(user || "").trim();
  if (!u) throw new Error("缺少账号");
  if (u.length > 64) throw new Error("账号过长");
  return u;
}

function assertPasswordLen(password) {
  if (String(password || "").length < 8) throw new Error("密码至少 8 位");
}

export function createAuthStore({ dataDir }) {
  const credPath = path.join(dataDir, "admin-credentials.enc");
  const keyPath = path.join(dataDir, KEY_FILE);
  let cache = null;

  function setUserRecord(u, password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const h = scryptDigest(password, salt);
    cache.users[u] = { salt, scryptHash: h.toString("hex") };
  }
  let masterKeyBuf = null;
  let keyLogged = false;

  async function ensureMasterKey() {
    if (masterKeyBuf) return masterKeyBuf;
    const env = process.env.ADMIN_ENCRYPTION_KEY;
    if (env && String(env).length >= 16) {
      masterKeyBuf = crypto.createHash("sha256").update(String(env), "utf8").digest();
      return masterKeyBuf;
    }
    try {
      const buf = await fsp.readFile(keyPath);
      if (Buffer.isBuffer(buf) && buf.length === 32) {
        masterKeyBuf = buf;
        return masterKeyBuf;
      }
    } catch (e) {
      if (e && e.code !== "ENOENT") throw e;
    }
    masterKeyBuf = crypto.randomBytes(32);
    await fsp.mkdir(dataDir, { recursive: true });
    await fsp.writeFile(keyPath, masterKeyBuf);
    if (!keyLogged) {
      keyLogged = true;
      process.stderr.write(
        "[admin] 已生成随机数据加密密钥 " + keyPath.replace(/\\/g, "/") + "（与 admin-credentials.enc 一并备份，勿提交版本库；可选设置 ADMIN_ENCRYPTION_KEY 固定密钥）\n"
      );
    }
    return masterKeyBuf;
  }

  async function load() {
    if (cache) return cache;
    let raw;
    try {
      raw = await fsp.readFile(credPath);
    } catch (e) {
      if (e && e.code === "ENOENT") {
        cache = { v: 1, users: {} };
        return cache;
      }
      throw e;
    }
    const keyBuf = await ensureMasterKey();
    cache = decryptRecord(raw, keyBuf);
    if (!cache || typeof cache !== "object" || !cache.users || typeof cache.users !== "object") {
      cache = { v: 1, users: {} };
    }
    return cache;
  }

  async function persist() {
    const keyBuf = await ensureMasterKey();
    await fsp.mkdir(dataDir, { recursive: true });
    const buf = encryptRecord(cache, keyBuf);
    await fsp.writeFile(credPath, buf);
  }

  return {
    credPath,
    keyPath,
    SUPER_ADMIN_USER,
    async preflight() {
      try {
        const s = await load();
        const n = Object.keys(s.users).length;
        return { encryptionOk: true, needsInitialSetup: n === 0 };
      } catch (e) {
        return {
          encryptionOk: true,
          needsInitialSetup: false,
          error: String((e && e.message) || e),
        };
      }
    },
    async initialSetupSuperOnly(password) {
      assertPasswordLen(password);
      await load();
      if (Object.keys(cache.users).length > 0) {
        throw new Error("已初始化，请使用主管理员登录后添加账号");
      }
      setUserRecord(SUPER_ADMIN_USER, password);
      await persist();
    },
    async listUsernames() {
      await load();
      return Object.keys(cache.users).sort((a, b) => a.localeCompare(b, "en"));
    },
    async addUser(user, password) {
      const u = assertUsername(user);
      assertPasswordLen(password);
      await load();
      if (cache.users[u]) throw new Error("账号已存在");
      setUserRecord(u, password);
      await persist();
    },
    async setUserPassword(user, password) {
      const u = assertUsername(user);
      assertPasswordLen(password);
      await load();
      if (!cache.users[u]) throw new Error("账号不存在");
      setUserRecord(u, password);
      await persist();
    },
    async removeUser(user) {
      const u = assertUsername(user);
      if (u === SUPER_ADMIN_USER) throw new Error("不能删除主管理员");
      await load();
      if (!cache.users[u]) throw new Error("账号不存在");
      delete cache.users[u];
      await persist();
    },
    async verifyLogin(user, password) {
      const u = String(user || "").trim();
      if (!u || u.length > 64) return false;
      await load();
      const rec = cache.users[u];
      if (!rec) return false;
      return verifyPasswordScrypt(password, rec.salt, rec.scryptHash);
    },
    async changeOwnPassword(username, currentPassword, newPassword) {
      const u = assertUsername(username);
      assertPasswordLen(newPassword);
      if (String(currentPassword || "").length === 0) throw new Error("请填写当前密码");
      await load();
      const rec = cache.users[u];
      if (!rec) throw new Error("账号不存在");
      if (!verifyPasswordScrypt(currentPassword, rec.salt, rec.scryptHash)) {
        throw new Error("当前密码错误");
      }
      setUserRecord(u, newPassword);
      await persist();
    },
  };
}
