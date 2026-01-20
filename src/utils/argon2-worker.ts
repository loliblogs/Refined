import wasm from '@phi-ag/argon2/argon2.wasm?url';
import initialize from '@phi-ag/argon2/fetch';

import type Argon2 from '@phi-ag/argon2';
import { Argon2Type, Argon2Version } from '@phi-ag/argon2';
import type { Argon2WorkerMessage, Argon2WorkerResponse } from '@/types/encryption';

// 惰性初始化
let argon2Promise: Promise<Argon2> | null = null;

self.addEventListener('message', (event: MessageEvent<Argon2WorkerMessage>) => {
  const { password, salt } = event.data;

  // 首次调用时加载 WASM
  argon2Promise ??= initialize(wasm);

  argon2Promise.then((argon2) => {
    const result = argon2.tryHash(password, {
      salt,
      hashLength: 32,
      timeCost: 3,        // 3次迭代
      memoryCost: 65536,  // 64MB
      parallelism: 1,
      type: Argon2Type.Argon2id,
      version: Argon2Version.Version13,
    });

    const response: Argon2WorkerResponse = result.success
      ? { type: 'KEY_DERIVED', key: result.data.hash }
      : { type: 'ERROR', error: result.error };

    self.postMessage(response);
  }).catch((error: unknown) => {
    argon2Promise = null; // 初始化失败，允许重试
    self.postMessage({
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'WASM 初始化失败',
    } satisfies Argon2WorkerResponse);
  });
});
