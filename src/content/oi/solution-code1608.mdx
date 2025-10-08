---
title: solution-code1608
categories: 题解
tags: [RMQ,二叉堆]
date: 2018-06-18
---

二叉堆和 RMQ 结合的好题，不停地取 Query 的最大值即可。

::more


```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
#include <cmath>
using namespace std;
struct Node
{
	int x,y,id;
}a[50005];
int n,f[50005][17],pos[50005][17],fa[50005],Ls[50005],Rs[50005];
inline void Init(void)
{
	int i,j;
	for(i=1;i<=n;++i)
	{
		f[i][0]=a[i].y;
		pos[i][0]=i;
	}
	for(j=1;j<=16;++j)
	{
		for(i=1;i+(1<<j)-1<=n;++i)
		{
			if(f[i][j-1]<f[i+(1<<(j-1))][j-1])
			{
				f[i][j]=f[i][j-1];
				pos[i][j]=pos[i][j-1];
			}
			else if(f[i][j-1]>f[i+(1<<(j-1))][j-1])
			{
				f[i][j]=f[i+(1<<(j-1))][j-1];
				pos[i][j]=pos[i+(1<<(j-1))][j-1];
			}
		}
	}
	return;
}
inline int Ask(int L,int R)
{
	int x=log2(R-L+1);
	if(f[L][x]<=f[R-(1<<x)+1][x])return pos[L][x];
	else return pos[R-(1<<x)+1][x];
}
inline int dfs(int L,int R,int pre)
{
	if(L>R)return 0;
	int mid=Ask(L,R),x=a[mid].id;
	fa[x]=pre;
	Ls[x]=dfs(L,mid-1,x);
	Rs[x]=dfs(mid+1,R,x);
	return x;
}
inline bool cmp(const Node& a,const Node& b)
{
	return a.x<b.x;
}
int main(void)
{
	int i,x,y,rt;
	scanf("%d",&n);
	for(i=1;i<=n;++i)
	{
		scanf("%d%d",&x,&y);
		a[i]=(Node){x,y,i};
	}
	sort(a+1,a+n+1,cmp);
	Init();
	rt=dfs(1,n,0);
	printf("YES\n");
	for(i=1;i<=n;++i)printf("%d %d %d\n",fa[i],Ls[i],Rs[i]);
	return 0;
}
```
