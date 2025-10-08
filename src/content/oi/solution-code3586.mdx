---
title: solution-code3586
categories: 题解
tags: [RMQ]
date: 2018-06-22
---

RMQ 模板题，
用 `b` 数组记录每个区段的最大值

::more


```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
#include <climits>
#include <cmath>
using namespace std;
int n,m,a[100005],b[100005][20],sum[100005];
inline void ST(void)
{
	int i,j;
	for(j=1;(1<<j)<=n;++j)
	{
		for(i=1;i+(1<<j)-1<=n;++i)
		{
			b[i][j]=max(b[i][j-1],b[i+(1<<(j-1))][j-1]);
		}
	}
	return;
}
inline int ask(int L,int R)
{
	if(L>R)return 0;
	int x=int((log(R-L+1))/log(2));
	return max(b[L][x],b[R-(1<<x)+1][x]);
}
int main(void)
{
	int i,pos,L,R;
	scanf("%d%d",&n,&m);pos=n;
	for(i=1;i<=n;++i)
	{
		scanf("%d",&a[i]);
		if(a[i]==a[i-1])b[i][0]=b[i-1][0]+1;
		else b[i][0]=1;
	}
	for(i=n;i>=1;--i)
	{
		if(a[i]==a[i+1])sum[i]=b[pos][0];
		else pos=i,sum[i]=b[pos][0];
	}
	ST();
	for(i=1;i<=m;++i)
	{
		scanf("%d%d",&L,&R);
		printf("%d\n",min(R-L+1,max(max(sum[L]-b[L][0]+1,b[R][0]),ask(L+sum[L]-b[L][0]+1,R-b[R][0]))));
	}
	return 0;
}
```
