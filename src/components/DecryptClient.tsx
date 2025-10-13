/**
 * 客户端解密组件
 * 只包含逻辑，不渲染 UI（UI 由 PostPage 条件编译）
 * 重构要点：纯函数外置 + useRef 管理 worker 状态
 */

import { useEffect, useRef } from 'react';
import argon2Worker from '@/utils/argon2-worker?worker';

import type { EncryptedPayload, Argon2WorkerMessage, Argon2WorkerResponse } from '@/types/encryption';

// === 纯工具函数 ===

function base64ToUint8(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

function shakeElement(el: HTMLElement): void {
  el.classList.remove('animate-[shake_0.35s_ease-in-out]');
  void el.offsetHeight; // 强制 reflow
  el.classList.add('animate-[shake_0.35s_ease-in-out]');
}

// === 解密相关纯函数 ===

async function decryptBlock(
  key: CryptoKey,
  payload: EncryptedPayload,
): Promise<string> {
  const nonce = base64ToUint8(payload.n);
  const ciphertext = base64ToUint8(payload.c);

  // AES-GCM 解密（自动验证完整性）
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(nonce) },
    key,
    new Uint8Array(ciphertext),
  );

  return new TextDecoder().decode(decrypted);
}

function applyContentToDOM(html: string, target: HTMLElement): void {
  const range = document.createRange();
  range.selectNode(target);
  const fragment = range.createContextualFragment(html);
  target.replaceChildren(fragment);
  target.classList.remove('hidden');
  target.classList.add('animate-[fade-in_0.6s_ease-out]');
}

function applyTocToDOM(html: string, tocWrapper: HTMLElement): void {
  document.querySelector('[data-toc-placeholder]')?.remove();

  const range = document.createRange();
  range.selectNode(tocWrapper);
  const fragment = range.createContextualFragment(html);
  tocWrapper.replaceWith(fragment);

  document.getElementById('toc')?.classList.add('animate-[fade-in_0.6s_ease-out]');
}

// === React 组件 ===

export default function DecryptClient() {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // 查询 DOM 元素
    const markdownBody = document.querySelector<HTMLElement>('[data-markdown]');
    const tocWrapper = document.querySelector<HTMLElement>('[data-toc-encrypted]');
    const contentData = markdownBody?.textContent.trim() ?? null;
    const tocData = tocWrapper?.textContent.trim() ?? null;

    // 没有加密内容就退出
    if (!contentData && !tocData) return;

    const button = document.getElementById('decrypt-button') as HTMLButtonElement | null;
    const input = document.getElementById('decrypt-password') as HTMLInputElement | null;
    const inputGroup = document.getElementById('input-group');
    const errorRegion = document.getElementById('decrypt-error');
    const errorText = document.getElementById('error-text');

    let isDecrypting = false;

    // Argon2 密钥派生（访问 workerRef）
    const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
      workerRef.current ??= new argon2Worker();

      workerRef.current.postMessage({
        type: 'DERIVE_KEY',
        password,
        salt,
      } satisfies Argon2WorkerMessage);

      const hash = await new Promise<Uint8Array>((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error('Worker not initialized'));
          return;
        }

        workerRef.current.onmessage = (e: MessageEvent<Argon2WorkerResponse>) => {
          if (e.data.type === 'KEY_DERIVED') {
            resolve(e.data.key);
          } else {
            reject(new Error(e.data.error));
          }
        };

        workerRef.current.onerror = (e: ErrorEvent) => {
          workerRef.current?.terminate();
          workerRef.current = null;
          reject(new Error(e.message, { cause: e.error }));
        };
      });

      return crypto.subtle.importKey('raw', new Uint8Array(hash), 'AES-GCM', false, ['decrypt']);
    };

    // 完整解密流程
    const performDecryption = async (password: string): Promise<void> => {
      const contentPayload = contentData ? JSON.parse(contentData) as EncryptedPayload : null;
      const tocPayload = tocData ? JSON.parse(tocData) as EncryptedPayload : null;

      const firstPayload = contentPayload ?? tocPayload;
      if (!firstPayload) return;

      const salt = base64ToUint8(firstPayload.s);
      const key = await deriveKey(password, salt);

      if (contentPayload && markdownBody) {
        const html = await decryptBlock(key, contentPayload);
        applyContentToDOM(html, markdownBody);
      }

      if (tocPayload && tocWrapper) {
        const html = await decryptBlock(key, tocPayload);
        applyTocToDOM(html, tocWrapper);
      }

      window.dispatchEvent(new CustomEvent('content-decrypted'));
    };

    // UI 辅助函数
    const setBusy = (busy: boolean) => {
      const method = busy ? 'setAttribute' : 'removeAttribute';
      button?.[method]('aria-busy', 'true');
      input?.[method]('aria-busy', 'true');
    };

    const showError = (message: string) => {
      input?.setAttribute('aria-invalid', 'true');
      if (errorRegion && errorText) {
        errorText.textContent = message;
        errorRegion.classList.remove('hidden');
      }
    };

    const clearError = () => {
      input?.setAttribute('aria-invalid', 'false');
      errorRegion?.classList.add('hidden');
      if (errorText) errorText.textContent = '';
    };

    // 事件处理
    const handleDecrypt = () => {
      if (isDecrypting) return;

      const password = input?.value.trim();
      if (!password) {
        if (inputGroup) shakeElement(inputGroup);
        showError(input?.placeholder ?? '请输入密码');
        input?.focus();
        return;
      }

      isDecrypting = true;
      clearError();

      const buttonText = document.getElementById('button-text');
      const buttonLoading = document.getElementById('button-loading');

      button?.setAttribute('disabled', 'true');
      setBusy(true);
      buttonText?.classList.add('opacity-0');
      buttonLoading?.classList.remove('hidden');
      buttonLoading?.classList.add('flex');

      void performDecryption(password)
        .then(() => {
          workerRef.current?.terminate();
          workerRef.current = null;

          const panel = document.getElementById('decrypt-panel');
          panel?.classList.add('animate-[fade-out-up_0.5s_ease-out_forwards]');
          panel?.addEventListener('animationend', () => {
            panel.remove();
          }, { once: true });
        })
        .catch((err: unknown) => {
          console.error('解密失败:', err);

          button?.removeAttribute('disabled');
          setBusy(false);
          buttonText?.classList.remove('opacity-0');
          buttonLoading?.classList.add('hidden');
          buttonLoading?.classList.remove('flex');

          if (inputGroup) shakeElement(inputGroup);
          showError('密码错误或内容损坏，请重试');
          input?.focus();
          input?.select();
        })
        .finally(() => {
          isDecrypting = false;
        });
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') handleDecrypt();
    };

    button?.addEventListener('click', handleDecrypt);
    input?.addEventListener('keydown', handleKeydown);
    input?.focus();

    return () => {
      button?.removeEventListener('click', handleDecrypt);
      input?.removeEventListener('keydown', handleKeydown);
      workerRef.current?.terminate();
    };
  }, []);

  return null;
}
