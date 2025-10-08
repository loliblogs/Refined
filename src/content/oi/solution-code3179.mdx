---
title: solution-code3179
date: 2018-06-16
categories: 题解
tags: [平衡树]
---

一个简单的 Splay 模板题，
就是**数组大小一定要乘 2 ！**

::more


```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
using namespace std;
int a[200005],maxx[200005],ch[200005][2],fa[200005],siz[200005],val[200005],rt,cnt;
inline void pushup(int x)
{
	int L=ch[x][0],R=ch[x][1];
	maxx[x]=max(val[x],max(maxx[L],maxx[R]));
	siz[x]=siz[L]+siz[R]+1;
	return;
}
inline void Rot(int x,int& f)
{
	int y=fa[x],z=fa[y],L=(ch[y][0]!=x),R=(L^1);
	if(y==f)f=x;
	else
	{
		if(ch[z][0]==y)ch[z][0]=x;
		else ch[z][1]=x;
	}
	fa[x]=z;fa[y]=x;
	fa[ch[x][R]]=y;
	ch[y][L]=ch[x][R];
	ch[x][R]=y;
	pushup(y);pushup(x);
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
	if(siz[L]+1==k)return x;
	if(siz[L]+1>k)return Find(L,k);
	return Find(R,k-siz[L]-1);
}
inline void Build(int L,int R,int pre)
{
	if(L>R)return;
	int mid=(L+R)>>1;
	if(L==R)
	{
		maxx[mid]=a[mid-1];
		siz[mid]=1;
		ch[mid][0]=ch[mid][1]=0;
	}
	else
	{
		Build(L,mid-1,mid);
		Build(mid+1,R,mid);
	}
	val[mid]=a[mid-1];
	fa[mid]=pre;
	pushup(mid);
	ch[pre][mid>=pre]=mid;
	return;
}
inline int Delete(int x)
{
	int L=Find(rt,x),R=Find(rt,x+2);
	Splay(L,rt);
	Splay(R,ch[L][1]);
	int tmp=val[ch[R][0]];
	siz[ch[R][0]]=0;
	fa[ch[R][0]]=0;
	ch[R][0]=0;
	pushup(R);
	pushup(L);
	return tmp;
}
inline void Insert(int x,int value)
{
	int L=Find(rt,x+1),R=Find(rt,x+2);
	Splay(L,rt);
	Splay(R,ch[L][1]);
	fa[++cnt]=R;
	val[cnt]=maxx[cnt]=value;
	siz[cnt]=1;
	ch[R][0]=cnt;
	pushup(R);
	pushup(L);
	return;
}
inline int Ask(int x,int y)
{
	int L=Find(rt,x),R=Find(rt,y+2);
	Splay(L,rt);
	Splay(R,ch[L][1]);
	return maxx[ch[R][0]];
}
int main(void)
{
	int i,n,m,x,y;
	char dir;
	scanf("%d%d",&n,&m);
	for(i=1;i<=n;++i)scanf("%d",&a[i]);
	Build(1,n+2,0);
	rt=n+3>>1;
	cnt=n+2;
	for(i=1;i<=m;++i)
	{
		scanf("%d %c %d",&x,&dir,&y);
		if(dir=='L')printf("%d\n",Ask(x-y,x-1));
		if(dir=='D')printf("%d\n",Ask(x+1,x+y));
		int tmp=Delete(x);
		if(dir=='L')Insert(x-y-1,tmp);
		if(dir=='D')Insert(x+y-1,tmp);
	}
	return 0;
}
```
