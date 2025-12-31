---
title: solution-code2023
categories: 题解
tags: [平衡树]
date: 2018-06-23
---

此题有三个类似的插入操作，可以用一个函数简化代码量。

::more


```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
#define inf 0x3F3F3F3F
using namespace std;
int n,m,a[80005],ch[80005][2],fa[80005],siz[80005],val[80005],pos[80005],rt;
inline void pushup(int x)
{
	int L=ch[x][0],R=ch[x][1];
	siz[x]=siz[L]+siz[R]+1;
	return;
}
inline void Rot(int x,int& f)
{
	int y=fa[x],z=fa[y],L=(ch[y][0]!=x),R=L^1;
	if(y==f)f=x;
	else
	{
		if(ch[z][0]==y)ch[z][0]=x;
		else ch[z][1]=x;
	}
	fa[ch[x][R]]=y;
	fa[y]=x;fa[x]=z;
	ch[y][L]=ch[x][R];
	ch[x][R]=y;
	pushup(y);
	pushup(x);
	return;
}
inline void Splay(int x,int& f)
{
	while(x!=f)
	{
		int y=fa[x],z=fa[y];
		if(y!=f)
		{
			if(ch[y][0]==x^ch[z][0]==y)Rot(x,f);
			else Rot(y,f);
		}
		Rot(x,f);
	}
	return;
}
inline void Build(int L,int R,int f)
{
	if(L>R)return;
	int now=L,lst=f;
	if(L==R)
	{
		val[now]=a[L];
		siz[now]=1;
		fa[now]=lst;
		ch[lst][L>=f]=now;
		return;
	}
	int mid=(L+R)>>1;now=mid;
	Build(L,mid-1,mid);
	Build(mid+1,R,mid);
	val[now]=a[mid];
	fa[now]=lst;
	pushup(now);
	ch[lst][mid>=f]=now;
	return;
}
inline int Find(int x,int k)
{
	int L=ch[x][0],R=ch[x][1];
	if(siz[L]+1==k)return x;
	if(siz[L]+1>k)return Find(L,k);
	return Find(R,k-siz[L]-1);
}
inline void Del(int k)
{
	int x=Find(rt,k-1),y=Find(rt,k+1);
	Splay(x,rt);
	Splay(y,ch[x][1]);
	fa[ch[y][0]]=siz[ch[y][0]]=0;
	ch[y][0]=0;
	pushup(y);
	pushup(x);
	return;
}
inline void Move(int k,int value)
{
	int x,y,z=pos[k],rnk;
	Splay(z,rt);rnk=siz[ch[z][0]]+1;
	Del(rnk);
	if(value==inf)x=Find(rt,n),y=Find(rt,n+1);
	else if(value==-inf)x=Find(rt,1),y=Find(rt,2);
	else x=Find(rt,rnk+value-1),y=Find(rt,rnk+value);
	Splay(x,rt);
	Splay(y,ch[x][1]);
	siz[z]=1;fa[z]=y;
	ch[y][0]=z;
	pushup(y);
	pushup(x);
	return;
}
char cmd[10];
int main(void)
{
	int i,x,y;
	scanf("%d%d",&n,&m);
	for(i=2;i<=n+1;++i)
	{
		scanf("%d",&a[i]);
		pos[a[i]]=i;
	}
	Build(1,n+2,0);
	rt=(n+3)>>1;
	for(i=1;i<=m;++i)
	{
		scanf("%s%d",cmd,&x);
		if(strcmp(cmd,"Top")==0)Move(x,-inf);
		if(strcmp(cmd,"Bottom")==0)Move(x,inf);
		if(strcmp(cmd,"Insert")==0)
		{
			scanf("%d",&y);
			Move(x,y);
		}
		if(strcmp(cmd,"Ask")==0)
		{
			Splay(pos[x],rt);
			printf("%d\n",siz[ch[pos[x]][0]]-1);
		}
		if(strcmp(cmd,"Query")==0)printf("%d\n",val[Find(rt,x+1)]);
	}
	return 0;
}

```
