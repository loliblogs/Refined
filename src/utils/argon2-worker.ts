import argon2 from 'argon2-browser/dist/argon2-bundled.min.js';

import type { Argon2WorkerMessage, Argon2WorkerResponse } from '@/types/encryption';

self.addEventListener('message', (event: MessageEvent<Argon2WorkerMessage>) => {
  const { password, salt } = event.data;

  // 执行密集计算 - 不阻塞主线程
  argon2.hash({
    pass: password,
    salt,
    type: 2,        // argon2id
    mem: 65536,     // 64MB
    time: 3,        // 3次迭代
    parallelism: 1,
    hashLen: 32,
  }).then((result) => {
    // 返回派生密钥
    self.postMessage({
      type: 'KEY_DERIVED',
      key: result.hash,
    } satisfies Argon2WorkerResponse);
  }).catch((error: unknown) => {
    self.postMessage({
      type: 'ERROR',
      error: error instanceof Error ? error.message : '解密失败',
    } satisfies Argon2WorkerResponse);
  });
});
