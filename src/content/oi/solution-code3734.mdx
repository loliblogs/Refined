---
title: solution-code3734
categories: 题解
tags: [线段树]
date: 2018-06-23
---

环形序列：拆环为链，
取 `maxx` 和 `sum-minn`
（刨去中间一块的剩余的链）的最大值

不能是整个序列的和：
如果结果是序列的和，那么减去序列最小值

注意细节！

::more


```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
using namespace std;
struct Node
{
	int L,R,sum,Lmax,Lmin,Rmax,Rmin,maxx,minn,minval;
}T[400005];
int a[100005];
inline void pushup(int v)
{
	T[v].sum=T[v<<1].sum+T[(v<<1)|1].sum;
	T[v].minval=min(T[v<<1].minval,T[(v<<1)|1].minval);
	T[v].Lmax=max(T[v<<1].Lmax,T[v<<1].sum+T[(v<<1)|1].Lmax);
	T[v].Lmin=min(T[v<<1].Lmin,T[v<<1].sum+T[(v<<1)|1].Lmin);
	T[v].Rmax=max(T[(v<<1)|1].Rmax,T[v<<1].Rmax+T[(v<<1)|1].sum);
	T[v].Rmin=min(T[(v<<1)|1].Rmin,T[v<<1].Rmin+T[(v<<1)|1].sum);
	T[v].maxx=max(max(T[v<<1].maxx,T[(v<<1)|1].maxx),T[v<<1].Rmax+T[(v<<1)|1].Lmax);
	T[v].minn=min(min(T[v<<1].minn,T[(v<<1)|1].minn),T[v<<1].Rmin+T[(v<<1)|1].Lmin);
	return;
}
inline void Build(int L,int R,int v)
{
	T[v].L=L;T[v].R=R;
	if(L==R)
	{
		T[v].sum=T[v].minval=a[L];
		if(a[L]>=0)T[v].Lmax=T[v].Rmax=T[v].maxx=a[L];
		else T[v].Lmin=T[v].Rmin=T[v].minn=a[L];
		return;
	}
	int mid=(L+R)>>1;
	Build(L,mid,v<<1);
	Build(mid+1,R,(v<<1)|1);
	pushup(v);
	return;
}
inline void Modify(int x,int val,int v)
{
	if(x>T[v].R||x<T[v].L)return;
	if(T[v].L==T[v].R)
	{
		T[v].sum=T[v].minval=val;
		if(val>=0)
		{
			T[v].Lmax=T[v].Rmax=T[v].maxx=val;
			T[v].Lmin=T[v].Rmin=T[v].minn=0;
		}
		else
		{
			T[v].Lmax=T[v].Rmax=T[v].maxx=0;
			T[v].Lmin=T[v].Rmin=T[v].minn=val;
		}
		return;
	}
	Modify(x,val,v<<1);
	Modify(x,val,(v<<1)|1);
	pushup(v);
	return;
}
int main(void)
{
	int i,x,y,n,m,ans;
	scanf("%d",&n);
	for(i=1;i<=n;++i)scanf("%d",&a[i]);
	Build(1,n,1);
	scanf("%d",&m);
	for(i=1;i<=m;++i)
	{
		scanf("%d%d",&x,&y);
		Modify(x,y,1);
		ans=max(T[1].maxx,T[1].sum-T[1].minn);
		if(ans==T[1].sum)ans-=T[1].minval;
		printf("%d\n",ans);
	}
	return 0;
}
```
