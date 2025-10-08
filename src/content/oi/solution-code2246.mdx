---
title: solution-code2246
categories: 题解
tags: [平衡树]
date: 2018-06-22
---

一道很麻烦的平衡树模板题。

注意：

* 此题空间限制较小，必须把不需要的点计入队列 `q` 中来节省空间，
  同时用 `id` 数组保存位置
* 删除操作时必须清空所有属性，
  因为后面还会用到
* 插入多个元素必须用这些元素单独建立一颗子树再合并
* 对于重复的 `Find` + `Splay` 操作可以用一个函数替代，
  减少代码长度
* `pushup` 的顺序有所不同！


::more


```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
#include <queue>
#define inf 0x3F3F3F3F
#define N 1000005
using namespace std;
int ch[N][2],a[N],id[N],val[N],siz[N],sum[N],Lmax[N],Rmax[N],maxx[N],fa[N],rt,cnt;
bool tag[N],rev[N];
queue<int>q;
inline void pushup(int x)
{
	int L=ch[x][0],R=ch[x][1];
	sum[x]=sum[L]+sum[R]+val[x];
	siz[x]=siz[L]+siz[R]+1;
	maxx[x]=max(max(maxx[L],maxx[R]),Rmax[L]+val[x]+Lmax[R]);
	Lmax[x]=max(Lmax[L],sum[L]+val[x]+Lmax[R]);
	Rmax[x]=max(Rmax[R],Rmax[L]+val[x]+sum[R]);
	return;
}
inline void pushdown(int x)
{
	int L=ch[x][0],R=ch[x][1];
	if(tag[x])
	{
		tag[x]=0;
		if(L)tag[L]=1,val[L]=val[x],sum[L]=val[x]*siz[L];
		if(R)tag[R]=1,val[R]=val[x],sum[R]=val[x]*siz[R];
		if(val[x]>=0)
		{
			if(L)Lmax[L]=Rmax[L]=maxx[L]=sum[L];
			if(R)Lmax[R]=Rmax[R]=maxx[R]=sum[R];
		}
		else
		{
			if(L)Lmax[L]=Rmax[L]=0,maxx[L]=val[x];
			if(R)Lmax[R]=Rmax[R]=0,maxx[R]=val[x];
		}
	}
	if(rev[x])
	{
		rev[x]=0;rev[L]^=1;rev[R]^=1;
		swap(Lmax[L],Rmax[L]);
		swap(Lmax[R],Rmax[R]);
		swap(ch[L][0],ch[L][1]);
		swap(ch[R][0],ch[R][1]);
	}
	return;
}
inline void Rot(int x,int& f)
{
	int y=fa[x],z=fa[y],L=(ch[y][1]==x),R=L^1;
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
inline int Find(int x,int k)
{
	int L=ch[x][0],R=ch[x][1];
	pushdown(x);
	if(siz[L]+1==k)return x;
	if(siz[L]+1>k)return Find(L,k);
	return Find(R,k-siz[L]-1);
}
inline void del(int x)
{
	if(!x)return;
	int L=ch[x][0],R=ch[x][1];
	del(L);del(R);
	q.push(x);
	fa[x]=ch[x][0]=ch[x][1]=0;
	tag[x]=rev[x]=0;
	return;
}
inline int Split(int L,int tot)
{
	int x=Find(rt,L),y=Find(rt,L+tot+1);
	Splay(x,rt);
	Splay(y,ch[x][1]);
	return ch[y][0];
}
inline void Query(int L,int tot)
{
	printf("%d\n",sum[Split(L,tot)]);
	return;
}
inline void Modify(int L,int tot,int value)
{
	int x=Split(L,tot),y=fa[x],z=fa[y];
	val[x]=value;
	tag[x]=1;sum[x]=siz[x]*value;
	if(value>=0)Lmax[x]=Rmax[x]=maxx[x]=sum[x];
	else Lmax[x]=Rmax[x]=0,maxx[x]=value;
	pushup(y);
	pushup(z);
	return;
}
inline void Rev(int L,int tot)
{
	int x=Split(L,tot),y=fa[x],z=fa[y];
	if(!tag[x])
	{
		rev[x]^=1;
		swap(ch[x][0],ch[x][1]);
		swap(Lmax[x],Rmax[x]);
		pushup(y);
		pushup(z);
	}
	return;
}
inline void del(int L,int tot)
{
	int x=Split(L,tot),y=fa[x],z=fa[y];
	del(x);ch[y][0]=0;
	pushup(y);
	pushup(z);
	return;
}
inline void Build(int L,int R,int f)
{
	if(L>R)return;
	int mid=(L+R)>>1,now=id[mid],lst=id[f];
	if(L==R)
	{
		sum[now]=a[L];
		siz[now]=1;
		tag[now]=rev[now]=0;
		if(a[L]>=0)Lmax[now]=Rmax[now]=maxx[now]=a[L];
		else Lmax[now]=Rmax[now]=0,maxx[now]=a[L];
	}
	else
	{
		Build(L,mid-1,mid);
		Build(mid+1,R,mid);
	}
	val[now]=a[mid];
	fa[now]=lst;
	pushup(now);
	ch[lst][mid>=f]=now;
	return;
}
inline void Insert(int L,int tot)
{
	int i,x,y,z;
	for(i=1;i<=tot;++i)scanf("%d",&a[i]);
	for(i=1;i<=tot;++i)
	{
		if(!q.empty())id[i]=q.front(),q.pop();
		else id[i]=++cnt;
	}
	Build(1,tot,0);z=id[(tot+1)>>1];
	x=Find(rt,L+1);y=Find(rt,L+2);
	Splay(x,rt);
	Splay(y,ch[x][1]);
	fa[z]=y;ch[y][0]=z;
	pushup(y);
	pushup(x);
	return;
}
char cmd[15];
int main(void)
{
	int i,n,m,L,tot,value;
	scanf("%d%d",&n,&m);
	maxx[0]=a[1]=a[n+2]=-inf;
	for(i=1;i<=n;++i)scanf("%d",&a[i+1]);
	for(i=1;i<=n+2;++i)id[i]=i;
	Build(1,n+2,0);
	rt=(n+3)>>1;cnt=n+2;
	while(m--)
	{
		scanf("%s",cmd);
		if(strcmp(cmd,"INSERT")==0)
		{
			scanf("%d%d",&L,&tot);
			Insert(L,tot);
		}
		if(strcmp(cmd,"DELETE")==0)
		{
			scanf("%d%d",&L,&tot);
			del(L,tot);
		}
		if(strcmp(cmd,"MAKE-SAME")==0)
		{
			scanf("%d%d%d",&L,&tot,&value);
			Modify(L,tot,value);
		}
		if(strcmp(cmd,"REVERSE")==0)
		{
			scanf("%d%d",&L,&tot);
			Rev(L,tot);
		}
		if(strcmp(cmd,"GET-SUM")==0)
		{
			scanf("%d%d",&L,&tot);
			Query(L,tot);
		}
		if(strcmp(cmd,"MAX-SUM")==0)printf("%d\n",maxx[rt]);
	}
	return 0;
}

```
