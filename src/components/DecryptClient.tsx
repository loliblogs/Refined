/**
 * 客户端解密组件
 * 只包含逻辑，不渲染 UI（UI 由PostPage条件编译）
 * "No special cases" - Linus
 */

import { useEffect } from 'react';
import argon2Worker from '@/utils/argon2-worker?worker';

import type { EncryptedPayload, Argon2WorkerMessage, Argon2WorkerResponse } from '@/types/encryption';

export default function DecryptClient() {
  useEffect(() => {
    // 检测加密内容 - 直接从元素内容读取
    const markdownBody = document.querySelector('[data-markdown]');
    const tocWrapper = document.querySelector('[data-toc-encrypted]');

    // 获取加密数据 - JSON字符串直接作为内容
    const contentData = markdownBody?.textContent ? markdownBody.textContent.trim() : null;
    const tocData = tocWrapper?.textContent ? tocWrapper.textContent.trim() : null;

    // 没有加密内容就退出
    if (!contentData && !tocData) return;

    let worker: Worker | null = null;

    // base64 解码工具
    const base64ToUint8 = (b64: string) =>
      Uint8Array.from(atob(b64), c => c.charCodeAt(0));

    // 抖动动画工具函数
    const shakeElement = (element: HTMLElement) => {
      // 移除旧的动画类（如果存在）
      element.classList.remove('animate-[shake_0.35s_ease-in-out]');
      void element.offsetHeight; // 强制reflow
      // 添加动画类触发新动画
      element.classList.add('animate-[shake_0.35s_ease-in-out]');
      // 不需要清理 - CSS动画只播放一次
    };

    // 解密所有块
    async function decryptAll(password: string) {
      // 解析加密数据
      const contentPayload = contentData ? JSON.parse(contentData) as EncryptedPayload : null;
      const tocPayload = tocData ? JSON.parse(tocData) as EncryptedPayload : null;

      // 边界检查 - 没有加密块就直接返回
      if (!contentPayload && !tocPayload) {
        return;  // 正常情况，没有需要解密的内容
      }

      // 使用第一个payload的 salt（所有块共享同一个 salt）
      const firstPayload = contentPayload ?? tocPayload;
      if (!firstPayload) return;

      const salt = base64ToUint8(firstPayload.s);

      worker ??= new argon2Worker();

      worker.postMessage({
        type: 'DERIVE_KEY',
        password,
        salt,
      } satisfies Argon2WorkerMessage);

      const hash = await new Promise<Uint8Array>((resolve, reject) => {
        if (!worker) {
          reject(new Error('Worker not initialized'));
          return;
        }

        worker.onmessage = (e: MessageEvent<Argon2WorkerResponse>) => {
          if (e.data.type === 'KEY_DERIVED') {
            resolve(e.data.key);
          } else {
            reject(new Error(e.data.error));
          }
        };
        worker.onerror = (e: ErrorEvent) => {
          worker?.terminate();
          worker = null;
          reject(new Error(e.message, {
            cause: e.error,
          }));
        };
      });

      // 导入密钥供 WebCrypto 使用
      const key = await crypto.subtle.importKey(
        'raw',
        new Uint8Array(hash),
        'AES-GCM',
        false,
        ['decrypt'],
      );

      // 解密函数
      const decrypt = async (payload: EncryptedPayload) => {
        const nonce = base64ToUint8(payload.n);
        const ciphertext = base64ToUint8(payload.c);  // 包含AuthTag

        // AES-GCM 解密（自动验证完整性）
        // 如果数据被篡改，decrypt会抛出异常
        const decrypted = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: nonce },
          key,
          ciphertext,
        );

        return new TextDecoder().decode(decrypted);
      };

      // 恢复文章内容
      if (contentPayload && markdownBody) {
        const html = await decrypt(contentPayload);
        const range = document.createRange();
        range.selectNode(markdownBody);
        const fragment = range.createContextualFragment(html);
        markdownBody.replaceChildren(fragment);
        markdownBody.classList.remove('hidden');
        // 添加淡入动画
        markdownBody.classList.add('animate-[fade-in_0.6s_ease-out]');
      }

      // 恢复目录
      if (tocPayload && tocWrapper) {
        const html = await decrypt(tocPayload);
        // 使用 Range + DocumentFragment 安全替换整个节点
        const range = document.createRange();
        range.selectNode(tocWrapper);
        const fragment = range.createContextualFragment(html);

        // 删除占位符
        const placeholder = document.querySelector('[data-toc-placeholder]');
        placeholder?.remove();

        // 替换加密容器
        tocWrapper.replaceWith(fragment);

        // 添加淡入动画到新插入的目录
        const newToc = document.getElementById('toc');
        if (newToc) {
          newToc.classList.add('animate-[fade-in_0.6s_ease-out]');
        }
      }

      // 所有解密完成后，触发统一事件
      window.dispatchEvent(new CustomEvent('content-decrypted'));
      worker.terminate();
    }

    // 获取必要的DOM元素 - 只查询一次
    const button = document.getElementById('decrypt-button') as HTMLButtonElement | null;
    const input = document.getElementById('decrypt-password') as HTMLInputElement | null;
    const inputGroup = document.getElementById('input-group');
    const errorRegion = document.getElementById('decrypt-error');
    const errorText = document.getElementById('error-text');

    // 防抖标记
    let isDecrypting = false;

    const setBusy = (busy: boolean) => {
      if (busy) {
        button?.setAttribute('aria-busy', 'true');
        input?.setAttribute('aria-busy', 'true');
      } else {
        button?.removeAttribute('aria-busy');
        input?.removeAttribute('aria-busy');
      }
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
      if (errorRegion) {
        errorRegion.classList.add('hidden');
      }
      if (errorText) errorText.textContent = '';
    };

    const handleDecrypt = () => {
      // 防止重复提交
      if (isDecrypting) return;
      const password = input?.value.trim();
      if (!password) {
        // 抖动输入框组
        if (inputGroup) {
          shakeElement(inputGroup);
        }
        showError(input?.placeholder ?? '请输入密码');
        input?.focus();
        return;
      }

      // 开始解密，设置防抖
      isDecrypting = true;
      clearError();

      // 获取需要的DOM元素
      const buttonText = document.getElementById('button-text');
      const buttonLoading = document.getElementById('button-loading');

      // 开始解密 - 立即显示Loading
      button?.setAttribute('disabled', 'true');
      setBusy(true);
      if (buttonText) buttonText.classList.add('opacity-0');
      if (buttonLoading) {
        buttonLoading.classList.remove('hidden');
        buttonLoading.classList.add('flex'); // 显示flex布局
      }

      void decryptAll(password)
        .then(() => {
          // 解密成功 - 淡出动画后删除
          const decryptPanel = document.getElementById('decrypt-panel');
          if (decryptPanel) {
            // 添加淡出动画
            decryptPanel.classList.add('animate-[fade-out-up_0.5s_ease-out_forwards]');
            // 监听动画结束事件
            decryptPanel.addEventListener('animationend', () => {
              decryptPanel.remove();
            }, { once: true });  // 自动移除监听器
          }
        }).catch((err: unknown) => {
          console.error('解密失败:', err);

          // 恢复按钮状态
          button?.removeAttribute('disabled');
          setBusy(false);
          if (buttonText) buttonText.classList.remove('opacity-0');
          if (buttonLoading) {
            buttonLoading.classList.add('hidden');
            buttonLoading.classList.remove('flex');
          }

          // 抖动输入框组表示错误
          if (inputGroup) {
            shakeElement(inputGroup);
          }

          // 错误播报
          showError('密码错误或内容损坏，请重试');

          // 聚焦输入框并选中文本
          input?.focus();
          input?.select();
        }).finally(() => {
          // 重置防抖标记
          isDecrypting = false;
        });
    };

    // 绑定事件
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleDecrypt();
      }
    };

    button?.addEventListener('click', handleDecrypt);
    input?.addEventListener('keydown', handleKeydown);

    // 自动聚焦输入框
    input?.focus();

    // 清理函数
    return () => {
      button?.removeEventListener('click', handleDecrypt);
      input?.removeEventListener('keydown', handleKeydown);
      worker?.terminate();
    };
  }, []);

  // 不渲染任何内容 - UI由PostPage条件编译处理
  return null;
}
