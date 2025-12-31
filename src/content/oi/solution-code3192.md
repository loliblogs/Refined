---
title: solution-code3192
categories: 题解
tags: [费用流]
date: 2018-06-24
---

把图上的每个点拆成两个点，按照老套路连边，
把交换的连边流量无穷、代价为 `1`，
其余的边流量为 `1`、代价为 `0`，
如果满流就输出代价

注意 `num1` 和 `num2` 数组的值，
这里的 `id` 不能重复！

::more


```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
#include <queue>
#define inf 0x3F3F3F3F
using namespace std;
struct Node
{
	int to,next,v,cost;
}e[100005];
int S,T,P,a[25][25],b[25][25],num1[25][25],num2[25][25],cnt=1;
int h[10005],d[10005],pre[10005],flow,cost;
bool vis[10005];
inline void Addedge(int x,int y,int v,int cost=0)
{
	e[++cnt]=(Node){y,h[x],v,cost};h[x]=cnt;
	e[++cnt]=(Node){x,h[y],0,-cost};h[y]=cnt;
	return;
}
inline bool SPFA()
{
	int i,x,y;
	queue<int>q;q.push(S);
	memset(d,0x3F,sizeof(d));d[S]=0;
	memset(vis,0,sizeof(vis));
	memset(pre,0,sizeof(pre));
	while(!q.empty())
	{
		x=q.front();q.pop();
		vis[x]=false;
		for(i=h[x];i;i=e[i].next)
		{
			y=e[i].to;
			if(e[i].v&&d[y]>d[x]+e[i].cost)
			{
				d[y]=d[x]+e[i].cost;
				pre[y]=i;
				if(!vis[y]){vis[y]=true;q.push(y);}
			}
		}
	}
	if(d[T]<0x3F3F3F3F)return true;
	return false;
}
inline void Adjust()
{
	int i,j=T,delta=0x3F3F3F3F;
	while(pre[j])
	{
		i=pre[j];
		if(e[i].v<delta)delta=e[i].v;
		j=e[i^1].to;
	}
	cost+=delta*d[T];
	flow+=delta;
	j=T;
	while(pre[j])
	{
		i=pre[j];
		e[i].v-=delta;
		e[i^1].v+=delta;
		j=e[i^1].to;
	}
	return;
}
const int dx[]={-1,-1,-1,0,0,1,1,1},dy[]={-1,0,1,-1,1,-1,0,1};
int main(void)
{
	int i,j,k,x,newx,newy,n,m,ch,sum=0,id=0;
	scanf("%d%d",&n,&m);
	for(i=1;i<=n;++i)
	{
		for(j=1;j<=m;++j)
		{
			while(ch=getchar())if(ch>='0'&&ch<='9')break;
			a[i][j]=ch-'0';sum+=a[i][j];
		}
	}
	for(i=1;i<=n;++i)
	{
		for(j=1;j<=m;++j)
		{
			while(ch=getchar())if(ch>='0'&&ch<='9')break;
			b[i][j]=ch-'0';sum-=b[i][j];
		}
	}
	if(sum){printf("-1\n");return 0;}
	for(i=1;i<=n;++i)
	{
		for(j=1;j<=m;++j)num1[i][j]=++id;
	}
	for(i=1;i<=n;++i)
	{
		for(j=1;j<=m;++j)num2[i][j]=++id;
	}
	S=2*n*m+1;T=P=2*n*m+2;
	for(i=1;i<=n;++i)
	{
		for(j=1;j<=m;++j)
		{
			if(a[i][j]&&!b[i][j])Addedge(S,num1[i][j],1),++sum;
			if(!a[i][j]&&b[i][j])Addedge(num2[i][j],T,1);
		}
	}
	for(i=1;i<=n;++i)
	{
		for(j=1;j<=m;++j)
		{
			while(ch=getchar())if(ch>='0'&&ch<='9')break;
			x=ch-'0';
			Addedge(num1[i][j],num2[i][j],x>>1);
			if((a[i][j]!=b[i][j])&&(x&1))Addedge(num1[i][j],num2[i][j],1);
			for(k=0;k<8;++k)
			{
				newx=i+dx[k];newy=j+dy[k];
				if(newx<1||newx>n||newy<1||newy>m)continue;
				Addedge(num2[i][j],num1[newx][newy],inf,1);
			}
		}
	}
	while(SPFA())Adjust();
	if(flow!=sum){printf("-1\n");return 0;}
	printf("%d\n",cost);
	return 0;
}

```
