/**
 * 类型声明文件 - 让 bundle 版本复用原版类型定义
 * "Theory and practice sometimes clash. Theory loses." - Linus
 *
 * 这个文件告诉 TypeScript：
 * bundle 版本的 API 和原版完全一样，只是打包方式不同
 */

declare module 'argon2-browser/dist/argon2-bundled.min.js' {
  // 重新导出所有类型定义（仅类型，不影响运行时）
  export * from 'argon2-browser';
  export { default } from 'argon2-browser';
}
