---
title: solution-code3329
categories: 题解
tags: [LCA,DP]
date: 2018-06-20
---

注意 `n`、`m` 和 `tmp` 的区别！

注意清零时候的优化，不需要的值不要清零！

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
	int to,next;
	LL val;
}e[500005];
int n,a[250005],h[250005],low[250005],d[250005],f[250005][19],st[250005],flag[250005],cnt,sign,qid;
LL dp[250005],maxv[250005];
inline void Addedge(int x,int y,LL v)
{
	e[++cnt]=(Node){y,h[x],v};h[x]=cnt;
	e[++cnt]=(Node){x,h[y],v};h[y]=cnt;
	return;
}
inline bool cmp(const int& x,const int& y)
{
	return low[x]<low[y];
}
inline void dfs(int x,int pre,LL val)
{
	int i,y;
	low[x]=++sign;
	d[x]=d[pre]+1;
	f[x][0]=pre;
	maxv[x]=min(maxv[pre],val);
	for(i=h[x];i;i=e[i].next)
	{
		y=e[i].to;
		if(y==pre)continue;
		dfs(y,x,e[i].val);
	}
	return;
}
inline void Init()
{
	int i,j;
	for(j=1;j<=18;++j)
	{
		for(i=1;i<=n;++i)f[i][j]=f[f[i][j-1]][j-1];
	}
	return;
}
inline int LCA(int x,int y)
{
	int i;
	if(d[x]<d[y])swap(x,y);
	for(i=18;i>=0;--i)
	{
		if(d[f[x][i]]>=d[y])x=f[x][i];
	}
	if(x==y)return x;
	for(i=18;i>=0;--i)
	{
		if(f[x][i]==f[y][i])continue;
		x=f[x][i];y=f[y][i];
	}
	return f[x][0];
}
inline LL DP(int x,int pre)
{
	int i,y;
	if(flag[x]==qid)return maxv[x];
	for(i=h[x];i;i=e[i].next)
	{
		y=e[i].to;
		if(y==pre)continue;
		dp[x]+=DP(y,x);
	}
	return dp[x]=min(dp[x],1LL*maxv[x]);
}
inline void Printst()
{
	for(int i=1;i<=st[0];++i)printf("%d ",st[i]);
	return;
}
inline int Build(int m)
{
	int i,x,y,lca,tmp=m;
	for(i=1;i<=m;++i)flag[a[i]]=qid;
	sort(a+1,a+m+1,cmp);a[++m]=1;
	for(i=1;i<tmp;++i)a[++m]=LCA(a[i],a[i+1]);
	sort(a+1,a+m+1,cmp);
	tmp=m;m=1;
	for(i=2;i<=tmp;++i)
	{
		if(a[i]==a[i-1])continue;
		a[++m]=a[i];
	}
	st[st[0]=1]=a[1];
	for(i=1;i<=m;++i)h[a[i]]=dp[a[i]]=0;
	cnt=0;
	for(i=2;i<=m;++i)
	{
		x=a[i];y=st[st[0]];
		lca=LCA(x,y);
		while(st[st[0]]!=lca)
		{
			Addedge(st[st[0]],st[st[0]-1],0);
			--st[0];
		}
		st[++st[0]]=x;
	}
	while(st[st[0]]!=1)
	{
		Addedge(st[st[0]],st[st[0]-1],0);
		--st[0];
	}
	return m;
}
inline void Solve(int m)
{
	m=Build(m);
	printf("%lld\n",DP(1,0));
	return;
}
int main(void)
{
	int m,T,i,j,x,y;
	LL v;
	scanf("%d",&n);
	for(i=1;i<n;++i)
	{
		scanf("%d%d%lld",&x,&y,&v);
		Addedge(x,y,v);
	}
	maxv[0]=1LL<<60;
	dfs(1,0,1LL<<60);
	Init();
	scanf("%d",&T);
	for(i=1;i<=T;++i)
	{
		qid=i;
		scanf("%d",&m);
		for(j=1;j<=m;++j)scanf("%d",&a[j]);
		Solve(m);
	}
	return 0;
}

```
