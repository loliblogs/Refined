---
title: solution-code2728
categories: 题解
tags: [线段树]
date: 2018-06-23
---

一道很麻烦的线段树模板题。

由于要进行翻转，
$0$ 和 $1$ 的数量、左边最长、右边最长，
以及区间答案都需要处理。

询问操作就对需要的区间进行合并，
用类似 `pushup` 的方法将 `TreeNode` 传递给上一层。

注意：

* 翻转的时候 `tag` 标记也要做相应的改变
  （如果没有打标签就不能修改！）
* `tag` 标签和 `rev` 标签会冲突，
  由于 `rev` 标签会修改 `tag` 标签的值，
  那么必须先处理 `rev` 标签才能处理 `tag` 标签
* `Lmax` 和 `Rmax` 的含义，
  不是子树的左儿子或右儿子的最长连续值，
  而是子树全部的最长连续值
* 在线段树操作中，修改操作直接修改单层，
  `pushdown` 操作修改其儿子


::more


```cpp
#include <iostream>
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
using namespace std;
struct Tree
{
	int L,R,sum0,sum1,Lmax0,Lmax1,Rmax0,Rmax1,max0,max1,val,rev;
}T[400005];
int a[100005];
inline void pushdown(int v)
{
	if(T[v].rev)
	{
		swap(T[v<<1].sum0,T[v<<1].sum1);
		swap(T[v<<1].Lmax0,T[v<<1].Lmax1);
		swap(T[v<<1].Rmax0,T[v<<1].Rmax1);
		swap(T[v<<1].max0,T[v<<1].max1);
		if(T[v<<1].val)T[v<<1].val=3-T[v<<1].val;
		swap(T[(v<<1)|1].sum0,T[(v<<1)|1].sum1);
		swap(T[(v<<1)|1].Lmax0,T[(v<<1)|1].Lmax1);
		swap(T[(v<<1)|1].Rmax0,T[(v<<1)|1].Rmax1);
		swap(T[(v<<1)|1].max0,T[(v<<1)|1].max1);
		if(T[(v<<1)|1].val)T[(v<<1)|1].val=3-T[(v<<1)|1].val;
		T[v<<1].rev^=1;T[(v<<1)|1].rev^=1;
		T[v].rev=0;
	}
	if(T[v].val==1)
	{
		T[v<<1].sum0=T[v<<1].Lmax0=T[v<<1].Rmax0=T[v<<1].max0=T[v<<1].R-T[v<<1].L+1;
		T[v<<1].sum1=T[v<<1].Lmax1=T[v<<1].Rmax1=T[v<<1].max1=0;
		T[(v<<1)|1].sum0=T[(v<<1)|1].Lmax0=T[(v<<1)|1].Rmax0=T[(v<<1)|1].max0=T[(v<<1)|1].R-T[(v<<1)|1].L+1;
		T[(v<<1)|1].sum1=T[(v<<1)|1].Lmax1=T[(v<<1)|1].Rmax1=T[(v<<1)|1].max1=0;
	}
	if(T[v].val==2)
	{
		T[v<<1].sum0=T[v<<1].Lmax0=T[v<<1].Rmax0=T[v<<1].max0=0;
		T[v<<1].sum1=T[v<<1].Lmax1=T[v<<1].Rmax1=T[v<<1].max1=T[v<<1].R-T[v<<1].L+1;
		T[(v<<1)|1].sum0=T[(v<<1)|1].Lmax0=T[(v<<1)|1].Rmax0=T[(v<<1)|1].max0=0;
		T[(v<<1)|1].sum1=T[(v<<1)|1].Lmax1=T[(v<<1)|1].Rmax1=T[(v<<1)|1].max1=T[(v<<1)|1].R-T[(v<<1)|1].L+1;
	}
	if(T[v].val)
	{
		T[v<<1].val=T[(v<<1)|1].val=T[v].val;
		T[v].val=0;
	}
	return;
}
inline void pushup(int v)
{
	T[v].sum0=T[v<<1].sum0+T[(v<<1)|1].sum0;
	T[v].sum1=T[v<<1].sum1+T[(v<<1)|1].sum1;
	if(T[v<<1].sum1==0)T[v].Lmax0=T[v<<1].Lmax0+T[(v<<1)|1].Lmax0;
	else T[v].Lmax0=T[v<<1].Lmax0;
	if(T[v<<1].sum0==0)T[v].Lmax1=T[v<<1].Lmax1+T[(v<<1)|1].Lmax1;
	else T[v].Lmax1=T[v<<1].Lmax1;
	if(T[(v<<1)|1].sum1==0)T[v].Rmax0=T[v<<1].Rmax0+T[(v<<1)|1].Rmax0;
	else T[v].Rmax0=T[(v<<1)|1].Rmax0;
	if(T[(v<<1)|1].sum0==0)T[v].Rmax1=T[v<<1].Rmax1+T[(v<<1)|1].Rmax1;
	else T[v].Rmax1=T[(v<<1)|1].Rmax1;
	T[v].max0=max(max(T[v<<1].max0,T[(v<<1)|1].max0),T[v<<1].Rmax0+T[(v<<1)|1].Lmax0);
	T[v].max1=max(max(T[v<<1].max1,T[(v<<1)|1].max1),T[v<<1].Rmax1+T[(v<<1)|1].Lmax1);
	return;
}
inline void Build(int L,int R,int v)
{
	T[v].L=L;T[v].R=R;
	if(L==R)
	{
		if(a[L])T[v].sum1=T[v].Lmax1=T[v].Rmax1=T[v].max1=1;
		else T[v].sum0=T[v].Lmax0=T[v].Rmax0=T[v].max0=1;
		return;
	}
	int mid=(L+R)>>1;
	Build(L,mid,v<<1);
	Build(mid+1,R,(v<<1)|1);
	pushup(v);
	return;
}
inline void Set(int L,int R,int val,int v)
{
	if(L>T[v].R||R<T[v].L)return;
	if(L<=T[v].L&&R>=T[v].R)
	{
		T[v].rev=0;T[v].val=val;
		if(val==1)
		{
			T[v].sum0=T[v].Lmax0=T[v].Rmax0=T[v].max0=T[v].R-T[v].L+1;
			T[v].sum1=T[v].Lmax1=T[v].Rmax1=T[v].max1=0;
		}
		else
		{
			T[v].sum0=T[v].Lmax0=T[v].Rmax0=T[v].max0=0;
			T[v].sum1=T[v].Lmax1=T[v].Rmax1=T[v].max1=T[v].R-T[v].L+1;
		}
		return;
	}
	pushdown(v);
	Set(L,R,val,v<<1);
	Set(L,R,val,(v<<1)|1);
	pushup(v);
	return;
}
inline void Rev(int L,int R,int v)
{
	if(L>T[v].R||R<T[v].L)return;
	if(L<=T[v].L&&R>=T[v].R)
	{
		T[v].rev^=1;
		if(T[v].val)T[v].val=3-T[v].val;
		swap(T[v].sum0,T[v].sum1);
		swap(T[v].Lmax0,T[v].Lmax1);
		swap(T[v].Rmax0,T[v].Rmax1);
		swap(T[v].max0,T[v].max1);
		return;
	}
	pushdown(v);
	Rev(L,R,v<<1);
	Rev(L,R,(v<<1)|1);
	pushup(v);
	return;
}
inline Tree Query(int L,int R,int v)
{
	if(L<=T[v].L&&R>=T[v].R)return T[v];
	pushdown(v);
	int mid=(T[v].L+T[v].R)>>1;
	if(R<=mid)return Query(L,R,v<<1);
	if(L>mid)return Query(L,R,(v<<1)|1);
	Tree now1=Query(L,R,v<<1),now2=Query(L,R,(v<<1)|1),now;
	now.sum0=now1.sum0+now2.sum0;
	now.sum1=now1.sum1+now2.sum1;
	if(now1.sum1==0)now.Lmax0=now1.Lmax0+now2.Lmax0;
	else now.Lmax0=now1.Lmax0;
	if(now1.sum0==0)now.Lmax1=now1.Lmax1+now2.Lmax1;
	else now.Lmax1=now1.Lmax1;
	if(now2.sum1==0)now.Rmax0=now1.Rmax0+now2.Rmax0;
	else now.Rmax0=now2.Rmax0;
	if(now2.sum0==0)now.Rmax1=now1.Rmax1+now2.Rmax1;
	else now.Rmax1=now2.Rmax1;
	now.max0=max(max(now1.max0,now2.max0),now1.Rmax0+now2.Lmax0);
	now.max1=max(max(now1.max1,now2.max1),now1.Rmax1+now2.Lmax1);
	return now;
}
int main(void)
{
	int i,j,n,m,cmd,L,R;
	scanf("%d%d",&n,&m);
	for(i=1;i<=n;++i)scanf("%d",&a[i]);
	Build(1,n,1);
	for(i=1;i<=m;++i)
	{
		scanf("%d%d%d",&cmd,&L,&R);++L;++R;
		if(cmd==0)Set(L,R,1,1);
		if(cmd==1)Set(L,R,2,1);
		if(cmd==2)Rev(L,R,1);
		if(cmd==3)printf("%d\n",Query(L,R,1).sum1);
		if(cmd==4)printf("%d\n",Query(L,R,1).max1);
	}
	return 0;
}
```
