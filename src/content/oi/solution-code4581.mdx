---
title: solution-code4581
date: 2018-06-18
categories: 题解
tags: [树链剖分,线段树]
---

模板题，需要注意 `pos` 和节点名称的区别

::more


```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
#define fpos fpos2333
using namespace std;
struct Node
{
	int to,next;
}e[200005];
struct tree
{
	int L,R;
	long long lazy,sum;
}T[400005];
int a[200005],pos[200005],fpos[200005],top[200005],siz[200005],d[200005],pre[200005],h[200005],vson[200005],sign,cnt;
inline void Addedge(int x,int y)
{
	e[++cnt]=(Node){y,h[x]};h[x]=cnt;return;
}
inline void dfs1(int x,int prt,int dep)
{
	int i,y;
	d[x]=dep;siz[x]=1;
	pre[x]=prt;vson[x]=-1;
	for(i=h[x];i;i=e[i].next)
	{
		y=e[i].to;
		if(y==prt)continue;
		dfs1(y,x,dep+1);
		siz[x]+=siz[y];
		if(vson[x]==-1||siz[vson[x]]<siz[y])vson[x]=y;
	}
	return;
}
inline void dfs2(int x,int sp)
{
	int i,y;
	pos[x]=++sign;top[x]=sp;
	fpos[sign]=x;//!!!!!!!!
	if(vson[x]!=-1)dfs2(vson[x],sp);
	for(i=h[x];i;i=e[i].next)
	{
		y=e[i].to;
		if(y==vson[x]||y==pre[x])continue;
		dfs2(y,y);
	}
	return;
}
inline void pushup(int v)
{
	T[v].sum=T[v<<1].sum+T[(v<<1)|1].sum;
	return;
}
inline void pushdown(int v)
{
	if(!T[v].lazy)return;
	T[v<<1].sum+=1LL*(T[v<<1].R-T[v<<1].L+1)*T[v].lazy;
	T[(v<<1)|1].sum+=1LL*(T[(v<<1)|1].R-T[(v<<1)|1].L+1)*T[v].lazy;
	T[v<<1].lazy+=T[v].lazy;
	T[(v<<1)|1].lazy+=T[v].lazy;
	T[v].lazy=0;
	return;
}
inline void Build(int L,int R,int v)
{
	T[v].L=L;T[v].R=R;
	if(L==R)
	{
		T[v].sum=a[fpos[L]];
		return;
	}
	int mid=(L+R)>>1;
	Build(L,mid,v<<1);
	Build(mid+1,R,(v<<1)|1);
	pushup(v);
	return;
}
inline void Insert(int L,int R,int val,int v)
{
	if(L>T[v].R||R<T[v].L)return;
	if(L<=T[v].L&&R>=T[v].R)
	{
		T[v].sum+=1LL*(T[v].R-T[v].L+1)*val;
		T[v].lazy+=val;
		return;
	}
	pushdown(v);
	Insert(L,R,val,v<<1);
	Insert(L,R,val,(v<<1)|1);
	pushup(v);
	return;
}
inline long long Query(int L,int R,int v)
{
	if(L>T[v].R||R<T[v].L)return 0;
	if(L<=T[v].L&&R>=T[v].R)return T[v].sum;
	pushdown(v);
	return Query(L,R,v<<1)+Query(L,R,(v<<1)|1);
}
inline long long Query(int x,int y)
{
	long long sum=0;
	while(top[x]!=top[y])
	{
		if(d[top[x]]<d[top[y]])swap(x,y);
		sum+=Query(pos[top[x]],pos[x],1);
		x=pre[top[x]];
	}
	if(d[x]>d[y])swap(x,y);
	sum+=Query(pos[x],pos[y],1);
	return sum;
}
int main(void)
{
	int i,x,y,n,m,cmd;
	scanf("%d%d",&n,&m);
	for(i=1;i<=n;++i)scanf("%d",&a[i]);
	for(i=1;i<n;++i)
	{
		scanf("%d%d",&x,&y);
		Addedge(x,y);
		Addedge(y,x);
	}
	dfs1(1,1,1);
	dfs2(1,1);
	Build(1,sign,1);
	for(i=1;i<=m;++i)
	{
		scanf("%d%d",&cmd,&x);
		if(cmd==1)
		{
			scanf("%d",&y);
			Insert(pos[x],pos[x],y,1);
		}
		else if(cmd==2)
		{
			scanf("%d",&y);
			Insert(pos[x],pos[x]+siz[x]-1,y,1);
		}
		else printf("%lld\n",Query(1,x));
	}
	return 0;
}

```
