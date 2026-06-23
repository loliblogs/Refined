/**
 * Argon2 密钥缓存管理 - 极简版
 * 一个函数搞定所有：有缓存返回缓存，没缓存算完存起来返回
 *
 * 缓存后端：Node 原生 node:sqlite（构建期同步访问，零额外依赖）
 * 数据库文件位于 .cache/argon2-cache.db，由 CI 的 .cache 目录缓存负责跨构建持久化。
 * 数据库内容在应用层已用 AES-256-GCM / HMAC 加密，故文件本身无需再加密。
 */

import { hash as argon2Hash } from '@node-rs/argon2';
import { z } from 'astro/zod';
import {
  SECRET_PASSWORDS,
  SECRET_ENCRYPTION_PASSWORD,
  SECRET_ENCRYPTION_SALT,
} from 'astro:env/server';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

// 环境变量校验由 astro.config.ts 的 env.schema 处理
const PasswordEntry = z.record(z.string(), z.string()).default({});
const passwordMap = PasswordEntry.parse(JSON.parse(SECRET_PASSWORDS));

const envEncryptionKey = Buffer.from(crypto.hkdfSync(
  'sha256',
  SECRET_ENCRYPTION_PASSWORD,
  SECRET_ENCRYPTION_SALT,
  Buffer.from('argon2-cache:key'),
  32,
));

const envHashTag = Buffer.from(crypto.hkdfSync(
  'sha256',
  SECRET_ENCRYPTION_PASSWORD,
  SECRET_ENCRYPTION_SALT,
  Buffer.from('argon2-cache:hash'),
  32,
));

// === SQLite 缓存层（node:sqlite，构建期同步访问）===

// 缓存条目的形状，用于把 .get() 返回的 unknown 收窄成已知类型
interface Argon2CacheRow {
  password: string;
  nonce: string;
  tag: string;
  salt: string;
  derivedKey: string;
}

function isArgon2CacheRow(row: unknown): row is Argon2CacheRow {
  return typeof row === 'object' && row !== null
    && 'password' in row && typeof row.password === 'string'
    && 'nonce' in row && typeof row.nonce === 'string'
    && 'tag' in row && typeof row.tag === 'string'
    && 'salt' in row && typeof row.salt === 'string'
    && 'derivedKey' in row && typeof row.derivedKey === 'string';
}

// 模块级单例：构建期串行访问，单连接足够，无需 WAL
const cacheDir = path.join(process.cwd(), '.cache');
fs.mkdirSync(cacheDir, { recursive: true });

const cacheDb = new DatabaseSync(path.join(cacheDir, 'argon2-cache.db'));
cacheDb.exec(`
  CREATE TABLE IF NOT EXISTS Argon2Cache (
    key        TEXT PRIMARY KEY,
    password   TEXT NOT NULL,
    nonce      TEXT NOT NULL,
    tag        TEXT NOT NULL,
    salt       TEXT NOT NULL,
    derivedKey TEXT NOT NULL
  );
`);

const selectStmt = cacheDb.prepare(
  'SELECT password, nonce, tag, salt, derivedKey FROM Argon2Cache WHERE key = ?',
);

const upsertStmt = cacheDb.prepare(`
  INSERT INTO Argon2Cache (key, password, nonce, tag, salt, derivedKey)
  VALUES (?, ?, ?, ?, ?, ?)
  ON CONFLICT(key) DO UPDATE SET
    password   = excluded.password,
    nonce      = excluded.nonce,
    tag        = excluded.tag,
    salt       = excluded.salt,
    derivedKey = excluded.derivedKey
`);

/**
 * 从缓存加载密钥
 * 早返回模式：任何步骤失败就返回 null
 */
function tryLoadFromCache(
  cacheKey: string,
  password: string,
): { derivedKey: string; salt: string } | null {
  // 读取缓存条目 - 直面错误，不玩类型把戏
  let row: Record<string, unknown> | undefined;
  try {
    row = selectStmt.get(cacheKey);
  } catch (error: unknown) {
    console.warn(`Argon2 cache read failed for ${cacheKey}:`, error);
    return null;
  }

  if (!row || !isArgon2CacheRow(row)) return null;

  // 验证密码是否匹配
  const hashedPassword = crypto.createHmac('sha256', envHashTag)
    .update(cacheKey)
    .update('\0')
    .update(password)
    .digest('hex');

  if (hashedPassword !== row.password) return null;

  // 解密缓存的密钥
  try {
    const entryDerivedKey = Buffer.from(row.derivedKey, 'base64');
    const nonce = Buffer.from(row.nonce, 'base64');
    const tag = Buffer.from(row.tag, 'base64');

    const decipher = crypto.createDecipheriv('aes-256-gcm', envEncryptionKey, nonce);
    decipher.setAuthTag(tag);
    const derivedKey = Buffer.concat([
      decipher.update(entryDerivedKey),
      decipher.final(),
    ]);

    return {
      derivedKey: derivedKey.toString('base64'),
      salt: row.salt,
    };
  } catch (error: unknown) {
    console.warn(`password match, but AES-GCM decryption failed for ${cacheKey}:`, error);
    return null;
  }
}

/**
 * 计算新的 Argon2 密钥
 */
async function computeFreshKey(
  cacheKey: string,
  password: string,
): Promise<{ derivedKey: string; salt: string; hashedPassword: string }> {
  // @node-rs/argon2 自动生成 salt，从返回的 encoded string 解析
  const encoded = await argon2Hash(password, {
    algorithm: 2,       // Argon2id
    version: 1,         // V0x13 (19)
    memoryCost: 65536,  // 64MB
    timeCost: 3,
    parallelism: 1,
    outputLen: 32,
  });

  // 解析 PHC 格式: $argon2id$v=19$m=65536,t=3,p=1$<salt>$<hash>
  const parts = encoded.split('$');
  if (!parts[4] || !parts[5]) {
    throw new Error('Invalid PHC format from argon2');
  }
  const salt = parts[4];
  const derivedKey = parts[5];

  const hashedPassword = crypto.createHmac('sha256', envHashTag)
    .update(cacheKey)
    .update('\0')
    .update(password)
    .digest('hex');

  return {
    derivedKey,
    salt,
    hashedPassword,
  };
}

/**
 * 保存到缓存
 * 单行 upsert 是微秒级同步操作，失败仅警告，不影响主流程
 */
function saveToCache(
  cacheKey: string,
  result: { derivedKey: string; salt: string; hashedPassword: string },
): void {
  // 加密密钥以保护缓存
  const nonce = crypto.randomBytes(12);
  const derivedKeyBuffer = Buffer.from(result.derivedKey, 'base64');

  const cipher = crypto.createCipheriv('aes-256-gcm', envEncryptionKey, nonce);
  const encryptedDerivedKey = Buffer.concat([
    cipher.update(derivedKeyBuffer),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  // 写入缓存，失败不影响功能
  try {
    upsertStmt.run(
      cacheKey,
      result.hashedPassword,
      nonce.toString('base64'),
      tag.toString('base64'),
      result.salt,
      encryptedDerivedKey.toString('base64'),
    );
  } catch (error: unknown) {
    console.warn(`Argon2 cache update failed for ${cacheKey}:`, error);
  }
}

/**
 * 获取或计算 argon2 密钥
 * 线性流程：先试缓存，失败就计算新的
 */
export async function getOrComputeArgon2Key(
  collection: string,
  postId: string,
): Promise<{ derivedKey: string; salt: string }> {
  const cacheKey = `${collection}:${postId}`;
  const password = passwordMap[cacheKey];
  if (!password) {
    throw new Error(`Password not found for ${cacheKey}`);
  }

  // 尝试从缓存加载
  const cached = tryLoadFromCache(cacheKey, password);
  if (cached) return cached;

  // 缓存无效，计算新密钥
  const fresh = await computeFreshKey(cacheKey, password);

  // 保存到缓存
  saveToCache(cacheKey, fresh);

  return {
    derivedKey: fresh.derivedKey,
    salt: fresh.salt,
  };
}
