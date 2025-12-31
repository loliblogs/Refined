---
title: 常见代码片段
date: 2018-08-20
sticky: 99
---

## 手工栈

```cpp
int siz=40<<20;//40M
__asm__("movl %0,%%esp\n"::"r"((char*)malloc(siz)+siz));//windows用这个
__asm__("movq %0,%%rsp\n"::"r"((char*)malloc(siz)+siz));//linux用这个
```

记住要 `exit(0)`

::more

## fread

```cpp

```

## fwrite

```cpp

```
