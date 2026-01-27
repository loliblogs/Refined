/**
 * 站点配置类型定义
 *
 * "Good taste is about making special cases disappear into the normal case."
 * 通过类型系统强制路径格式，避免运行时检查
 */

import type { JSX } from 'preact';
import type { TransitionAnimationValue } from 'astro';

/**
 * 路径类型约束 - 编译时强制路径格式
 * 必须以 / 开头（内部路径）或是完整URL（外部链接）
 *
 * 错误示例（TypeScript会报错）：
 * menu: {
 *   '归档': 'archive',        // ❌ 没有斜杠前缀
 *   '标签': 'tag/'           // ❌ 没有斜杠前缀
 * }
 *
 * 正确示例：
 * menu: {
 *   '归档': '/archive',      // ✅ 内部路径
 *   '博客': 'https://...',   // ✅ 外部链接
 * }
 */
export type ValidPath = `/${string}` | `http://${string}` | `https://${string}` | `//${string}`;

/**
 * 导航项配置 - 支持简单字符串（向后兼容）或对象配置
 *
 * 使用示例：
 * menu: {
 *   '首页': '/',                          // 简单格式，递归匹配（默认）
 *   '关于': {                             // 对象格式，精确匹配
 *     path: '/about',
 *     recursive: false
 *   },
 *   '$\\mathcal{OI}$': {                  // LaTeX 标签需要 ariaLabel
 *     path: '/oi',
 *     ariaLabel: 'OI'
 *   }
 * }
 */
export type NavItem = ValidPath | {
  path: ValidPath;
  recursive?: boolean;  // 是否递归匹配子路径，默认true
  ariaLabel?: string;   // 无障碍标签，用于 LaTeX 等非纯文本标签
};

/**
 * 站点配置接口
 */
export interface SiteConfig {
  // ========== 站点基本信息 ==========
  title: string;                              // 站点标题
  subtitle?: string;                          // 副标题（可选）
  description: string;                        // 站点描述（SEO）
  keywords: string;                           // 关键词（SEO）

  // ========== 分页配置 ==========
  pagination: {
    index: number;                           // 首页每页文章数
    tag: number;                            // 标签页每页文章数
    category: number;                       // 分类页每页文章数
  };

  // ========== 导航菜单 ==========
  // 使用 NavItem 类型，支持简单字符串或配置对象
  menu: Record<string, NavItem>;

  // ========== 内容配置 ==========
  excerpt_link: string;                     // "阅读更多"按钮文字

  // ========== 作者信息 ==========
  author: {
    name: string;                           // 作者名称
    work: string;                           // 职业/简介
    location: string;                       // 所在地
    avatar: {                               // 头像组件
      src: ImageMetadata;
      alt: string;
      width: number;
      height: number;
      href: ValidPath;
    };
  };

  // ========== 社交链接 ==========
  links: {
    icon: string;                              // SVG 字符串（?raw 导入）
    url: string;                               // 链接地址
    title?: string;                            // 标题（可选）
  }[];

  // ========== 其他配置 ==========
  animationOld: {
    name: string;
    minAnimationMs: number;
  };
  animationNew: TransitionAnimationValue;
  comments: boolean;                           // 评论开关
  analytics?: (() => JSX.Element) | undefined; // 统计分析组件（可选）
  favicon: () => JSX.Element;                  // 网站图标
  header?: (() => JSX.Element) | undefined;    // 顶部组件（可选）
  footer?: (() => JSX.Element) | undefined;    // 底部组件（可选）
  passwordHint?: string;                       // 全局密码输入提示
  passwordPrompt?: string;                     // 全局加密内容提示
  tocEmptyText?: string;                       // 无目录时的提示文字
}

/**
 * 处理后的站点配置 - 包含 MathJax 预处理的结果
 * menu labels 和 author 信息已转换为 HTML
 */
export interface ProcessedSiteConfig extends SiteConfig {
  mathCSS: string;                            // 该 collection 的 MathJax CSS
}
