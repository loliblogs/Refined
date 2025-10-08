---
title: "[ZJOI2011]最小割"
date: 2018-04-26
categories: 题解
tags: [无向图任意点对最大流]
---

无向图任意点对最大流的模板题，
把所有元素放进 `num` 数组里排序 + 二分即可。

::more

## Problem

### 题目描述

小白在图论课上学到了一个新的概念——最小割，
下课后小白在笔记本上写下了如下这段话：
"对于一个图，某个对图中结点的划分将图中所有结点分成两个部分，
如果结点 $s,t$ 不在同一个部分中，
则称这个划分是关于 $s,t$ 的割。
对于带权图来说，
将所有顶点处在不同部分的边的权值相加所得到的值定义为这个割的容量，
而 `s,t` 的最小割指的是在关于 $s,t$ 的割中容量最小的割"

现给定一张无向图，
小白有若干个形如"图中有多少对点它们的最小割的容量不超过 $x$ 呢"的疑问，
小蓝虽然很想回答这些问题，但小蓝最近忙着挖木块，
于是作为仍然是小蓝的好友，你又有任务了。

### 输入格式

输入文件第一行有且只有一个正整数 $T$，
表示测试数据的组数。

对于每组测试数据，
第一行包含两个整数 $n$,$m$，
表示图的点数和边数。

下面 $m$ 行，
每行 $3$ 个正整数 $u$,$v$,$c$，
表示有一条权为 $c$ 的无向边 $(u,v)$

接下来一行，包含一个整数 $q$，
表示询问的个数

下面 $q$ 行，每行一个整数 $x$，其含义同题目描述。

### 输出格式

对于每组测试数据，
输出应包括 $q$ 行，
第 $i$ 行表示第 $i$ 个问题的答案。
对于点对 $(p,q)$ 和 $(q,p)$，只统计一次（见样例）。

两组测试数据之间用空行隔开。

### 输入

```plain
1
5 0
1
0
```

### 输出

```plain
10
```

### 说明/提示

对于 $100\%$ 的数据，
$1\le T\le 10$，$1\le n\le 150$，$0\le m\le 3000$，
$0\le x\le 2^{31}-1$，$0\le q\le 30$。

## Code
```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
#define inf 0x3FFFFFFF
using namespace std;
struct Node
{
	int to,next,v;
}e[6005],mp[6005];
int s,t,n,m,h[155],f[155][155],d[155],gap[155],fa[155],num[22505],cnt=1;
bool vis[155];
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
int main(void)
{
	int i,j,q,T,x,y,v;
	scanf("%d",&T);
	while(T--)
	{
		memset(h,0,sizeof(h));cnt=1;
		scanf("%d%d",&n,&m);
		for(i=1;i<=m;++i)
		{
			scanf("%d%d%d",&x,&y,&v);
			Addedge(x,y,v);
			Addedge(y,x,v);
		}
		Gusfield();num[0]=0;
		for(i=1;i<=n;++i)
		{
			for(j=i+1;j<=n;++j)
			{
				num[++num[0]]=f[i][j];
			}
		}
		sort(num+1,num+num[0]+1);
		scanf("%d",&q);
		for(i=1;i<=q;++i)
		{
			scanf("%d",&x);
			printf("%d\n",upper_bound(num+1,num+num[0]+1,x)-num-1);
		}
		putchar('\n');
	}
	return 0;
}
```
