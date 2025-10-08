---
title: solution-code1433
categories: 题解
tags: [树状数组]
date: 2018-06-25
---

模板题，没什么好说的，正着算一遍，反着算一遍，乘积即为答案。

::more


```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
#define LL long long
using namespace std;
int n,a[50005],b[50005],c[50005];
inline int lowbit(int x){return x&(-x);}
inline void Add(int x,int v)
{
	while(x<=50002)c[x]+=v,x+=lowbit(x);
	return;
}
inline LL Query(int x)
{
	LL sum=0;
	while(x>=1)sum+=c[x],x-=lowbit(x);
	return sum;
}
LL f1[50005],f2[50005];
inline void LSH()
{
	int i,num;
	memcpy(b,a,sizeof(a));
	sort(b+1,b+n+1);
	num=unique(b+1,b+n+1)-(b+1);
	for(i=1;i<=n;++i)a[i]=lower_bound(b+1,b+num+1,a[i])-b;
	return;
}
int main(void)
{
	int i;
	LL ans=0;
	scanf("%d",&n);
	for(i=1;i<=n;++i)scanf("%d",&a[i]);
	LSH();
	for(i=1;i<=n;++i)
	{
		Add(a[i],1);
		f1[i]=Query(a[i]-1);
	}
	memset(c,0,sizeof(c));
	for(i=n;i>=1;--i)
	{
		Add(a[i],1);
		f2[i]=Query(a[i]-1);
	}
	for(i=1;i<=n;++i)ans+=f1[i]*f2[i];
	printf("%lld\n",ans);
	return 0;
}
```
