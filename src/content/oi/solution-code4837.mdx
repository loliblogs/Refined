---
title: solution-code4837
tags: [线段树,树链剖分]
date: 2018-08-10
categories: 题解
---

模板题，多注意细节即可

::more


```cpp
#include<iostream>
#include<cstdio>
#include<cstring>
#include<algorithm>
using namespace std;
struct Node
{
	int to,next;
}e[1000005];
struct tree
{
	int L,R,maxx,addv;
}T[2000005];
int n,m,siz[500005],d[500005],h[500005],pre[500005],vson[500005],pos[500005],top[500005],sign,cnt;
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
		if(y==pre[x])continue;
		pre[y]=x;
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
		if(y==pre[x]||y==vson[x])continue;
		dfs2(y,y);
	}
	return;
}
inline void Build(int L,int R,int v)
{
	T[v].L=L;T[v].R=R;
	if(L==R)return;
	int mid=(L+R)>>1;
	Build(L,mid,v<<1);
	Build(mid+1,R,(v<<1)|1);
	return;
}
inline void pushup(int v)
{
	T[v].maxx=max(T[v<<1].maxx,T[(v<<1)|1].maxx)+T[v].addv;
	return;
}
inline void Insert(int L,int R,int v)
{
	if(L>T[v].R||R<T[v].L)return;
	if(L<=T[v].L&&R>=T[v].R)
	{
		++T[v].addv;++T[v].maxx;
		return;
	}
	Insert(L,R,v<<1);
	Insert(L,R,(v<<1)|1);
	pushup(v);
	return;
}
inline void Insertpath(int x,int y)
{
	while(top[x]!=top[y])
	{
		if(d[top[x]]<d[top[y]])swap(x,y);
		Insert(pos[top[x]],pos[x],1);
		x=pre[top[x]];
	}
	if(d[x]>d[y])swap(x,y);
	Insert(pos[x],pos[y],1);
	return;
}
int main(void)
{
	int i,n,m,x,y;
	scanf("%d%d",&n,&m);
	for(i=1;i<n;++i)
	{
		scanf("%d%d",&x,&y);
		Addedge(x,y);
		Addedge(y,x);
	}
	dfs1(1,1);
	dfs2(1,1);
	Build(1,sign,1);
	for(i=1;i<=m;++i)
	{
		scanf("%d%d",&x,&y);
		Insertpath(x,y);
	}
	printf("%d\n",T[1].maxx);
	return 0;
}
```
