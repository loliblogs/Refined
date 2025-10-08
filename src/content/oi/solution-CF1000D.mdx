---
title: "[CodeForces1000]D. Yet Another Problem On a Subsequence"
tags: [DP]
date: 2018-06-28
categories: [题解]
---

DP 经典题目，枚举第一个正整数就得到了区间长度，
再暴力枚举区间最后一个值，$O(n^2)$ 的 DP 就搞定了。

在 DP 的时候，可以从 `i` 优化到 `j` 而不需要倒着循环来 DP，
`f[n+1]` 就是答案。

注意：`f[i]` 的初值为 `1`！

::more

:::center
## D. Yet Another Problem On a Subsequence
:::

::center[time limit per test\: 2 seconds]

::center[memory limit per test\: 256 megabytes]

::center[input\: standard input]

::center[output\: standard output]

The sequence of integers $a_1, a_2, \dots, a_k$ is called a good array
if $a_1 = k - 1$ and $a_1 > 0$.
For example, the sequences $[3, -1, 44, 0], [1, -99]$ are good arrays,
and the sequences $[3, 7, 8], [2, 5, 4, 1], [0]$ — are not.

A sequence of integers is called good if it can be divided into a positive number of good arrays.
Each good array should be a subsegment of sequence
and each element of the sequence should belong to exactly one array.
For example, the sequences $[2, -3, 0, 1, 4]$, $[1, 2, 3, -3, -9, 4]$ are good,
and the sequences $[2, -3, 0, 1]$, $[1, 2, 3, -3 -9, 4, 1]$ — are not.

For a given sequence of numbers,
count the number of its **subsequences** that are good sequences,
and print the number of such subsequences modulo **998244353**.

### Input

The first line contains the number $n\~(1 \le n \le 10^3)$ — the length of the initial sequence.
The following line contains $n$ integers $a_1, a_2, \dots, a_n\~(-10^9 \le a_i \le 10^9)$ —
the sequence itself.

### Output

In the single line output one integer —
the number of subsequences of the original sequence that are good sequences,
taken modulo **998244353**.

### Examples
#### input
```plain
3
2 1 1
```
#### output
```plain
2
```
#### input
```plain
4
1 1 1 1
```
#### output
```plain
7
```

### Note

In the first test case, two good subsequences — $[a_1, a_2, a_3]$ and $[a_2, a_3]$.

In the second test case, seven good subsequences —
$[a_1, a_2, a_3, a_4], [a_1, a_2], [a_1, a_3], [a_1, a_4], [a_2, a_3], [a_2, a_4]$
and $[a_3, a_4]$.

```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
#define mod 998244353
using namespace std;
int a[1005];
long long C[1005][1005],f[1005];
int main(void)
{
	int i,j,n;
	scanf("%d",&n);
	for(i=0;i<=n;++i)C[i][0]=C[i][i]=1;	
	for(i=1;i<=n;++i)
	{
		for(j=1;j<i;++j)C[i][j]=(C[i-1][j-1]+C[i-1][j])%mod;
	}
	for(i=1;i<=n;++i)scanf("%d",&a[i]),f[i]=1;
	for(i=1;i<=n;++i)
	{
		if(a[i]<=0)continue;
		for(j=i+a[i]+1;j<=n+1;++j)
		{
			f[j]=(f[j]+f[i]*C[j-i-1][a[i]])%mod;
		}
	}
	printf("%lld\n",f[n+1]);
	return 0;
}
```
