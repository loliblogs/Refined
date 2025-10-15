/**
 * 客户端解密组件
 * 重构目标：拆分 165 行 useEffect → 职责清晰的多个函数
 */

import { useEffect, useRef } from 'react';
import argon2Worker from '@/utils/argon2-worker?worker';

import type { EncryptedPayload, Argon2WorkerMessage, Argon2WorkerResponse } from '@/types/encryption';

// === 类型定义 ===

/**
 * 解密所需的 DOM 元素引用
 */
interface DecryptElements {
  // 加密内容元素
  markdownBody: HTMLElement | null;
  tocWrapper: HTMLElement | null;
  contentData: string | null;
  tocData: string | null;

  // UI 控制元素
  button: HTMLButtonElement;
  input: HTMLInputElement;
  inputGroup: HTMLElement;
  buttonText: HTMLElement;
  buttonLoading: HTMLElement;
  errorRegion: HTMLElement;
  errorText: HTMLElement;
  decryptPanel: HTMLElement;
}

/**
 * 解密 UI 状态
 */
type DecryptUIState = 'idle' | 'busy' | 'error';

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

// === DOM 查询层 ===

/**
 * 查询解密所需的所有 DOM 元素
 * @returns DecryptElements 或 null（如果没有加密内容或缺少必需元素）
 */
function queryDecryptElements(): DecryptElements | null {
  // 1. 查询加密内容
  const markdownBody = document.querySelector<HTMLElement>('[data-markdown]');
  const tocWrapper = document.querySelector<HTMLElement>('[data-toc-encrypted]');
  const contentData = markdownBody?.textContent.trim() ?? null;
  const tocData = tocWrapper?.textContent.trim() ?? null;

  // 早期退出：没有加密内容
  if (!contentData && !tocData) return null;

  // 2. 查询 UI 控制元素
  const button = document.getElementById('decrypt-button') as HTMLButtonElement | null;
  const input = document.getElementById('decrypt-password') as HTMLInputElement | null;
  const inputGroup = document.getElementById('input-group');
  const buttonText = document.getElementById('button-text');
  const buttonLoading = document.getElementById('button-loading');
  const errorRegion = document.getElementById('decrypt-error');
  const errorText = document.getElementById('error-text');
  const decryptPanel = document.getElementById('decrypt-panel');

  // 3. 验证必需元素存在
  if (!button || !input || !inputGroup || !buttonText || !buttonLoading
    || !errorRegion || !errorText || !decryptPanel) {
    console.error('DecryptClient: 缺少必需的 DOM 元素');
    return null;
  }

  return {
    markdownBody,
    tocWrapper,
    contentData,
    tocData,
    button,
    input,
    inputGroup,
    buttonText,
    buttonLoading,
    errorRegion,
    errorText,
    decryptPanel,
  };
}

// === UI 状态管理层 ===

/**
 * 统一管理解密 UI 的所有状态变化
 * 替代原有的 setBusy、showError、clearError 三个函数
 *
 * 状态本质：
 * - busy: 禁用交互
 * - error/idle: 可交互，但错误提示不同
 */
function setDecryptUIState(
  dom: DecryptElements,
  state: DecryptUIState,
  errorMsg?: string,
): void {
  const { button, input, buttonText, buttonLoading, errorRegion, errorText, inputGroup } = dom;

  if (state === 'busy') {
    // 忙碌状态：禁用所有交互
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    input.setAttribute('aria-busy', 'true');
    buttonText.classList.add('opacity-0');
    buttonLoading.classList.remove('hidden');
    buttonLoading.classList.add('flex');
    errorRegion.classList.add('hidden');
  } else {
    // 非忙碌状态：恢复交互能力（error 和 idle 的共同部分）
    button.disabled = false;
    button.removeAttribute('aria-busy');
    input.removeAttribute('aria-busy');
    buttonText.classList.remove('opacity-0');
    buttonLoading.classList.add('hidden');
    buttonLoading.classList.remove('flex');

    // 根据具体状态设置错误提示
    if (state === 'error') {
      input.setAttribute('aria-invalid', 'true');
      errorRegion.classList.remove('hidden');
      if (errorMsg) errorText.textContent = errorMsg;
      shakeElement(inputGroup);
    } else {
      // idle: 清除错误状态
      input.setAttribute('aria-invalid', 'false');
      errorRegion.classList.add('hidden');
      errorText.textContent = '';
    }
  }
}

// === 密钥派生层 ===

/**
 * 使用 Argon2 从密码派生 AES-GCM 密钥
 */
async function deriveKeyFromPassword(
  workerRef: React.RefObject<Worker | null>,
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  // 初始化 Worker（如果还没有）
  workerRef.current ??= new argon2Worker();

  // 发送密钥派生请求
  workerRef.current.postMessage({
    type: 'DERIVE_KEY',
    password,
    salt,
  } satisfies Argon2WorkerMessage);

  // 等待 Worker 响应
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

  // 导入为 CryptoKey
  return crypto.subtle.importKey('raw', new Uint8Array(hash), 'AES-GCM', false, ['decrypt']);
}

// === 解密执行层 ===

/**
 * 执行完整的解密流程
 * 注意：保持 content 和 toc 分开处理（它们的 DOM 操作不同）
 */
async function executeDecryption(
  dom: DecryptElements,
  password: string,
  workerRef: React.RefObject<Worker | null>,
): Promise<void> {
  const { contentData, tocData, markdownBody, tocWrapper } = dom;

  // 解析加密载荷
  const contentPayload = contentData ? JSON.parse(contentData) as EncryptedPayload : null;
  const tocPayload = tocData ? JSON.parse(tocData) as EncryptedPayload : null;

  const firstPayload = contentPayload ?? tocPayload;
  if (!firstPayload) return;

  // 派生密钥
  const salt = base64ToUint8(firstPayload.s);
  const key = await deriveKeyFromPassword(workerRef, password, salt);

  // 解密 content（保持原有逻辑，不抽象）
  if (contentPayload && markdownBody) {
    const html = await decryptBlock(key, contentPayload);
    applyContentToDOM(html, markdownBody);
  }

  // 解密 toc（保持原有逻辑，不抽象）
  if (tocPayload && tocWrapper) {
    const html = await decryptBlock(key, tocPayload);
    applyTocToDOM(html, tocWrapper);
  }

  // 触发解密完成事件
  window.dispatchEvent(new CustomEvent('content-decrypted'));
}

// === 成功/错误处理层 ===

/**
 * 解密成功：淡出并移除解密面板
 */
async function handleDecryptSuccess(dom: DecryptElements, workerRef: React.RefObject<Worker | null>): Promise<void> {
  const { decryptPanel } = dom;

  decryptPanel.classList.add('animate-[fade-out-up_0.5s_ease-out_forwards]');

  workerRef.current?.terminate();
  workerRef.current = null;

  await new Promise<void>((resolve) => {
    decryptPanel.addEventListener('animationend', () => {
      decryptPanel.remove();
      resolve();
    }, { once: true });
  });
}

/**
 * 解密失败：显示错误提示
 */
function handleDecryptError(dom: DecryptElements, error: unknown): void {
  console.error('解密失败:', error);

  setDecryptUIState(dom, 'error', '密码错误或内容损坏，请重试');
  dom.input.focus();
  dom.input.select();
}

/**
 * 空密码：显示提示并聚焦输入框
 */
function handleEmptyPassword(dom: DecryptElements): void {
  setDecryptUIState(dom, 'error', dom.input.placeholder || '请输入密码');
  dom.input.focus();
}

// === 解密处理器工厂 ===

/**
 * 创建解密按钮的点击处理器
 * 封装了防重复提交逻辑和完整的解密流程
 */
function createDecryptHandler(
  dom: DecryptElements,
  workerRef: React.RefObject<Worker | null>,
) {
  let isDecrypting = false;

  return () => {
    // 防止重复提交
    if (isDecrypting) return;

    // 验证密码
    const password = dom.input.value.trim();
    if (!password) {
      handleEmptyPassword(dom);
      return;
    }

    // 开始解密流程
    isDecrypting = true;
    setDecryptUIState(dom, 'busy');

    executeDecryption(dom, password, workerRef)
      .then(() => handleDecryptSuccess(dom, workerRef))
      .catch((err: unknown) => { handleDecryptError(dom, err); })
      .finally(() => {
        isDecrypting = false;
      });
  };
}

// === React 组件 ===

export default function DecryptClient() {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // 1. 查询 DOM 元素
    const dom = queryDecryptElements();
    if (!dom) return;

    // 2. 创建解密处理器
    const handleDecrypt = createDecryptHandler(dom, workerRef);

    // 3. 创建键盘处理器
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') handleDecrypt();
    };

    // 4. 绑定事件
    dom.button.addEventListener('click', handleDecrypt);
    dom.input.addEventListener('keydown', handleKeydown);
    dom.input.focus();

    // 5. 清理函数
    return () => {
      dom.button.removeEventListener('click', handleDecrypt);
      dom.input.removeEventListener('keydown', handleKeydown);
      workerRef.current?.terminate();
    };
  }, []);

  return null;
}
