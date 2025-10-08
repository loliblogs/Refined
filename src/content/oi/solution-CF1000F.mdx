---
title: "[CodeForces1000]F. One Occurrence"
tags: [线段树]
date: 2018-06-28
categories: 题解
---

一道有意思的线段树题目，维护一个 pair 值
（下一个元素的位置, 权值）对其维护最大值（就是影响越持久）。

把问题离线处理，按照问题的右端点排序，这样就能满足单调性。

输出的时候一定要判断一下 `first` 的值是否符合要求。

注意：

* 这棵线段树维护的是最大值，不管是**修改**还是查询都需要取 `max`
* 如果没有 `nxt`，数组的值要赋值为 `n+1`

::more

:::center
## F. One Occurrence
:::

::center[time limit per test\: 3 seconds]

::center[memory limit per test\: 768 megabytes]

::center[input\: standard input]

::center[output\: standard output]

You are given an array $a$ consisting of $n$ integers, and $q$ queries to it.
$i$-th query is denoted by two integers $l_i$ and $r_i$.
For each query, you have to **find** any integer that occurs **exactly once**
in the subarray of $a$ from index $l_i$ to index $r_i$
(a subarray is a contiguous subsegment of an array).
For example, if $a = [1, 1, 2, 3, 2, 4]$,
then for query $(l_i = 2, r_i = 6)$ the subarray we are interested in is $[1, 2, 3, 2, 4]$,
and possible answers are $1$, $3$ and $4$;
for query $(l_i = 1, r_i = 2)$ the subarray we are interested in is $[1, 1]$,
and there is no such element that occurs exactly once.

Can you answer all of the queries?

### Input

The first line contains one integer $n$ ($1 \le n \le 5 \cdot 10^5$).

The second line contains $n$ integers $a_1, a_2, \dots, a_n$ ($1 \le a_i \le 5 \cdot 10^5$).

The third line contains one integer $q$ ($1 \le q \le 5 \cdot 10^5$).

Then $q$ lines follow, $i$-th line containing two integers $l_i$ and $r_i$
representing $i$-th query ($1 \le l_i \le r_i \le n$).

### Output

Answer the queries as follows:

If there is no integer such that it occurs in the subarray from index $l_i$ to index $r_i$ exactly once,
print $0$. Otherwise print any such integer.

### Example
#### input
```plain
6
1 1 2 3 2 4
2
2 6
1 2
```
#### output
```plain
4
0
```

```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
#define inf 0x3F3F3F3F
using namespace std;
typedef pair<int,int>pii;
struct Node
{
	int L,R,id;
}b[500005];
struct Tree
{
	int L,R;
	pii val;
}T[2000005];
int a[500005],pre[500005],nxt[500005],h[500005],ans[500005];
inline void Modify(int L,int R,pii val,int v)
{
	if(L>T[v].R||R<T[v].L)return;
	if(L<=T[v].L&&R>=T[v].R)
	{
		T[v].val=max(T[v].val,val);return;
	}
	Modify(L,R,val,v<<1);
	Modify(L,R,val,(v<<1)|1);
	return;
}
inline pii Query(int x,int v)
{
	if(x>T[v].R||x<T[v].L)return make_pair(-inf,0);
	if(T[v].L==T[v].R)return T[v].val;
	return max(T[v].val,max(Query(x,v<<1),Query(x,(v<<1)|1)));
}
inline void Build(int L,int R,int v)
{
	T[v].L=L;T[v].R=R;
	T[v].val=make_pair(-inf,0);
	if(L==R)return;
	int mid=(L+R)>>1;
	Build(L,mid,v<<1);
	Build(mid+1,R,(v<<1)|1);
	return;
}
inline bool cmp(const Node& a,const Node& b)
{
	return a.R<b.R;
}
int main(void)
{
	int i,j=1,n,m;
	scanf("%d",&n);
	for(i=1;i<=n;++i)scanf("%d",&a[i]);
	for(i=1;i<=n;++i)
	{
		if(!h[a[i]])pre[i]=0;
		else pre[i]=h[a[i]];
		h[a[i]]=i;
	}
	memset(h,0,sizeof(h));
	for(i=n;i>=1;--i)
	{
		if(!h[a[i]])nxt[i]=n+1;
		else nxt[i]=h[a[i]];
		h[a[i]]=i;
	}
	scanf("%d",&m);
	for(i=1;i<=m;++i)
	{
		scanf("%d%d",&b[i].L,&b[i].R);
		b[i].id=i;
	}
	sort(b+1,b+m+1,cmp);
	Build(1,n+1,1);
	for(i=1;i<=m;++i)
	{
		while(j<=b[i].R)Modify(pre[j]+1,j,make_pair(nxt[j],a[j]),1),++j;
		pii tmp=Query(b[i].L,1);
		if(tmp.first>=j)ans[b[i].id]=tmp.second;
	}
	for(i=1;i<=m;++i)printf("%d\n",ans[i]);
	return 0;
}
```
