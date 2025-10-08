/**
 * Argon2 密钥缓存管理 - 极简版
 * 一个函数搞定所有：有缓存返回缓存，没缓存算完存起来返回
 */

import argon2 from 'argon2';
import { z } from 'astro:content';
import { getSecret } from 'astro:env/server';
import { db, eq, Argon2Cache } from 'astro:db';
import crypto from 'node:crypto';

const PasswordEntry = z.record(z.string(), z.string()).default({});

const envPasswordMap = getSecret('SECRET_PASSWORDS') ?? '{}';
const passwordMap = PasswordEntry.parse(JSON.parse(envPasswordMap));

const envEncryptionPassword = getSecret('SECRET_ENCRYPTION_PASSWORD');
const envEncryptionSalt = getSecret('SECRET_ENCRYPTION_SALT');

if (!envEncryptionPassword || !envEncryptionSalt) {
  throw new Error('SECRET_ENCRYPTION_PASSWORD or SECRET_ENCRYPTION_SALT is not set');
}

const envEncryptionKey = Buffer.from(crypto.hkdfSync(
  'sha256',
  envEncryptionPassword,
  envEncryptionSalt,
  Buffer.from('argon2-cache:key'),
  32,
));

const envHashTag = Buffer.from(crypto.hkdfSync(
  'sha256',
  envEncryptionPassword,
  envEncryptionSalt,
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
  // 读取缓存条目
  const [entry] = await db.select().from(Argon2Cache)
    .where(eq(Argon2Cache.key, cacheKey))
    .limit(1)
    .catch((error: unknown) => {
      console.warn(`Argon2 cache read failed for ${cacheKey}:`, error);
      return [null];
    });

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
  const saltBuffer = crypto.randomBytes(32);
  const salt = saltBuffer.toString('base64');

  const derivedKey = await argon2.hash(password, {
    type: argon2.argon2id,
    salt: saltBuffer,
    memoryCost: 65536,  // 64MB
    timeCost: 3,
    parallelism: 1,
    hashLength: 32,
    raw: true,
  });

  const hashedPassword = crypto.createHmac('sha256', envHashTag)
    .update(cacheKey)
    .update('\0')
    .update(password)
    .digest('hex');

  return {
    derivedKey: derivedKey.toString('base64'),
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
