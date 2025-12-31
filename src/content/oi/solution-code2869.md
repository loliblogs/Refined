---
title: solution-code2869
categories: 题解
tags: [线段树,树链剖分]
date: 2018-08-20
---

有顺序的树链剖分模板题，
注意 `Node` 中 `ans` 初始值为 `0`
（否则相当于空序列中有一种颜色）
并且 `Lval` 和 `Rval` 的值不能存在于序列之中

::more


```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
#define Ls (v<<1)
#define Rs ((v<<1)|1)
#define fpos fpos233
using namespace std;
struct Node
{
	int Lval,Rval,ans;
	inline Node():Lval(0),Rval(0),ans(0){}
	inline Node(int val):Lval(val),Rval(val),ans(1){}
};
struct Tree
{
	int L,R,lazy;
	Node Lval,Rval;
}T[400005];
struct Edge
{
	int to,next;
}e[200005];
int a[100005],d[100005],h[100005],pre[100005],siz[100005],vson[100005],top[100005],pos[100005],fpos[100005],cnt,sign;
inline void Addedge(int x,int y)
{
	e[++cnt]=(Edge){y,h[x]};h[x]=cnt;return;
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
	fpos[sign]=x;
	if(vson[x]!=-1)dfs2(vson[x],sp);
	for(i=h[x];i;i=e[i].next)
	{
		y=e[i].to;
		if(y==pre[x]||y==vson[x])continue;
		dfs2(y,y);
	}
	return;
}
inline Node operator+(const Node& a,const Node& b)
{
	Node ans;
	ans.Lval=a.Lval;
	ans.Rval=b.Rval;
	ans.ans=a.ans+b.ans-(a.Rval==b.Lval);
	return ans;
}
inline void pushup(int v)
{
	T[v].Lval=T[Ls].Lval+T[Rs].Lval;
	T[v].Rval=T[Rs].Rval+T[Ls].Rval;
	return;
}
inline void pushdown(int v)
{
	if(!T[v].lazy)return;
	T[Ls].Lval=T[Ls].Rval=T[Rs].Lval=T[Rs].Rval=Node(T[v].lazy);
	T[Ls].lazy=T[Rs].lazy=T[v].lazy;
	T[v].lazy=0;
	return;
}
inline void Build(int L,int R,int v)
{
	T[v].L=L;T[v].R=R;
	if(L==R)
	{
		T[v].Lval=T[v].Rval=Node(a[fpos[L]]);
		return;
	}
	int mid=(L+R)>>1;
	Build(L,mid,Ls);
	Build(mid+1,R,Rs);
	pushup(v);
	return;
}
inline void Modify(int L,int R,int val,int v)
{
	if(L>T[v].R||R<T[v].L)return;
	if(L<=T[v].L&&R>=T[v].R)
	{
		T[v].Lval=T[v].Rval=Node(val);
		T[v].lazy=val;
		return;
	}
	pushdown(v);
	Modify(L,R,val,Ls);
	Modify(L,R,val,Rs);
	pushup(v);
	return;
}
inline Node QueryL(int L,int R,int v)
{
	if(L==T[v].L&&R==T[v].R)return T[v].Lval;
	int mid=(T[v].L+T[v].R)>>1;
	pushdown(v);
	if(R<=mid)return QueryL(L,R,Ls);
	if(L>mid)return QueryL(L,R,Rs);
	return QueryL(L,mid,Ls)+QueryL(mid+1,R,Rs);
}
inline Node QueryR(int L,int R,int v)
{
	if(L==T[v].L&&R==T[v].R)return T[v].Rval;
	int mid=(T[v].L+T[v].R)>>1;
	pushdown(v);
	if(R<=mid)return QueryR(L,R,Ls);
	if(L>mid)return QueryR(L,R,Rs);
	return QueryR(mid+1,R,Rs)+QueryR(L,mid,Ls);
}
inline void Modify(int x,int y,int val)
{
	while(top[x]!=top[y])
	{
		if(d[top[x]]<d[top[y]])swap(x,y);
		Modify(pos[top[x]],pos[x],val,1);
		x=pre[top[x]];
	}
	if(d[x]>d[y])swap(x,y);
	Modify(pos[x],pos[y],val,1);
	return;
}
inline Node Query(int x,int y)
{
	Node ansL,ansR;
	while(top[x]!=top[y])
	{
		if(d[top[x]]>=d[top[y]])
		{
			ansL=ansL+QueryR(pos[top[x]],pos[x],1);
			x=pre[top[x]];
		}
		else
		{
			ansR=QueryL(pos[top[y]],pos[y],1)+ansR;
			y=pre[top[y]];
		}
	}
	if(d[x]>d[y])return ansL+QueryR(pos[y],pos[x],1)+ansR;
	return ansL+QueryL(pos[x],pos[y],1)+ansR;
}
int main(void)
{
	int siz=40<<20;//40M
//	__asm__ ("movl %0,%%esp\n"::"r"((char*)malloc(siz)+siz));//调试用这个
	__asm__ ("movq %0,%%rsp\n"::"r"((char*)malloc(siz)+siz));//提交用这个
	int i,n,m,x,y,v,ch;
	scanf("%d%d",&n,&m);
	for(i=1;i<=n;++i)scanf("%d",&a[i]);
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
		while(ch=getchar())if(ch=='C'||ch=='Q')break;
		scanf("%d%d",&x,&y);
		if(ch=='C')
		{
			scanf("%d",&v);Modify(x,y,v);
		}
		else printf("%d\n",Query(x,y).ans);
	}
	exit(0);
}
```
