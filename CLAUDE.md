- 请使用tailwindcss v4，非必要不编写css，禁止使用@apply语法，禁止使用\<style\>内联，如果theme支持定义类型的情况下禁止@blabla-\[--var-blabla]这种语法，应该直接使用覆盖后的类如color-primary，下面是正确的global.css样例：

```css
@theme {
  color-primary: var(--color-primary);
}
:root {
  color-primary: #000000;
}

@media (prefers-color-scheme: dark) {
  :root {
    color-primary: #FFFFFF;
  }
}
```

- tailwindcss v4没有tailwind.config.ts这种配置方式，所有配置请放入global.css里面，以下参数非必要禁止使用任意值语法
```plain
--color-\*	Color utilities like bg-red-500, text-sky-300, and many more
--font-\*	Font family utilities like font-sans
--text-\*	Font size utilities like text-xl
--font-weight-\*	Font weight utilities like font-bold
--tracking-\*	Letter spacing utilities like tracking-wide
--leading-\*	Line height utilities like leading-tight
--breakpoint-\*	Responsive breakpoint variants like sm:\*
--container-\*	Container query variants like @sm:\* and size utilities like max-w-md
--spacing-\*	Spacing and sizing utilities like px-4, max-h-16, and many more
--radius-\*	Border radius utilities like rounded-sm
--shadow-\*	Box shadow utilities like shadow-md
--inset-shadow-\*	Inset box shadow utilities like inset-shadow-xs
--drop-shadow-\*	Drop shadow filter utilities like drop-shadow-md
--blur-\*	Blur filter utilities like blur-md
--perspective-\*	Perspective utilities like perspective-near
--aspect-\*	Aspect ratio utilities like aspect-video
--ease-\*	Transition timing function utilities like ease-out
--animate-\*	Animation utilities like animate-spin
```

这些经过@theme定义后均可直接使用，如果是其他的则必须使用任意值语法

- 当标准类名无法满足需求时，优先使用任意值语法而非编写额外的 CSS 文件，保持样式与组件的就近原则。

- 在使用命令行的时候，非必要不要使用绝对目录，文件和目录名请始终使用操作系统对应的格式（如Windows请始终使用类似C:\这种）且使用双括号包裹
- 请使用pnpm，不要使用npm，不要尝试使用background运行方式运行build等非无限等待的命令
- 项目使用typescript-eslint和stylistic超级严格模式，外加extends astro/tsconfigs/strictest，请严格遵循语法规范，不允许尝试修改任何lint选项或在用户明确许可前使用eslint-disable等语句。
- 除非特别需要，项目中不允许出现js/mjs/jsx实现，必须ts/tsx实现
- 如果不需要客户端代码，请始终编写astro文件，astro文件可以在编译的时候使用客户端组件，如果需要客户端代码，请始终将客户端部分编写tsx文件，并配置合理的client指令。尽量编写渐进式的设计，即把渲染的html部分放在astro里，tsx只保留client:only的脚本逻辑。
- 所有图标资源请使用@phosphor-icons下的react组件或者core里面的svg文件，如果是其他资源请从src import后插入，图标清单可以从node\_modules/@phosphor-icons/core/src/dist/icons.d.ts读取。
- astro项目是SSG为主的项目，用户不需要考虑dev server的延迟，不需要考虑dev server中实时更新的问题，只需要考虑build速度和最终的效果。
- render函数有缓存，只有文章内容改变或者astro config修改才会刷新缓存。
- 除非用户明确要求请不要使用MCP服务器中的截屏功能，你应该使用执行js脚本的方式计算得到对应的答案，如果MCP返回长度过长也代表执行成功，请缩小输出范围后重试指令。
- 请始终使用中文回答我问题和编写代码注释。
- class类名不允许任何形式的拼接，单行不允许过长，如有必要请编写多行的单字符串，如果一定需要拼接，astro文件请使用class:list语法，tsx文件请使用clsx/lite，注意不允许使用clsx主包！
- tsconfig.json已经配置了@/\*的文件用法，所有src里的文件，只要跨越类型（如component，util）都必须使用这种方式来import文件
