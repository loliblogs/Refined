/**
 * Argon2 密钥缓存管理 - 极简版
 * 一个函数搞定所有：有缓存返回缓存，没缓存算完存起来返回
 */

import { hash as argon2Hash } from '@node-rs/argon2';
import { z } from 'astro/zod';
import {
  SECRET_PASSWORDS,
  SECRET_ENCRYPTION_PASSWORD,
  SECRET_ENCRYPTION_SALT,
} from 'astro:env/server';
import { db, eq, Argon2Cache } from 'astro:db';
import crypto from 'node:crypto';

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

/**
 * 从缓存加载密钥
 * 早返回模式：任何步骤失败就返回 null
 */
async function tryLoadFromCache(
  cacheKey: string,
  password: string,
): Promise<{ derivedKey: string; salt: string } | null> {
  // 读取缓存条目 - 直面错误，不玩类型把戏
  let results;
  try {
    results = await db.select().from(Argon2Cache)
      .where(eq(Argon2Cache.key, cacheKey))
      .limit(1);
  } catch (error: unknown) {
    console.warn(`Argon2 cache read failed for ${cacheKey}:`, error);
    return null;
  }

  const entry = results[0];
  if (!entry) return null;

  // 验证密码是否匹配
  const hashedPassword = crypto.createHmac('sha256', envHashTag)
    .update(cacheKey)
    .update('\0')
    .update(password)
    .digest('hex');

  if (hashedPassword !== entry.password) return null;

  // 解密缓存的密钥
  try {
    const entryDerivedKey = Buffer.from(entry.derivedKey, 'base64');
    const nonce = Buffer.from(entry.nonce, 'base64');
    const tag = Buffer.from(entry.tag, 'base64');

    const decipher = crypto.createDecipheriv('aes-256-gcm', envEncryptionKey, nonce);
    decipher.setAuthTag(tag);
    const derivedKey = Buffer.concat([
      decipher.update(entryDerivedKey),
      decipher.final(),
    ]);

    return {
      derivedKey: derivedKey.toString('base64'),
      salt: entry.salt,
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
 * 异步保存到缓存
 * Fire-and-forget 模式，不阻塞主流程
 */
function saveToCacheAsync(
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

  // 异步更新缓存，失败不影响功能
  void db.insert(Argon2Cache).values({
    key: cacheKey,
    password: result.hashedPassword,
    salt: result.salt,
    derivedKey: encryptedDerivedKey.toString('base64'),
    nonce: nonce.toString('base64'),
    tag: tag.toString('base64'),
  }).onConflictDoUpdate({
    target: [Argon2Cache.key],
    set: {
      password: result.hashedPassword,
      salt: result.salt,
      derivedKey: encryptedDerivedKey.toString('base64'),
      nonce: nonce.toString('base64'),
      tag: tag.toString('base64'),
    },
  }).catch((error: unknown) => {
    console.warn(`Argon2 cache update failed for ${cacheKey}:`, error);
  });
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
  const cached = await tryLoadFromCache(cacheKey, password);
  if (cached) return cached;

  // 缓存无效，计算新密钥
  const fresh = await computeFreshKey(cacheKey, password);

  // 异步保存到缓存（不阻塞）
  saveToCacheAsync(cacheKey, fresh);

  return {
    derivedKey: fresh.derivedKey,
    salt: fresh.salt,
  };
}
