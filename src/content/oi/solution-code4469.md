---
title: solution-code4469
date: 2018-06-16
categories: 题解
tags: [树链剖分,线段树]
---

模板题，统计更改数目就是求总数目的变化量

::more


```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
using namespace std;
struct Node
{
	int to,next;
}e[200005];
struct Tree
{
	int L,R,lazy,sum;
}T[400005];
int siz[200005],d[200005],h[200005],pre[200005],vson[200005],pos[200005],top[200005],sign,cnt;
inline void Addedge(int x,int y)
{
	e[++cnt]=(Node){y,h[x]};h[x]=cnt;return;
}
inline void dfs1(int x,int dep)
{
	int i,y;
	d[x]=dep;siz[x]=1;
	vson[x]=-1;
	for(i=h[x];i;i=e[i].next)
	{
		y=e[i].to;
		dfs1(y,dep+1);
		siz[x]+=siz[y];
		if(vson[x]==-1||siz[vson[x]]<siz[y])vson[x]=y;
	}
	return;
}
inline void dfs2(int x,int sp)
{
	int i,y;
	pos[x]=++sign;top[x]=sp;
	if(vson[x]!=-1)dfs2(vson[x],sp);
	for(i=h[x];i;i=e[i].next)
	{
		y=e[i].to;
		if(y==vson[x])continue;
		dfs2(y,y);
	}
	return;
}
inline void Build(int L,int R,int v)
{
	T[v].L=L;T[v].R=R;
	T[v].lazy=-1;
	if(L==R)return;
	int mid=(L+R)>>1;
	Build(L,mid,v<<1);
	Build(mid+1,R,(v<<1)|1);
	return;
}
inline void pushdown(int v)
{
	if(T[v].lazy==-1)return;
	T[v<<1].sum=(T[v<<1].R-T[v<<1].L+1)*T[v].lazy;
	T[(v<<1)|1].sum=(T[(v<<1)|1].R-T[(v<<1)|1].L+1)*T[v].lazy;
	T[v<<1].lazy=T[(v<<1)|1].lazy=T[v].lazy;
	T[v].lazy=-1;
	return;
}
inline void pushup(int v)
{
	T[v].sum=T[v<<1].sum+T[(v<<1)|1].sum;
	return;
}
inline void Insert(int L,int R,int val,int v)
{
	if(L>T[v].R||R<T[v].L)return;
	if(L<=T[v].L&&R>=T[v].R)
	{
		T[v].sum=(T[v].R-T[v].L+1)*val;
		T[v].lazy=val;return;
	}
	pushdown(v);
	Insert(L,R,val,v<<1);
	Insert(L,R,val,(v<<1)|1);
	pushup(v);
	return;
}
inline void Insert(int x,int y,int val)
{
	while(top[x]!=top[y])
	{
		if(d[top[x]]<d[top[y]])swap(x,y);
		Insert(pos[top[x]],pos[x],val,1);
		x=pre[top[x]];
	}
	if(d[x]>d[y])swap(x,y);
	Insert(pos[x],pos[y],val,1);
	return;
}
char cmd[15];
int main(void)
{
	int i,n,m,x,lst;
	scanf("%d",&n);
	for(i=2;i<=n;++i)
	{
		scanf("%d",&pre[i]);++pre[i];
		Addedge(pre[i],i);
	}
	dfs1(1,1);
	dfs2(1,1);
	Build(1,sign,1);
	scanf("%d",&m);
	for(i=1;i<=m;++i)
	{
		scanf("%s%d",cmd,&x);++x;
		lst=T[1].sum;
		if(strcmp(cmd,"install")==0)
		{
			Insert(1,x,1);
			printf("%d\n",T[1].sum-lst);
		}
		else
		{
			Insert(pos[x],pos[x]+siz[x]-1,0,1);
			printf("%d\n",lst-T[1].sum);
		}
	}
	return 0;
}
```
