---
title: solution-code3134
categories: 题解
tags: [二分]
date: 2018-06-22
---

注意：二分起始节点不是 `a+1`，而是 `a+i+1`

可以倒序循环，一旦找不到可匹配的人就直接输出答案

::more


```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
using namespace std;
int a[200005];
int main(void)
{
	int i,n,s;
	long long tot=0;
	scanf("%d%d",&n,&s);
	for(i=1;i<=n;++i)scanf("%lld",&a[i]);
	sort(a+1,a+n+1);
	for(i=n-1;i>=1;--i)
	{
		int* t=upper_bound(a+i+1,a+n+1,s-a[i]);
		if(t==a+n+1)break;
		tot+=a+n+1-t;
	}
	printf("%lld\n",tot);
	return 0;
}
```
