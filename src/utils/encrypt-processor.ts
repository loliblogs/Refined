/**
 * 服务端加密处理器
 * 直接处理内容字符串，使用预计算的密钥
 */

import { createCipheriv, randomBytes } from 'crypto';

import type { EncryptedPayload } from '@/types/encryption';

/**
 * 加密内容 - 使用预计算的密钥
 * "Do one thing and do it well"
 */
export function encryptContent(
  content: string,
  derivedKey: string,
  salt: string,
): EncryptedPayload {
  // AES-256-GCM 加密（自带认证）
  const keyBuffer = Buffer.from(derivedKey, 'base64');
  const nonce = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', keyBuffer, nonce);
  const encrypted = Buffer.concat([
    cipher.update(content, 'utf8'),
    cipher.final(),
    cipher.getAuthTag(),  // 16 bytes auth tag - 这就是完整性验证
  ]);

  return {
    v: 2,
    s: salt,  // salt已经是base64格式
    n: nonce.toString('base64'),
    c: encrypted.toString('base64'),  // 包含AuthTag，解密时自动验证
  };
}
