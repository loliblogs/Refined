---
title: _markdown-example-base
draft: true
---

## 文本格式化

### 基础样式

这是一段普通文本。你可以使用 **粗体文本**、*斜体文本*、***粗斜体文本*** 来强调重要内容。

如果需要标记删除的内容，可以使用 ~~删除线~~。

你还可以使用 `行内代码` 来标记代码片段或特殊术语。

### 上标和下标

水分子的化学式是 H:sub[2]O，而爱因斯坦的质能方程是 E=mc:sup[2]。

### 高亮标记

这是一段包含 :mark[高亮文本] 的内容。

## 标题层级

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题

## 列表

### 无序列表

- 列表项 1
- 列表项 2
  - 嵌套列表项 2.1
  - 嵌套列表项 2.2
    - 更深层嵌套 2.2.1
- 列表项 3

### 有序列表

1. 第一项
2. 第二项
   1. 子项 2.1
   2. 子项 2.2
3. 第三项

### 任务列表

- [x] 已完成的 `nodejs` 任务
- [x] 另一个已完成的 `python` 任务
- [ ] 未完成的 `rust` 任务
- [ ] 待办事项 `typescript`

## 引用块

> 这是一个简单的引用块。
>
> 可以包含多个段落。

> 引用块也可以嵌套：
>
> > 这是嵌套的引用内容。
> >
> > > 甚至可以多层嵌套。

> **提示**：引用块中也可以使用其他 Markdown 语法。
>
> ```javascript
> console.log('甚至可以包含代码块');
> ```

### 引用块中的嵌套内容

> ### 引用块中的标题
>
> 1. 引用块中的有序列表
> 2. 第二项
>    - 嵌套的无序列表
>    - 另一项
>
> ```javascript
> // 引用块中的代码
> const nested = true;
> ```
>
> | 表格 | 在引用块中 |
> |----|-------|
> | 数据 | 数据    |
>
> $E = mc^2$ 引用块中的公式

### 引用块中的内联元素

> 按 :kbd[Ctrl] + :kbd[S] 保存，终端输出 :samp[File saved]。
>
> 使用 `console.log()` 输出调试信息。

### Admonitions

::::note
Highlights information that users should take into account, even when skimming.

:::tip
Optional information to help a user be more successful.
:::

End of NOTE block.
::::

:::important[Custom Important Title]
Crucial information necessary for users to succeed.
:::

:::warning
Critical content demanding immediate user attention due to potential risks.
:::

:::caution
Negative potential consequences of an action.
:::

## 链接和图片

### 链接

这是一个 [行内链接](https://example.com)。

这是一个 [带标题的链接](https://example.com "链接标题")。

这是一个引用式链接 [链接文本][ref]。

[ref]: https://example.com "引用链接"

自动链接：https://example.com

### 图片

![2022-10-06-10-59-44](@/assets/SKY_20221006_225944_.jpg)

## 表格

### 基础表格

| 列 1  | 列 2  | 列 3  |
|------|------|------|
| 数据 1 | 数据 2 | 数据 3 |
| 数据 4 | 数据 5 | 数据 6 |

### 对齐表格

| 左对齐     |  居中对齐   |     右对齐 |
|:--------|:-------:|--------:|
| 文本      |   文本    |      文本 |
| 更长的文本内容 | 更长的文本内容 | 更长的文本内容 |

### 复杂表格

| 功能          | 支持情况 | 说明              |
|:------------|:----:|:----------------|
| 基础 Markdown |  ✅   | 完全支持            |
| GFM 扩展      |  ✅   | 完全支持            |
| 数学公式        |  ✅   | MathJax 渲染      |
| 代码高亮        |  ✅   | Expressive Code |

## 代码块

### 行内代码

使用 `const variable = 'value'` 定义常量。

### 基础代码块

```
纯文本代码块
没有语法高亮
```

### JavaScript 代码

```javascript
// 这是一个 JavaScript 示例
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log(`第 10 个斐波那契数是: ${result}`);
```

### TypeScript 代码

```typescript
// TypeScript 类型系统示例
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

class UserService {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  findUserById(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }
}
```

### Python 代码

```python
# Python 装饰器和生成器示例
from functools import wraps
from typing import Iterator

def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        import time
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} 执行时间: {end - start:.4f}s")
        return result
    return wrapper

@timer
def fibonacci_generator(n: int) -> Iterator[int]:
    """生成前 n 个斐波那契数"""
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# 使用生成器
for num in fibonacci_generator(10):
    print(num, end=' ')
```

### Rust 代码

```rust
// Rust 所有权系统示例
use std::collections::HashMap;

#[derive(Debug)]
struct User {
    id: u32,
    name: String,
    email: String,
}

impl User {
    fn new(id: u32, name: String, email: String) -> Self {
        User { id, name, email }
    }
}

fn main() {
    let mut users: HashMap<u32, User> = HashMap::new();

    let user = User::new(1, String::from("Alice"), String::from("alice@example.com"));
    users.insert(user.id, user);

    if let Some(u) = users.get(&1) {
        println!("找到用户: {:?}", u);
    }
}
```

### 带行号和高亮的代码块

```javascript {1,3-5}
// 第 1 行会被高亮
import * as express from 'express';
// 第 3-5 行会被高亮
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
```

### 带标题的代码块

```typescript title="src/utils/data-loader.ts"
import type { CollectionEntry } from 'astro:content';

export async function loadPosts(): Promise<CollectionEntry<'post'>[]> {
  const posts = await getCollection('post');
  return posts.filter(post => !post.data.draft);
}
```

### Shell 脚本

```bash
#!/bin/bash
# 自动化构建脚本

echo "开始构建项目..."

# 安装依赖
pnpm install

# 运行代码检查
pnpm run lint

# 运行测试
pnpm run test

# 构建项目
pnpm run build

echo "构建完成！"
```

### HTML + CSS

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>示例页面</title>
  <style>
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>欢迎</h1>
      <p>这是一个示例页面。</p>
    </div>
  </div>
</body>
</html>
```

### SQL 查询

```sql
-- 复杂的 SQL 查询示例
SELECT
  u.id,
  u.name,
  u.email,
  COUNT(p.id) as post_count,
  MAX(p.created_at) as last_post_date
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE u.active = true
  AND u.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
GROUP BY u.id, u.name, u.email
HAVING post_count > 5
ORDER BY post_count DESC, last_post_date DESC
LIMIT 10;
```

### JSON 数据

```json
{
  "name": "modern-blog",
  "version": "1.0.0",
  "description": "现代化的博客系统",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^4.0.0",
    "react": "^18.0.0"
  },
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  }
}
```

### YAML 配置

```yaml
# GitHub Actions 工作流配置
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout 代码
        uses: actions/checkout@v3

      - name: 设置 Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: 安装 pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: 安装依赖
        run: pnpm install

      - name: 构建项目
        run: pnpm run build
```

## 数学公式

### 行内公式

这是一个行内公式 $E = mc^2$，另一个是 $a^2 + b^2 = c^2$。

当 $a \ne 0$ 时，方程 $ax^2 + bx + c = 0$ 的解为：$x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$。

### 块级公式

$$
\frac{\partial f}{\partial x} = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}
$$

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

### 矩阵

$$
\begin{bmatrix}
a & b & c \\
d & e & f \\
g & h & i
\end{bmatrix}
$$

### 多行公式

$$
\begin{aligned}
f(x) &= (x+a)(x+b) \\
&= x^2 + (a+b)x + ab \\
&= x^2 + cx + d
\end{aligned}
$$

### 分段函数

$$
f(x) = \begin{cases}
x^2 & \text{if } x \geq 0 \\
-x^2 & \text{if } x < 0
\end{cases}
$$

### 求和与积分

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

$$
\prod_{i=1}^{n} i = n!
$$

$$
\oint_C \mathbf{F} \cdot d\mathbf{r} = \iint_S (\nabla \times \mathbf{F}) \cdot d\mathbf{S}
$$

### 标题公式 $E = mc^2$

$$
\int_0^1 f(x) dx
$$

## 水平分隔线

---

***

___

## 脚注

这是一个包含脚注的句子[^1]。这是另一个脚注[^note]。

[^1]: 这是第一个脚注的内容。

[^note]: 这是一个命名脚注，可以包含多个段落。

    甚至可以包含代码：

    ```javascript
    console.log('脚注中的代码');
    ```

## 定义列表

Term 1
: 这是术语 1 的定义。

Term 2
: 这是术语 2 的第一个定义。
: 这是术语 2 的第二个定义。

## 缩写

::abbr[Web]{title="World Wide Web"}

是由:abbr[HTML]{title="HyperText Markup Language"} 和 :abbr[CSS]{title="Cascading Style Sheets"}、:abbr[JS]{title="Javascript"} 组成。

当你第一次看到 :abbr[API]{title="Application Programming Interface"} 这个词时，可能会感到困惑。但随着学习的深入，你会发现 :abbr[REST]{title="Representational State Transfer"} 和 :abbr[GraphQL]{title="Graph Query Language"} 都是构建 API 的常用方式。

## Emoji

支持 GitHub 风格的 emoji 表情：

- :smile: `:smile:`
- :heart: `:heart:`
- :rocket: `:rocket:`
- :tada: `:tada:`
- :sparkles: `:sparkles:`
- :fire: `:fire:`
- :bug: `:bug:`
- :art: `:art:`

## 转义字符

如果要显示特殊字符，需要使用反斜杠转义：

- \*不是斜体\*
- \[不是链接\]
- \`不是代码\`

## 键盘按键

按 :kbd[Ctrl] + :kbd[C] 复制，按 :kbd[Ctrl] + :kbd[V] 粘贴。

macOS 用户按 :kbd[Cmd] + :kbd[Shift] + :kbd[P] 打开命令面板。

## 程序输出

运行 `echo "Hello"` 命令后，终端会输出 :samp[Hello]。

执行 `ls -la` 后会显示类似 :samp[drwxr-xr-x 5 user staff 160 Jan 1 12\:00 .] 的内容。

## 总结

这篇文章展示了 Markdown 的所有主要语法特性：

1. **文本格式化**：**粗体**、*斜体*、~~删除线~~、:mark[高亮]、:sup[上标]、:sub[下标]
2. **结构元素**：标题、列表（有序、无序、任务）、引用块、表格、定义列表
3. **引用块扩展**：嵌套引用、Admonitions（note/tip/important/warning/caution）
4. **代码展示**：行内代码、多语言代码块、语法高亮、行号、标题
5. **数学公式**：行内和块级 $\LaTeX$ 公式、矩阵、分段函数
6. **链接和图片**：各种链接、图片、Astro 组件包装
7. **语义元素**：:kbd[键盘按键]、:samp[程序输出]、:abbr[缩写]{title="Abbreviation"}
8. **扩展功能**：脚注、Emoji、MDX 注释

这些功能足以满足绝大多数技术写作和博客创作的需求。
