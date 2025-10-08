---
title: "[CodeForces1000]B. Light It Up"
tags: [贪心]
date: 2018-06-28
categories: [题解]
---

一道贪心的简单题，插入无非就是两种情况：

* 在开灯的区间内插入，应该让插入的元素尽可能地靠后
* 在关灯的区间内插入，应该让插入的元素尽可能地靠前

注意：

* `g1` 和 `g2` 的含义，`g1` 是指不落单
  （最后两次操作刚好完成一次开关）的后缀和，而 `g2` 则指的是会落单的后缀和
* `i+1` 和 `i+2` 的选择，应该在纸上画图而不是凭空乱想
* 因为 `n` 的奇偶性不知道，所以 `ans` 的初始值为末尾两个数的最大值

::more

:::center
## B. Light It Up
:::

::center[time limit per test\: 1 second]

::center[memory limit per test\: 256 megabytes]

::center[input\: standard input]

::center[output\: standard output]

Recently, you bought a brand new smart lamp with programming features.
At first, you set up a schedule to the lamp.
Every day it will turn power on at moment $0$ and turn power off at moment $M$.
Moreover, the lamp allows you to set a program of switching its state
(states are "lights on" and "lights off").
Unfortunately, some program is already installed into the lamp.

The lamp allows only good programs.
Good program can be represented as a non-empty array $a$,
where $0 < a_1 < a_2 < \dots < a_{|a|} < M$.
All $a_i$ must be integers.
Of course, preinstalled program is a good program.

The lamp follows program $a$ in next manner:
at moment $0$ turns power and light on.
Then at moment $a_i$ the lamp flips its state to opposite
(if it was lit, it turns off, and vice versa).
The state of the lamp flips instantly:
for example, if you turn the light off at moment $1$ and then do nothing,
the total time when the lamp is lit will be $1$.
Finally, at moment $M$ the lamp is turning its power off regardless of its state.

Since you are not among those people who read instructions,
and you don't understand the language it's written in,
you realize (after some testing) the only possible way to alter the preinstalled program.
You can insert at most one element into the program $a$,
so it still should be a good program after alteration.
Insertion can be done between any pair of consecutive elements of $a$,
or even at the begining or at the end of $a$.

Find such a way to alter the program that the total time when the lamp is lit is maximum possible.
Maybe you should leave program untouched.
If the lamp is lit from $x$ till moment $y$,
then its lit for $y - x$ units of time.
Segments of time when the lamp is lit are summed up.

### Input

First line contains two space separated integers $n$ and $M$
($1 \le n \le 10^5$, $2 \le M \le 10^9$) —
the length of program $a$ and the moment when power turns off.

Second line contains $n$ space separated integers $a_1, a_2, \dots, a_n$
($0 < a_1 < a_2 < \dots < a_n < M$) — initially installed program $a$.

### Output

Print the only integer — maximum possible total time when the lamp is lit.

### Examples
#### input
```plain
3 10
4 6 7
```
#### output
```plain
8
```
#### input
```plain
2 12
1 10
```
#### output
```plain
9
```
#### input
```plain
2 7
3 4
```
#### output
```plain
6
```

### Note

In the first example, one of possible optimal solutions is to insert value $x = 3$ before $a_1$,
so program will be $[3, 4, 6, 7]$ and time of lamp being lit equals
$(3 - 0) + (6 - 4) + (10 - 7) = 8$.
Other possible solution is to insert $x = 5$ in appropriate place.

In the second example, there is only one optimal solution:
to insert $x = 2$ between $a_1$ and $a_2$.
Program will become $[1, 2, 10]$, and answer will be $(1 - 0) + (10 - 2) = 9$.

In the third example, optimal answer is to leave program untouched,
so answer will be $(3 - 0) + (7 - 4) = 6$.

```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
using namespace std;
int a[100005],f[100005],g1[100005],g2[100005];
int main(void)
{
	int i,n,m,ans=0;
	scanf("%d%d",&n,&m);
	for(i=1;i<=n;++i)scanf("%d",&a[i]);
	a[n+1]=m;
	for(i=1;i<=n+2;i+=2)f[i]=f[i-2]+a[i]-a[i-1];
	for(i=n;i>=1;i-=2)g1[i]=g1[i+2]+a[i+1]-a[i];
	for(i=n-1;i>=1;i-=2)g2[i]=g2[i+2]+a[i+1]-a[i];
	ans=max(f[n+1],f[n]);
	if(n%2==0)
	{
		for(i=1;i<=n+1;i+=2)
		{
			if(a[i]-a[i-1]<=1)continue;
			ans=max(ans,f[i]-1+g2[i]);
		}
		for(i=1;i<=n;i+=2)
		{
			if(a[i+1]-a[i]<=1)continue;
			ans=max(ans,f[i]+a[i+1]-a[i]-1+g2[i+2]);
		}
	}
	else
	{
		for(i=1;i<=n+1;i+=2)
		{
			if(a[i]-a[i-1]<=1)continue;
			ans=max(ans,f[i]-1+g1[i]);
		}
		for(i=1;i<=n;i+=2)
		{
			if(a[i+1]-a[i]<=1)continue;
			ans=max(ans,f[i]+a[i+1]-a[i]-1+g1[i+2]);
		}
	}
	printf("%d\n",ans);
	return 0;
}
```
