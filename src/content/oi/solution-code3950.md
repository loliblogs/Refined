---
title: solution-code3950
categories: 题解
tags: [最大流]
date: 2018-06-24
---

模板题，注意 `a` 数组和 `b` 数组的区别就行了

::more


```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
#define inf 0x3F3F3F3F
using namespace std;
struct Node
{
	int to,next,v;
}e[100005];
int S,T,P,a[1005],b[1005],h[1005],d[1005],gap[1005],cnt=1;
inline void Addedge(int x,int y,int v)
{
	e[++cnt]=(Node){y,h[x],v};h[x]=cnt;
	e[++cnt]=(Node){x,h[y],0};h[y]=cnt;
	return;
}
inline int dfs(int x,int maxf)
{
	if(x==T)return maxf;
	int i,y,ret=0,delta;
	for(i=h[x];i;i=e[i].next)
	{
		y=e[i].to;
		if(e[i].v&&d[x]==d[y]+1)
		{
			delta=dfs(y,min(maxf,e[i].v));
			e[i].v-=delta;
			e[i^1].v+=delta;
			ret+=delta;
			maxf-=delta;
			if(d[S]==P||!maxf)return ret;
		}
	}
	if(!(--gap[d[x]]))d[S]=P;
	++gap[++d[x]];
	return ret;
}
inline int SAP()
{
	int sum=0;
	gap[0]=P;
	while(d[S]<P)sum+=dfs(S,inf);
	return sum;
}
int main(void)
{
	int i,j,x,n,Case,sum=0;
	scanf("%d",&Case);
	while(Case--)
	{
		memset(d,0,sizeof(d));
		memset(gap,0,sizeof(gap));
		memset(h,0,sizeof(h));cnt=1;sum=0;
		scanf("%d",&n);
		S=n*2+1;P=T=n*2+2;
		for(i=1;i<=n;++i)scanf("%d",&a[i]);
		for(i=1;i<=n;++i)scanf("%d",&b[i]);
		for(i=1;i<=n;++i)
		{
			for(j=1;j<=n;++j)
			{
				scanf("%d",&x);
				if(x)Addedge(i,j+n,1);
			}
		}
		for(i=1;i<=n;++i)
		{
			if(a[i]&&b[i])continue;
			Addedge(S,i,1);++sum;
		}
		for(i=1;i<=n;++i)
		{
			if(!a[i])continue;
			Addedge(i,i+n,1);
			Addedge(i+n,T,1);
		}
		if(SAP()==sum)printf("^_^\n");
		else printf("T_T\n");
	}
	return 0;
}

```
