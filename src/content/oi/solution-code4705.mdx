---
title: "[BZOJ3771]Triple"
tags: [生成函数,FFT,NTT]
date: 2018-08-12
categories: [题解]
---

## 不同情况的生成函数

我们先设 $a(x)$ 为丢失一把斧头的生成函数，
$b(x)$ 为丢失两把一样的斧头的生成函数，
$c(x)$ 为丢失三把一样的斧头的生成函数

对于样例来说：

$$
\begin{split}
a(x)&= x^4+x^5+x^6+x^7\\
b(x)&= x^8+x^{10}+x^{12}+x^{14}\\
c(x)&= x^{12}+x^{15}+x^{18}+x^{21}
\end{split}
$$

再设 $A(x)$ 为丢失一把斧头的生成函数，
$B(x)$ 为丢失两把不同的斧头的生成函数，
$C(x)$ 为丢失三把不同的斧头的生成函数

对于样例来说：

$$
\begin{split}
A(x)& =a(x)\\
B(x)& =a^2(x)-b(x)\\
C(x)& =a^3(x)-3a(x)b(x)+2c(x)
\end{split}
$$

解释一下 $C(x)$，
首先随意的选择三个斧头（可以相同），
然后减去选出两把相同的斧头和另一把斧头（也可以相同），
但是三个相同的被减了三次，所以要加 $2$

由于数据范围较大，需要用 FFT 或 NTT 优化

::more

## Problem

### Description

我们讲一个悲伤的故事。

从前有一个贫穷的樵夫在河边砍柴。
这时候河里出现了一个水神，夺过了他的斧头，说：
"这把斧头，是不是你的？"
樵夫一看："是啊是啊！"

水神把斧头扔在一边，又拿起一个东西问：
"这把斧头，是不是你的？"
樵夫看不清楚，但又怕真的是自己的斧头，
只好又答："是啊是啊！"

水神又把手上的东西扔在一边，拿起第三个东西问：
"这把斧头，是不是你的？"
樵夫还是看不清楚，但是他觉得再这样下去他就没法砍柴了。
于是他又一次答："是啊是啊！真的是！"

水神看着他，哈哈大笑道：
"你看看你现在的样子，真是丑陋！"
之后就消失了。

樵夫觉得很坑爹，
他今天不仅没有砍到柴，还丢了一把斧头给那个水神。
于是他准备回家换一把斧头。

回家之后他才发现真正坑爹的事情才刚开始。
水神拿着的的确是他的斧头。
但是不一定是他拿出去的那把，
还有可能是水神不知道怎么偷偷从他家里拿走的。
换句话说，水神可能拿走了他的一把，两把或者三把斧头。

樵夫觉得今天真是倒霉透了，但不管怎么样日子还得过。
他想统计他的损失。
樵夫的每一把斧头都有一个价值，不同斧头的价值不同。
总损失就是丢掉的斧头价值和。
他想对于每个可能的总损失，计算有几种可能的方案。

注意：如果水神拿走了两把斧头 $a$ 和 $b$，
$(a,b)$ 和 $(b,a)$ 视为一种方案。
拿走三把斧头时，
$(a,b,c)$, $(b,c,a)$, $(c,a,b)$, $(c,b,a)$, $(b,a,c)$, $(a,c,b)$ 视为一种方案。

### Input

第一行是整数 $N$，表示有 $N$ 把斧头。

接下来 $N$ 行升序输入 $N$ 个数字 $A_i$，
表示每把斧头的价值。

### Output

若干行，按升序对于所有可能的总损失输出一行 $x$ $y$，
$x$ 为损失值，$y$ 为方案数。

### Sample Input

```plain
4
4
5
6
7
```

### Sample Output

```plain
4 1
5 1
6 1
7 1
9 1
10 1
11 2
12 1
13 1
15 1
16 1
17 1
18 1
```

### HINT

$11$ 有两种方案是 $4+7$ 和 $5+6$，
其他损失值都有唯一方案，
例如 $4=4$, $5=5$, $10=4+6$, $18=5+6+7$。

所有数据满足：$A_i\le 40000$

## Code
```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
#include <complex>
#include <cmath>
using namespace std;
typedef complex<double>cp;
int rev[140005];
cp a[140005],b[140005],c[140005],wi[140005],ans[140005];
inline int Make(int n)
{
	int i,L=log2(n)+1;n=1<<L;
	for(i=0;i<n;++i)rev[i]=(rev[i>>1]>>1)|((i&1)<<(L-1));
	return n;
}
inline void FFT(cp A[],int n,int f)
{
	int i,j,k;
	for(i=0;i<n;++i)if(rev[i]<i)swap(A[i],A[rev[i]]);
	for(i=1;i<n;i<<=1)
	{
		cp wn(cos(M_PI/i),f*sin(M_PI/i));
		wi[0]=1;
		for(j=1;j<i;++j)wi[j]=wi[j-1]*wn;
		for(j=0;j<n;j+=i<<1)
		{
			for(k=0;k<i;++k)
			{
				cp x=A[j+k],y=wi[k]*A[i+j+k];
				A[j+k]=x+y;A[i+j+k]=x-y;
			}
		}
	}
	if(f==-1)for(i=0;i<n;++i)A[i]=A[i]/double(n);
	return;
}
int main(void)
{
	int i,x,n,m;
	scanf("%d",&n);
	for(i=1;i<=n;++i)
	{
		scanf("%d",&x);
		a[x]=b[x*2]=c[x*3]=cp(1,0);
	}
	m=Make(131071);
	FFT(a,m,1);
	FFT(b,m,1);
	FFT(c,m,1);
	for(i=0;i<m;++i)
	{
		ans[i]=a[i]+(a[i]*a[i]-b[i])/2.0+(a[i]*a[i]*a[i]-a[i]*b[i]*3.0+c[i]*2.0)/6.0;
	}
	FFT(ans,m,-1);
	for(i=0;i<m;++i)
	{
		if(ans[i].real()>0.9)printf("%d %.0f\n",i,round(ans[i].real()));
	}
	return 0;
}
```
