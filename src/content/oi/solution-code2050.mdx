---
title: solution-code2050
categories: 题解
tags: [二分]
date: 2018-06-25
---

相信大家一眼就看出是二分答案的模板题，
问题就是如何检验是否可行。

我们先求出最小的能够包含所有点的矩形，
暴力选取四个角分别覆盖，再这样操作一次，
检验最后一个矩形的大小就可以了。

注意覆盖完成后要恢复到初始状态！！

::more


```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
#define inf 0x3F3F3F3F
using namespace std;
struct Node
{
	int x,y;
	bool cover[2];
}a[20005];
struct Rectangle
{
	int x1,y1,x2,y2;
};
int n;
inline Rectangle get()
{
	Rectangle rec;
	rec.x1=rec.y1=inf;
	rec.x2=rec.y2=-inf;
	for(int i=1;i<=n;++i)
	{
		if(a[i].cover[0]||a[i].cover[1])continue;
		rec.x1=min(rec.x1,a[i].x);
		rec.y1=min(rec.y1,a[i].y);
		rec.x2=max(rec.x2,a[i].x);
		rec.y2=max(rec.y2,a[i].y);
	}
	return rec;
}
inline void cover(int x,int y,int len,int index,bool flag)
{
	int i;
	for(i=1;i<=n;++i)
	{
		if(a[i].x>=x&&a[i].x<=x+len&&a[i].y>=y&&a[i].y<=y+len)a[i].cover[index]=flag;
	}
	return;
}
inline void cover(Rectangle rec,int limit,int corner,int index,bool flag)
{
	if(corner==1)cover(rec.x1,rec.x2,limit,index,flag);
	if(corner==2)cover(rec.x2-limit,rec.y1,limit,index,flag);
	if(corner==3)cover(rec.x1,rec.y2-limit,limit,index,flag);
	if(corner==4)cover(rec.x2-limit,rec.y2-limit,limit,index,flag);
	return;
}
inline bool check(int limit)
{
	int i,j;
	for(i=1;i<=n;++i)a[i].cover[0]=a[i].cover[1]=false;
	Rectangle rec1=get();
	for(i=1;i<=4;++i)
	{
		cover(rec1,limit,i,0,true);
		Rectangle rec2=get();
		for(j=1;j<=4;++j)
		{
			cover(rec2,limit,j,1,true);
			Rectangle rec3=get();
			if(max(rec3.x2-rec3.x1,rec3.y2-rec3.y1)<=limit)return true;
			cover(rec2,limit,j,1,false);
		}
		cover(rec1,limit,i,0,false);
	}
	return false;
}
int main(void)
{
	freopen("2050.in","r",stdin);
	int i,L,R,mid;
	scanf("%d",&n);
	for(i=1;i<=n;++i)scanf("%d%d",&a[i].x,&a[i].y);
	Rectangle rec=get();
	L=0;R=max(rec.x2-rec.x1,rec.y2-rec.y1);
	while(L<R)
	{
		mid=(L+R)>>1;
		if(check(mid))R=mid;
		else L=mid+1;
	}
	printf("%d\n",L);
	return 0;
}
```
