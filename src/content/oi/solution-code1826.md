---
title: "[BZOJ1430]小猴打架"
date: 2018-04-28
categories: 题解
tags: [树的prufer编码]
---

树的 prufer 编码的弱版模板题。

::more

## Problem
### 题目描述

一开始森林里面有 $N$ 只互不相识的小猴子，它们经常打架，
但打架的双方都必须不是好朋友。

每次打完架后，打架的双方以及它们的好朋友就会互相认识，成为好朋友。

经过 $N-1$ 次打架之后，整个森林的小猴都会成为好朋友。

现在的问题是，总共有多少种不同的打架过程。

比如当 $N=3$ 时，就有 `{1-2,1-3}{1-2,2-3}{1-3,1-2}{1-3,2-3}{2-3,1-2}{2-3,1-3}`
六种不同的打架过程。
### 输入格式

一个整数 $N$。

### 输出格式

一行，方案数 $\mod 9999991$。
### 输入
```plain
4
```
### 输出
```plain
96
```
### 说明/提示
$50\%$的数据$N\le 10^3$。
$100\%$的数据$N\le 10^6$。
## Code
```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
#define mod 9999991
#define LL long long
using namespace std;
inline LL quickpow(LL a,LL b)
{
	LL ans=1;
	while(b)
	{
		if(b&1)ans=(ans*a)%mod;
		a=(a*a)%mod;
		b>>=1;
	}
	return ans;
}
int main(void)
{
	int i,n;
	LL ans;
	scanf("%d",&n);
	ans=quickpow(n,n-2);
	for(i=1;i<n;++i)ans=(ans*i)%mod;
	printf("%lld\n",ans);
	return 0;
}
```
