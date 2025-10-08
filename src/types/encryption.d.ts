/**
 * 加密系统类型定义
 */

export interface EncryptedPayload {
  v: 2;                    // 版本
  s: string;              // salt (base64) - 每个块都存，保证独立性
  n: string;              // nonce (base64)
  c: string;              // ciphertext + AuthTag (base64) - AES-GCM自带完整性验证
}

export interface EncryptedBlock {
  type: 'content' | 'toc' | 'mathStyle';
  data: EncryptedPayload;
}

export interface ArticleInfo {
  password: string;
  salt: string;  // 预处理好的 base64 salt
}


export interface Argon2WorkerMessage {
  type: 'DERIVE_KEY';
  password: string;
  salt: Uint8Array;
}


export interface Argon2WorkerResponseKeyDerived {
  type: 'KEY_DERIVED';
  key: Uint8Array;
}

export interface Argon2WorkerResponseError {
  type: 'ERROR';
  error: string;
}

export type Argon2WorkerResponse = Argon2WorkerResponseKeyDerived | Argon2WorkerResponseError;
