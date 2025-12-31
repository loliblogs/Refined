---
title: solution-code4763
date: 2018-08-11
categories: 题解
tags: [生成函数]
---

## 每种食物的生成函数

汉堡: $1+x^2+x^4+\cdots=\frac{1}{1-x^2}$

可乐: $1+x=\frac{1-x^2}{1-x}$

鸡腿: $1+x+x^2=\frac{1-x^3}{1-x}$

蜜桃多: $x+x^3+x^5+\cdots=\frac{x}{1-x^2}$

鸡块: $1+x^4+x^8+\cdots=\frac{1}{1-x^4}$

包子: $1+x+x^2+x^3=\frac{1-x^4}{1-x}$

土豆片炒肉: $1+x=\frac{1-x^2}{1-x}$

面包: $1+x^3+x^6+\cdots=\frac{1}{1-x^3}$

乘在一起得到: $f(x)=\frac{x}{(1-x)^4}=x\cdot (1-x)^{-4}$

带入广义二项式定理得 $f(x)=x\cdot \sum_{i=0}^\infty C_{i+3}^i \cdot x^i$

当 $i=n-1$ 时第 $n-1$ 项为 $x\cdot C_{n+2}^n \cdot x^n=C_{n+2}^3\cdot x^n$

所以答案就为 $\text{ans}=\frac{n(n+1)(n+2)}{6}$

::more


```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
#define mod 10007
#define inv6 1668
using namespace std;
inline int GetInt()
{
	int ch,num=0;
	while(ch=getchar())
	{
		if(ch>='0'&&ch<='9')break;
	}
	while(ch>='0'&&ch<='9')
	{
		num=(num*10+ch-'0')%mod;
		ch=getchar();
	}
	return num;
}
int main(void)
{
	int n=GetInt();
	printf("%d\n",n*(n+1)%mod*(n+2)%mod*inv6%mod);
	return 0;
}
```
