/**
 * 站点基础配置文件
 * 从 Hexo Concise 主题迁移的配置
 *
 * 使用方法：
 * 1. 直接修改此文件中的配置项
 * 2. 所有更改会在开发服务器重启后生效
 * 3. 配置项都有详细的注释说明
 *
 * 注意：此文件不包含 MathJax 处理逻辑，处理后的配置请从 site.config.ts 导入
 */

import { GithubLogoIcon, LinuxLogoIcon, SteamLogoIcon, SubwayIcon } from '@phosphor-icons/react';

import avatarImg from '@/assets/avatar.jpg';
import faviconUrl from '@/assets/favicon-32x32.png?url&no-inline';
import faviconUrl192 from '@/assets/favicon-192x192.png?url&no-inline';
import faviconUrl180 from '@/assets/favicon-180x180.png?url&no-inline';
import type { SiteConfig } from '@/types/site-config';

/**
 * ==========================================
 * 用户配置区域 - 请根据你的需求修改下面的配置
 * ==========================================
 */

// 动画配置
const animationOld = {
  name: 'animate-[fade-out-up_0.2s_ease-out_forwards]',
  minAnimationMs: 100,
};
const animationNew = {
  old: [],
  new: {
    name: 'fade-in-down',
    duration: '0.3s',
    easing: 'ease-out',
  },
};

// Post Collection 配置（默认博客）
export const postConfig: SiteConfig = {
  // ========== 站点基本信息 ==========
  title: 'loli\'s diary',                           // 站点标题
  subtitle: 'loli\'s diary about learning and design with Astro', // 副标题
  description: '关于学习和生活的日记碎碎念，记录在各种实验和实践中的经历和思考，进行一些案例分析和分享',      // 站点描述（SEO）
  keywords: 'blog, design, learning, life, diary, thinking',       // 关键词（SEO）

  // ========== 分页配置 ==========
  // 各页面的每页文章数配置
  pagination: {
    index: 5,                                 // 首页每页显示5篇文章
    tag: 10,                                  // 标签页每页显示10篇文章
    category: 10,                             // 分类页每页显示10篇文章
  },

  // ========== 导航菜单 ==========
  // 导航菜单（可自定义添加或删除）
  menu: {
    首页: '/',
    '$\\mathcal{OI}$': { path: '/oi', ariaLabel: 'OI' },
    分类: '/category',
    标签: '/tag',
    归档: '/archive',
    订阅: '/rss.xml',
    关于: '/about',
  },

  // ========== 内容配置 ==========
  // "阅读更多"按钮文字
  excerpt_link: '阅读更多',

  // ========== 作者信息 ==========
  // 侧边栏作者信息
  author: {
    name: 'lolifamily',                         // 显示名称
    work: 'Learning &amp; $\\LaTeX$ Enthusiast', // 职业/简介
    location: 'Chongqing, China',           // 所在地
    avatar: {                              // 头像组件
      src: avatarImg,
      alt: 'lolifamily',
      width: 180,                          // 尺寸在配置中定义
      height: 180,
      href: '/about',
    },
  },

  // ========== 社交链接 ==========
  // 社交链接（必须提供 JSX 元素）
  links: [
    {
      icon: () => <GithubLogoIcon size="2.5rem" weight="duotone" />,
      url: 'https://github.com/lolifamily',
      title: 'GitHub',
    },
    {
      icon: () => <LinuxLogoIcon size="2.5rem" weight="duotone" />,
      url: 'https://linux.do/u/charliez0/summary',
      title: 'LinuxDo',
    },
    {
      icon: () => <SteamLogoIcon size="2.5rem" weight="duotone" />,
      url: 'https://steamcommunity.com/id/charliez0sp',
      title: 'Steam',
    },
    {
      icon: () => <SubwayIcon size="2.5rem" weight="duotone" />,
      url: 'https://www.travellings.cn/go.html',
      title: 'Travelling',
    },
  ],

  // ========== 评论系统 ==========
  // 评论开关
  comments: true,

  // ========== 统计分析 ==========
  // 统计分析组件（可选）- 支持任何统计服务
  // analytics: () => (
  //   <script dangerouslySetInnerHTML={{
  //     __html: `
  //       var _hmt = _hmt || [];
  //       (function() {
  //         var hm = document.createElement("script");
  //         hm.src = "https://hm.baidu.com/hm.js?YOUR_BAIDU_ID";
  //         var s = document.getElementsByTagName("script")[0];
  //         s.parentNode.insertBefore(hm, s);
  //       })();
  //     `
  //   }} />
  // ),

  // ========== 其他配置 ==========
  animationOld: animationOld,
  animationNew: {
    forwards: animationNew,
    backwards: animationNew,
  },
  // 网站图标
  favicon: () => (                     // 图标 (Vite 处理后的 URL)
    <>
      <link rel="icon" href={faviconUrl} sizes="32x32" />
      <link rel="icon" href={faviconUrl192} sizes="192x192" />
      <link rel="apple-touch-icon" href={faviconUrl180} sizes="180x180" />
    </>
  ),

  header: () => (
    <>
      <meta name="google-site-verification" content="7_jEvDR3ggk6tLdJKrr-rNzJchC81DGeO2ZzSXPixcg" />
      <meta name="google-site-verification" content="svGvv3mqZ3LG3oc6wLWauuJ_br6i1hkIUP_Zl3G3xGU" />
      <meta name="google-site-verification" content="F887_8q9nOn1uZ9dJj3ws-Alw27KnunixJO_3m__Z-Q" />
      <meta name="google-site-verification" content="29mDgzP9v9aE6S-Rug2DeShzpcR-Jv21wR2fgzRu2MU" />
      <meta name="google-site-verification" content="o9tV4facW2oZw6oLUBQtEtiDDiUmA6r84Dn8hO9yxjs" />
      <meta name="google-site-verification" content="Pee7tcDayUCumv1uBEndhQpK89bf6VLIddKptqd3DpA" />
    </>
  ),

  footer: () => (
    <a
      href="https://icp.gov.moe/?keyword=20252105"
      target="_blank"
      className={`
        text-muted
        hover:text-primary
      `}
    >
      <span className="underline">萌ICP备20252105号</span>
    </a>
  ),

  // 加密相关默认值
  passwordHint: '请输入密码',                 // 全局密码输入提示
  passwordPrompt: '这是一篇加密文章，需要密码才能查看',  // 全局加密内容提示

  // 目录配置
  tocEmptyText: '本文章没有目录',              // 无目录时的提示文字
} as const satisfies SiteConfig;

// OI Collection 配置
export const oiConfig: SiteConfig = {
  // ========== 站点基本信息 ==========
  title: 'loli\'s OI log',                              // 站点标题
  subtitle: 'lolifamily\'s log about competitive programming with Astro',              // 副标题
  description: '关于OI学习的记录，记录题解和部分算法上思考',     // 站点描述（SEO）
  keywords: 'OI, ACM, algorithm, competitive programming', // 关键词（SEO）

  // ========== 分页配置 ==========
  // 各页面的每页文章数配置
  pagination: postConfig.pagination,

  // ========== 导航菜单 ==========
  // OI专属导航菜单
  menu: {
    '$\\mathcal{OI}$首页': { path: '/oi', recursive: false, ariaLabel: 'OI 首页' },
    返回博客: '/',
    分类: '/oi/category',
    标签: '/oi/tag',
    归档: '/oi/archive',
    订阅: '/oi/rss.xml',
    关于: '/oi/about',
  },

  // ========== 内容配置 ==========
  // "阅读更多"按钮文字
  excerpt_link: '查看题解',

  // ========== 作者信息 ==========
  // 侧边栏作者信息（可以与主博客相同或不同）
  author: postConfig.author,  // 复用主博客的作者信息

  // ========== 社交链接 ==========
  // 社交链接（复用主博客的）
  links: postConfig.links,

  // ========== 评论系统 ==========
  // 评论开关
  comments: true,

  // ========== 统计分析 ==========
  // 统计分析组件（复用主博客的）
  // analytics: postConfig.analytics,

  // ========== 其他配置 ==========
  animationOld: postConfig.animationOld,
  animationNew: postConfig.animationNew,
  // 网站图标（可以使用相同或不同的图标）
  favicon: postConfig.favicon,

  header: postConfig.header,
  footer: postConfig.footer,

  // 加密相关默认值（OI专区可能使用不同的提示）
  passwordHint: '请输入题解密码',             // OI专区密码输入提示
  passwordPrompt: '这篇题解需要密码才能查看',  // OI专区加密内容提示

  // 目录配置
  tocEmptyText: '本题解没有目录',              // 无目录时的提示文字
} as const satisfies SiteConfig;
