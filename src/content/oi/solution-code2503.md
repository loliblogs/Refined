---
title: "[HNOI2004]树的计数"
date: 2018-04-28
categories: 题解
tags: [树的prufer编码]
---

## 注意点：

* 度数为 $0$ 一定无解
* 度数减一的和不等于点数 $- 2$ 一定无解
* 数据保证满足条件的树不超过 $10^{17}$ 个，
  但要用高精 ~~（然而并不需要，呵呵）~~

其他的就跟模板题一样了～

::more

## Problem

### 题目描述

一个有 $n$ 个结点的树，
设它的结点分别为 $v_1, v_2, \cdots, v_n$，
已知第 $i$ 个结点 $v_i$ 的度数为 $d_i$，
问满足这样的条件的不同的树有多少棵。

给定 $n, d_1, d_2, \cdots, d_n$，
编程需要输出满足 $d(v_i) = d_i$ 的树的个数。

### 输入格式

第一行是一个正整数 $n$，表示树有 $n$ 个结点。

第二行有 $n$ 个数，第 $i$ 个数表示 $d_i$，
即树的第 $i$ 个结点的度数。

其中 $1 \le n \le 150$，
输入数据保证满足条件的树不超过 $10^{17}$ 个。

### 输出格式

输出满足条件的树有多少棵。

### 输入

```plain
4
2 1 2 1
```

### 输出

```plain
2
```

## Code
```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
using namespace std;
struct bigint
{
    mutable int a[1005];
    inline int& operator[](size_t pos)const{return a[pos];}
    inline bigint(){memset(a,0,sizeof(a));a[0]=1;}
    inline bigint& operator*=(int b)
    {
        int i;
        for(i=1;i<=a[0];++i)a[i]*=b;
        for(i=1;i<=a[0]||a[i];++i)
        {
            if(a[i]>=10000)
            {
                a[i+1]+=a[i]/10000;
                a[i]%=10000;
            }
        }
        a[0]=i-1;
        return *this;
    }
}ans;
inline ostream& operator<<(ostream& os,const bigint& a)
{
    printf("%d",a[a[0]]);
    for(int i=a[0]-1;i>=1;--i)printf("%04d",a[i]);
    return os;
}
int num[1005],d[1005],p[1005],cnt;
bool vis[1005];
inline void Solve(int x,int del)
{
    int i,j,s;
    for(i=1;i<=cnt&&p[i]<=x;++i)
    {
        s=p[i];
        while(s<=x)
        {
            num[i]+=(x/s)*del;
            s*=p[i];
        }
    }
    return;
}
inline void Init()
{
    int i,j;
    for(i=2;i<=1000;++i)
    {
        if(!vis[i])p[++cnt]=i;
        for(j=1;j<=cnt&&i*p[j]<=1000;++j)
        {
            vis[i*p[j]]=1;
            if(i%p[j]==0)break;
        }
    }
    return;
}
int main(void)
{
    Init();
    int i,j,x,n,m=0;
    long long sum=0;
    scanf("%d",&n);
    if(n==1)
    {
        scanf("%d",&x);
        if(!x)printf("1\n");
        else printf("0\n");
        return 0;
    }
    for(i=1;i<=n;++i)
    {
        scanf("%d",&d[i]);
        if(d[i]==0){printf("0\n");return 0;}
        --d[i];sum+=d[i];
    }
    if(sum!=n-2){printf("0\n");return 0;}
    Solve(n-2,1);
    Solve(n-sum-2,-1);
    for(i=1;i<=n;++i)
    {
        if(d[i]>0)Solve(d[i],-1);
    }
    ans[1]=1;
    for(i=1;i<=cnt;++i)
    {
        for(j=1;j<=num[i];++j)ans*=p[i];
    }
    for(i=1;i<=n-sum-2;++i)ans*=m;
    cout<<ans<<endl;
    return 0;
}
```
