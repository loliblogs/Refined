---
title: "[CodeForces1000]E. We Need More Bosses"
tags: [无向图的连通性,DP]
date: 2018-06-28
categories: [题解]
showproblem: 1
---

无向图求割边的模板题，缩点后建立新图 DP 一下就可以了。

对于每条割边，答案都可以为 `dp[x]+1+dp[y]`，
然后 `dp[x]=dp[y]+1`（合并节点 `x` 和 `y`）。

只需要注意 `e1`、`e2` 的区别和 `h1`、`h2` 的区别就行了。

::more

:::center
## E. We Need More Bosses
:::

::center[time limit per test\: 2 seconds]

::center[memory limit per test\: 256 megabytes]

::center[input\: standard input]

::center[output\: standard output]

Your friend is developing a computer game.
He has already decided how the game world should look like —
it should consist of $n$ locations connected by $m$ **two-way** passages.
The passages are designed in such a way that it should be possible
to get from any location to any other location.

Of course, some passages should be guarded by the monsters
(if you just can go everywhere without any difficulties, then it's not fun, right?).
Some crucial passages will be guarded by really fearsome monsters,
requiring the hero to prepare for battle and designing his own tactics of defeating them
(commonly these kinds of monsters are called **bosses**).
And your friend wants you to help him place these bosses.

The game will start in location $s$ and end in location $t$,
but these locations are not chosen yet.
After choosing these locations, your friend will place a boss in each passage
such that it is impossible to get from $s$ to $t$ without using this passage.
Your friend wants to place as much bosses as possible
(because more challenges means more fun, right?),
so he asks you to help him determine the maximum possible number of bosses,
considering that any location can be chosen as $s$ or as $t$.

### Input

The first line contains two integers $n$ and $m$
($2 \le n \le 3 \cdot 10^5$, $n - 1 \le m \le 3 \cdot 10^5$) —
the number of locations and passages, respectively.

Then $m$ lines follow, each containing two integers $x$ and $y$
($1 \le x, y \le n$, $x \ne y$) describing the endpoints of one of the passages.

It is guaranteed that there is no pair of locations directly connected by two or more passages,
and that any location is reachable from any other location.

### Output

Print one integer — the maximum number of bosses your friend can place,
considering all possible choices for $s$ and $t$.

### Examples
#### input
```plain
5 5
1 2
2 3
3 1
4 1
5 2
```
#### output
```plain
2
```
#### input
```plain
4 3
1 2
4 3
3 2
```
#### output
```plain
3
```

```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
#include <stack>
using namespace std;
struct Node
{
	int to,next;
}e1[600005],e2[600005];
int low[300005],dfn[300005],h1[300005],h2[300005],belong[300005],f[300005],cnt1,cnt2,sign,ans,SCC;
stack<int>s;
inline void Addedge1(int x,int y)
{
	e1[++cnt1]=(Node){y,h1[x]};h1[x]=cnt1;return;
}
inline void Addedge2(int x,int y)
{
	e2[++cnt2]=(Node){y,h2[x]};h2[x]=cnt2;return;
}
inline void Tarjan(int x,int pre)
{
	int i,y,tmp;
	low[x]=dfn[x]=++sign;
	s.push(x);
	for(i=h1[x];i;i=e1[i].next)
	{
		y=e1[i].to;
		if(y==pre)continue;
		if(!dfn[y])
		{
			Tarjan(y,x);
			low[x]=min(low[x],low[y]);
		}
		else low[x]=min(low[x],dfn[y]);
	}
	if(low[x]==dfn[x])
	{
		++SCC;
		do
		{
			tmp=s.top();s.pop();
			belong[tmp]=SCC;
		}while(tmp!=x);
	}
	return;
}
inline void dfs(int x,int pre)
{
	int i,y;
	for(i=h2[x];i;i=e2[i].next)
	{
		y=e2[i].to;
		if(y==pre)continue;
		dfs(y,x);
		ans=max(ans,f[x]+f[y]+1);
		f[x]=max(f[x],f[y]+1);
	}
	return;
}
int main(void)
{
	int i,x,y,n,m;
	scanf("%d%d",&n,&m);
	for(i=1;i<=m;++i)
	{
		scanf("%d%d",&x,&y);
		Addedge1(x,y);
		Addedge1(y,x);
	}
	Tarjan(1,0);
	for(x=1;x<=n;++x)
	{
		for(i=h1[x];i;i=e1[i].next)
		{
			y=e1[i].to;
			if(belong[x]==belong[y])continue;
			Addedge2(belong[x],belong[y]);
		}
	}
	dfs(1,0);
	printf("%d\n",ans);
	return 0;
}
```
