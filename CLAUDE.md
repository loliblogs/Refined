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
- ⚠️ **路径规则**：非必要不要使用绝对路径，使用时必须用双引号包裹。**当运行在Windows环境时**，一切文件路径必须使用Windows原生格式（反斜杠`\`分隔符、盘符前缀如`C:\`、`D:\`），**无论当前shell是Cygwin、MSYS2、Git Bash还是任何其他Unix兼容层**——绝不允许使用`/cygdrive/c/`、`/c/`、`/home/`等Unix风格路径。**注意**：此规则仅约束路径本身，shell命令的其他部分（命令名、参数、管道、重定向等）仍遵循当前shell的原生语法，不受此规则影响。⚠️ **subagent提醒**：所有可能需要读写文件的subagent prompt都必须主动包含此条路径规则，确保子代理也严格遵循相同的路径格式和双引号包裹规范。
- 请使用pnpm，不要使用npm
- 项目使用typescript-eslint和stylistic超级严格模式，外加extends astro/tsconfigs/strictest，请严格遵循语法规范，不允许尝试修改任何lint选项或在用户明确许可前使用eslint-disable/ts-ignore等语句。**严禁使用非空断言操作符`!`（`no-non-null-assertion`），没有例外。** 禁止使用`tsc`进行类型检查，必须使用`pnpm typecheck`（即`astro check`），因为Astro有自己的类型系统（`.astro`文件、`env.d.ts`、Content Collections等），`tsc`无法正确处理。
- TypeScript可选属性规则（`exactOptionalPropertyTypes: true`）：非必要不允许`?: T | undefined`同时出现。需要选其一：`?: T`（属性可缺失，存在时必须为T）或`T | undefined`（属性必须存在，值可为undefined）。根据实际语义选择。
- 数组遍历规则（`noUncheckedIndexedAccess`）：禁止`for`+下标遍历数组，下标访问返回`T | undefined`需要无意义的守卫。顺序遍历用`for...of`（需index用`.entries()`）或`forEach`/`map`；提前终止用`for...of`+`break`或`some`/`find`。仅在同时操作多个不同下标时允许下标循环。
- 除非特别需要，项目中不允许出现js/mjs/jsx实现，必须ts/tsx实现
- 如果不需要客户端代码，请始终编写astro文件，astro文件可以import island组件，如果需要客户端代码，请始终将客户端部分编写tsx文件，并配置合理的client指令。尽量编写渐进式的设计，即把渲染的html部分放在astro里，tsx只保留client:only的脚本逻辑。
- 所有图标资源请使用@phosphor-icons/core里面的svg文件，最终在astro文件中渲染的直接导入作为组件使用（支持width/height等原生SVG属性），最终在客户端tsx中渲染的使用?raw导入为字符串。图标清单可以从node\_modules/@phosphor-icons/core/assets/\*/目录读取，目录名对应weight（regular/bold/fill/duotone等）。
- astro项目是SSG为主的项目，用户不需要考虑dev server的延迟，不需要考虑dev server中实时更新的问题，只需要考虑build速度和最终的效果。
- Astro Content Collections：.md 有预渲染缓存（rendered 字段），.mdx 需运行时渲染；通过 `render()` 从 `astro:content` 获取 Content 组件；每次 `<Content />` 创建新实例，框架无跨实例缓存。
- 除非用户明确要求请不要使用MCP服务器中的截屏功能，你应该使用执行js脚本的方式计算得到对应的答案，如果MCP返回长度过长也代表执行成功，请缩小输出范围后重试指令。
- 请始终使用中文回答我问题和编写代码注释。
- class类名不允许任何形式的拼接，排序和单行长度遵循eslint-plugin-better-tailwindcss的限制，如果一定需要拼接，astro文件请使用class:list语法，tsx文件请使用clsx/lite，注意不允许使用clsx主包！
- tsconfig.json已经配置了@/\*的文件用法，所有src里的文件，只要跨越类型（如component，util）都必须使用这种方式来import文件
