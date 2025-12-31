---
title: solution-code1132
categories: 题解
tags: [DP]
date: 2018-06-23
---

没什么好说的，$O(n)$ 的简单 DP。

::more


```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
using namespace std;
int a[50005],f[50005],g[50005];
///f[i]:以a[i]元素结尾的末端状态为上升
///g[i]:以a[i]元素结尾的末端状态为下降
int main(void)
{
	int i,n;
	scanf("%d",&n);
	for(i=1;i<=n;++i)scanf("%d",&a[i]);
	f[1]=g[1]=1;
	for(i=2;i<=n;++i)
	{
		if(a[i-1]<a[i])
		{
			f[i]=max(f[i-1],g[i-1]+1);
			g[i]=g[i-1];
		}
		if(a[i-1]==a[i])
		{
			f[i]=f[i-1];g[i]=g[i-1];
		}
		if(a[i-1]>a[i])
		{
			f[i]=f[i-1];
			g[i]=max(f[i-1]+1,g[i-1]);
		}
	}
	printf("%d\n",n-max(f[n],g[n]));
	return 0;
}

```
