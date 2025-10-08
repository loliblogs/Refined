---
title: solution-code4575
date: 2018-04-29
categories: 题解
tags: [树形DP]
---

树形 DP 模板题，
注意用 `tmp` 数组和 `t` 变量来减短代码篇幅

::more


```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
#define LL long long
using namespace std;
struct Node
{
	int to,next,val;
}e[4005];
LL f[2005][2005],tmp[2005];
int n,m,siz[2005],h[2005],cnt;
inline void Addedge(int x,int y,int v)
{
	e[++cnt]=(Node){y,h[x],v};h[x]=cnt;return;
}
inline void DP(int x,int pre)
{
	int i,j,k,y;
	siz[x]=1;
	for(i=h[x];i;i=e[i].next)
	{
		y=e[i].to;
		if(y==pre)continue;
		DP(y,x);
		memset(tmp,0,sizeof(tmp));
		for(j=0;j<=siz[x];++j)
		{
			for(k=0;k<=siz[y];++k)
			{
				if(j+k>m)break;
				LL t=1LL*e[i].val*(1LL*(m-k)*k+1LL*(siz[y]-k)*(n-siz[y]-(m-k)));
				tmp[j+k]=max(tmp[j+k],f[x][j]+f[y][k]+t);
			}
		}
		siz[x]+=siz[y];
		for(j=0;j<=siz[x];++j)f[x][j]=tmp[j];
	}
	return;
}
int main(void)
{
	int i,x,y,v;
	scanf("%d%d",&n,&m);
	for(i=1;i<n;++i)
	{
		scanf("%d%d%d",&x,&y,&v);
		Addedge(x,y,v);
		Addedge(y,x,v);
	}
	DP(1,0);
	printf("%lld\n",f[1][m]);
	return 0;
}

```
