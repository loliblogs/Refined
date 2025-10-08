---
title: solution-code3935
date: 2018-04-29
categories: 题解
tags: [平衡树,树状数组]
---

题意：给你 $n$ 个插入操作，
第 $i$ 次操作在指定位置插入 $i$，
要求每次操作后输出最长上升子序列的长度。

由于插入元素一定是在区间最大的，
所以每次操作的答案就是在这个元素前面的最大答案 `+1` 即可。

由于插入元素的顺序不确定，
所以用平衡树来维护最大值。

::more


### 平衡树(Treap):
```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
using namespace std;
int n,siz[100005],L[100005],R[100005],rnd[100005],v[100005],ans[100005],mn[100005],rt,cnt;
inline void pushup(int x)
{
	siz[x]=siz[L[x]]+siz[R[x]]+1;
	return;
}
inline void Rturn(int& k)
{
	int tmp=L[k];
	L[k]=R[tmp];
	R[tmp]=k;
	pushup(k);
	pushup(tmp);
	k=tmp;
	return;
}
inline void Lturn(int& k)
{
	int tmp=R[k];
	R[k]=L[tmp];
	L[tmp]=k;
	pushup(k);
	pushup(tmp);
	k=tmp;
	return;
}
inline void Insert(int& x,int rank)
{
	if(!x)
	{
		x=++cnt;
		rnd[x]=rand();siz[x]=1;
		return;
	}
	++siz[x];
	if(siz[L[x]]<rank)
	{
		Insert(R[x],rank-siz[L[x]]-1);
		if(rnd[R[x]]<rnd[x])Lturn(x);
	}
	else
	{
		Insert(L[x],rank);
		if(rnd[L[x]]<rnd[x])Rturn(x);
	}
	return;
}
inline void dfs(int x)
{
	if(!x)return;
	dfs(L[x]);
	v[++v[0]]=x;
	dfs(R[x]);
	return;
}
inline void Solve()
{
	int i,maxx=0,tmp;
	memset(mn,0x3F,sizeof(mn));
	mn[0]=-0x3F3F3F3F;
	for(i=1;i<=n;++i)
	{
		tmp=upper_bound(mn,mn+maxx+1,v[i])-mn;
		if(mn[tmp-1]<=v[i])
		{
			mn[tmp]=min(mn[tmp],v[i]);
			ans[v[i]]=tmp;
			maxx=max(maxx,tmp);
		}
	}
	for(i=1;i<=n;++i)printf("%d\n",ans[i]=max(ans[i],ans[i-1]));
	return;
}
int main(void)
{
	int i,x;
	scanf("%d",&n);
	for(i=1;i<=n;++i)
	{
		scanf("%d",&x);
		Insert(rt,x);
	}
	dfs(rt);
	Solve();
	return 0;
}

```
### 平衡树(Splay)：

```cpp
#include<iostream>
#include<cstdio>
#include<cstring>
#include<algorithm>
using namespace std;
int val[100005],ch[100005][2],fa[100005],siz[100005],maxx[100005],rt,cnt;
inline void pushup(int x)
{
	int L=ch[x][0],R=ch[x][1];
	siz[x]=siz[L]+siz[R]+1;
	maxx[x]=max(val[x],max(maxx[L],maxx[R]));
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
			if(ch[z][0]==y^ch[y][0]==x)Rot(x,f);
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
inline void Insert(int x,int value)
{
	int L=Find(rt,x),R=Find(rt,x+1);
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
inline int Getmax(int x,int y)
{
	int L=Find(rt,x-1),R=Find(rt,y+1);
	Splay(L,rt);
	Splay(R,ch[L][1]);
	return maxx[ch[R][0]];
}
inline void Init(void)
{
	rt=1;cnt=2;
	val[1]=val[2]=-0x3FFFFFFF;
	ch[1][0]=2;fa[2]=1;
	siz[1]=2;siz[2]=1;
	return;
}
int main(void)
{
	Init();
	int i,n,x,ans,Ans=0;
	scanf("%d",&n);
	for(i=1;i<=n;++i)
	{
		scanf("%d",&x);
		ans=Getmax(2,x+1)+1;
		printf("%d\n",Ans=max(Ans,ans));
		Insert(x+1,ans);
	}
	return 0;
}

```

### 神奇的树状数组+二分
```cpp
#include<iostream>
#include<cstdio>
#include<cstring>
#include<algorithm>
using namespace std;
int n,a[100005],ans[100005],c[100005];
inline int lowbit(int x){return x&(-x);}
inline int getsum(int x,int y){return x+y;}
inline int getmax(int x,int y){return x>y?x:y;}
inline void Insert(int x,int val,int oper(int,int))
{
	while(x<=n)c[x]=oper(c[x],val),x+=lowbit(x);
	return;
}
inline int Query(int x,int oper(int,int))
{
	int sum=0;
	while(x>=1)sum=oper(sum,c[x]),x-=lowbit(x);
	return sum;
}
inline int Query(int x)
{
	int L=1,R=n-x,mid;
	while(L<=R)
	{
		mid=(L+R)>>1;
		if(Query(a[x]+mid,getsum)>mid)L=mid+1;
		else R=mid-1;
	}
	return L;
}
int main(void)
{
	int i,x;
	scanf("%d",&n);
	for(i=1;i<=n;++i)
	{
		scanf("%d",&a[i]);++a[i];
	}
	for(i=n;i>=1;--i)Insert(a[i]+=Query(i),1,getsum);
	memset(c,0,sizeof(c));
	for(i=1;i<=n;++i)
	{
		Insert(a[i],ans[i]=Query(a[i]-1,getmax)+1,getmax);
	}
	for(i=1;i<=n;++i)printf("%d\n",ans[i]=max(ans[i],ans[i-1]));
	return 0;
}
```
### vector+树状数组出奇迹:

```cpp
#include<iostream>
#include<cstdio>
#include<cstring>
#include<algorithm>
#include<vector>
using namespace std;
int b[100005],c[100005],ans[100005];
inline int lowbit(int x){return x&(-x);}
inline void Add(int x,int y)
{
	while(x<=100002)c[x]=max(c[x],y),x+=lowbit(x);
	return;
}
inline int Sum(int x)
{
	int sum=0;
	while(x>=1)sum=max(sum,c[x]),x-=lowbit(x);
	return sum;
}
vector<int>a;
int main(void)
{
	int i,x,n;
	scanf("%d",&n);
	for(i=1;i<=n;++i)
	{
		scanf("%d",&x);
		a.insert(a.begin()+x,i);
	}
	for(i=0;i<n;++i)b[a[i]]=i+1;
	for(i=1;i<=n;++i)
	{
		Add(b[i],ans[i]=Sum(b[i]-1)+1);
	}
	for(i=1;i<=n;++i)printf("%d\n",ans[i]=max(ans[i],ans[i-1]));
	return 0;
}
```
