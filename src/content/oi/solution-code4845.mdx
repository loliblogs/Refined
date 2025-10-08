---
title: solution-code4845
categories: 题解
tags: [KD树]
date: 2018-06-24
---

KD 树模板题，注意细节（`mn` 和 `mx` 等）

`Insert` 的时候，
可以使用 `In` 和 `Out` 函数使得程序更简洁、美观

::more


```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
#define LL long long
using namespace std;
struct Node
{
	int L,R;
	LL d[2],mx[2],mn[2],val,sum;
}Now,T[200005],p[200005];
LL Ax,Ay,Bx,By;
int D,rt,cnt=0;
inline bool cmp(const Node& a,const Node& b)
{
	return a.d[D]<b.d[D];
}
inline void pushup(int v)
{
	int i,L=T[v].L,R=T[v].R;
	for(i=0;i<2;++i)
	{
		T[v].mn[i]=T[v].mx[i]=T[v].d[i];
		if(L)
		{
			T[v].mx[i]=max(T[v].mx[i],T[L].mx[i]);
			T[v].mn[i]=min(T[v].mn[i],T[L].mn[i]);
		}
		if(R)
		{
			T[v].mx[i]=max(T[v].mx[i],T[R].mx[i]);
			T[v].mn[i]=min(T[v].mn[i],T[R].mn[i]);
		}
	}
	T[v].sum=T[L].sum+T[R].sum+T[v].val;
	return;
}
inline int Build(int L,int R,int now)
{
	if(L>R)return 0;
	int mid=(L+R)>>1,v=mid;
	D=now;
	nth_element(p+L,p+mid,p+R+1,cmp);
	T[v]=p[v];
	T[v].L=Build(L,mid-1,now^1);
	T[v].R=Build(mid+1,R,now^1);
	pushup(v);
	return v;
}
inline void Insert(int& v,int now)
{
	if(!v)
	{
		v=++cnt;T[v]=Now;
		return;
	}
	if(Now.d[0]==T[v].d[0]&&Now.d[1]==T[v].d[1])
	{
		T[v].sum+=Now.val;
		T[v].val+=Now.val;
		return;
	}
	if(Now.d[now]<T[v].d[now])Insert(T[v].L,now^1);
	else Insert(T[v].R,now^1);
	pushup(v);
	return;
}
inline bool In(int v)
{
	if(Ax<=T[v].mn[0]&&Ay<=T[v].mn[1]&&Bx>=T[v].mx[0]&&By>=T[v].mx[1])return true;
	return false;
}
inline bool Out(int v)
{
	if(Ax>T[v].mx[0]||Ay>T[v].mx[1]||Bx<T[v].mn[0]||By<T[v].mn[1])return true;
	return false;
}
inline LL Query(int v)
{
	if(!v)return 0;
	if(Out(v))return 0;
	if(In(v))return T[v].sum;
	int L=T[v].L,R=T[v].R;
	LL tmp=0;
	if(Ax<=T[v].d[0]&&Ay<=T[v].d[1]&&Bx>=T[v].d[0]&&By>=T[v].d[1])tmp+=T[v].val;
	return tmp+Query(L)+Query(R);
}
int main(void)
{
	int i,cmd,times=10000;
	LL n,x,y,z,lst=0;
	scanf("%lld",&n);
	while(true)
	{
		scanf("%d",&cmd);
		if(cmd==1)
		{
			scanf("%lld%lld%lld",&x,&y,&z);
			x^=lst;y^=lst;z^=lst;
			Now.sum=Now.val=z;
			Now.d[0]=Now.mn[0]=Now.mx[0]=x;
			Now.d[1]=Now.mn[1]=Now.mx[1]=y;
			Insert(rt,0);
			if(cnt>times)
			{
				for(i=1;i<=cnt;++i)p[i]=T[i];
				rt=Build(1,cnt,0);
				times+=10000;
			}
		}
		if(cmd==2)
		{
			scanf("%lld%lld%lld%lld",&Ax,&Ay,&Bx,&By);
			Ax^=lst;Ay^=lst;Bx^=lst;By^=lst;
			printf("%lld\n",lst=Query(rt));
		}
		if(cmd==3)break;
	}
	return 0;
}
```
