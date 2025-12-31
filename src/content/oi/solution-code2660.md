---
title: solution-code2660
categories: 题解
tags: [线段树]
date: 2018-06-22
---

线段树模板题，
求个数时遇到 `set` 标记就返回。

由于个数较少，
可以用 `long long` 压位暴力处理。

::more


```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
using namespace std;
struct Tree
{
	int L,R,col;
}T[400005];
inline void pushdown(int v)
{
	if(T[v].col!=-1)
	{
		T[v<<1].col=T[(v<<1)|1].col=T[v].col;
		T[v].col=-1;
	}
	return;
}
inline void Build(int L,int R,int v)
{
	T[v].L=L;T[v].R=R;
	T[v].col=1;
	if(L==R)return;
	int mid=(L+R)>>1;
	Build(L,mid,v<<1);
	Build(mid+1,R,(v<<1)|1);
	return;
}
inline void Insert(int L,int R,int col,int v)
{
	if(L>T[v].R||R<T[v].L)return;
	if(L<=T[v].L&&R>=T[v].R)
	{
		T[v].col=col;
		return;
	}
	pushdown(v);
	Insert(L,R,col,v<<1);
	Insert(L,R,col,(v<<1)|1);
	return;
}
inline long long Query(int L,int R,int v)
{
	if(L>T[v].R||R<T[v].L)return 0;
	if(T[v].col!=-1)return 1LL<<T[v].col;
	return Query(L,R,v<<1)|Query(L,R,(v<<1)|1);
}
int main(void)
{
	int i,n,m,k,ch,L,R,v;
	scanf("%d%d%d",&n,&k,&m);
	Build(1,n,1);
	while(m--)
	{
		while(ch=getchar())if(ch=='C'||ch=='P')break;
		scanf("%d%d",&L,&R);
		if(ch=='C')
		{
			scanf("%d",&v);
			Insert(L,R,v,1);
		}
		else printf("%d\n",__builtin_popcount(Query(L,R,1)));
	}
	return 0;
}

```
