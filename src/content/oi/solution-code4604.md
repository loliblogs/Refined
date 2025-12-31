---
title: "[CQOI2016]不同的最小割"
date: 2018-04-26
categories: 题解
tags: [无向图任意点对最大流]
---

无向图任意点对最大流的模板题，
暴力把所有元素用 `bitset` 排重即可。

::more

## Problem

### 题目描述

学过图论的同学都知道最小割的概念：
对于一个图，某个对图中结点的划分将图中所有结点分成两个部分，
如果结点 $s,t$ 不在同一个部分中，
则称这个划分是关于 $s,t$ 的割。
对于带权图来说，
将所有顶点处在不同部分的边的权值相加所得到的值定义为这个割的容量，
而 $s,t$ 的最小割指的是在关于 $s,t$ 的割中容量最小的割。

而对冲刺 NOI 竞赛的选手而言，
求带权图中两点的最小割已经不是什么难事了。
我们可以把视野放宽，
考虑有 $N$ 个点的无向连通图中所有点对的最小割的容量，
共能得到 $\dfrac{N(N-1)}{2}$ 个数值。
这些数值中互不相同的有多少个呢？
这似乎是个有趣的问题。

### 输入格式

第一行包含两个数 $N,M$，表示点数和边数。

接下来 $M$ 行，每行三个数 $u,v,w$，
表示点 $u$ 和点 $v$（从 $1$ 开始标号）之间有一条权值是 $w$ 的边。

### 输出格式

第一行为一个整数，表示不同的最小割容量的个数。

### 输入

```plain
4 4
1 2 3
1 3 6
2 4 5
3 4 4
```

### 输出

```plain
3
```

### 说明/提示

$1\le N\le 850$，$1\le M\le 8500$，$1\le w\le 100000$。

## Code
```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
#include <bitset>
#define inf 0x3FFFFFFF
using namespace std;
struct Node
{
	int to,next,v;
}e[17005],mp[17005];
int s,t,n,m,h[855],f[855][855],d[855],gap[855],fa[855],cnt=1;
bool vis[855];
inline void Addedge(int x,int y,int v)
{
	mp[++cnt]=(Node){y,h[x],v};h[x]=cnt;return;
}
inline int dfs(int x,int maxf)
{
	int i,y,ret=0,delta;
	if(x==t)return maxf;
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
			if(!maxf||d[x]==n)return ret;
		}
	}
	if(!(--gap[d[x]]))d[s]=n;
	++gap[++d[x]];
	return ret;
}
inline void dfs(int x)
{
	int i,y;
	vis[x]=true;
	for(i=h[x];i;i=e[i].next)
	{
		y=e[i].to;
		if(e[i].v&&!vis[y])dfs(y);
	}
	return;
}
inline void Gusfield()
{
	int i,j,ans;
	memset(f,0x3F,sizeof(f));
	for(i=2;i<=n;++i)fa[i]=1;
	for(i=2;i<=n;++i)
	{
		memcpy(e,mp,sizeof(mp));
		memset(gap,0,sizeof(gap));
		memset(d,0,sizeof(d));
		memset(vis,0,sizeof(vis));
		s=fa[i];t=i;ans=0;
		gap[0]=n;
		while(d[s]<n)ans+=dfs(s,inf);
		dfs(s);
		for(j=i+1;j<=n;++j)
		{
			if(!vis[j]&&fa[j]==fa[i])fa[j]=i;
		}
		for(j=1;j<i;++j)f[i][j]=f[j][i]=min(f[fa[i]][j],ans);
	}
	return;
}
bitset<23333333>H;
int main(void)
{
	int i,j,x,y,v,ans=0;
	scanf("%d%d",&n,&m);
	for(i=1;i<=m;++i)
	{
		scanf("%d%d%d",&x,&y,&v);
		Addedge(x,y,v);
		Addedge(y,x,v);
	}
	Gusfield();
	for(i=1;i<=n;++i)
	{
		for(j=1;j<=n;++j)
		{
			if(i==j)continue;
			if(!H[f[i][j]]){++ans;H[f[i][j]]=true;}
		}
	}
	printf("%d\n",ans);
	return 0;
}
```
