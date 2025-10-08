---
title: "[CodeForces1000]A. Codehorses T-shirts"
tags: [Trie树]
date: 2018-06-28
categories: [题解]
---

一道简单但是题面很难懂的水题，说了半天就是求不同型号的个数
而不是需要修改几个字母，用 unordered_map 维护即可
（不需要求前驱后继就用 unordered_map 会更快）。

::more

:::center
## A. Codehorses T-shirts
:::

::center[time limit per test\: 2 seconds]

::center[memory limit per test\: 256 megabytes]

::center[input\: standard input]

::center[output\: standard output]

Codehorses has just hosted the second Codehorses Cup.
This year, the same as the previous one, organizers are giving T-shirts for the winners.

The valid sizes of T-shirts are either "M" or from $0$ to $3$ "X" followed by "S" or "L".
For example, sizes "M", "XXS", "L", "XXXL" are valid and "XM", "Z", "XXXXL" are not.

There are $n$ winners to the cup for both the previous year and the current year.
Ksenia has a list with the T-shirt sizes printed for the last year cup
and is yet to send the new list to the printing office.

Organizers want to distribute the prizes as soon as possible,
so now Ksenia is required not to write the whole list from the scratch
but just make some changes to the list of the previous year.
In one second she can choose arbitrary position in any word
and replace its character with some uppercase Latin letter.
Ksenia can't remove or add letters in any of the words.

What is the minimal number of seconds Ksenia is required to spend
to change the last year list to the current one?

The lists are unordered.
That means, two lists are considered equal if and only if
the number of occurrences of any string is the same in both lists.

### Input

The first line contains one integer $n$ ($1 \le n \le 100$) — the number of T-shirts.

The $i$-th of the next $n$ lines contains $a_i$ —
the size of the $i$-th T-shirt of the list for the previous year.

The $i$-th of the next $n$ lines contains $b_i$ —
the size of the $i$-th T-shirt of the list for the current year.

It is guaranteed that all the sizes in the input are valid.
It is also guaranteed that Ksenia can produce list $b$ from the list $a$.

### Output

Print the minimal number of seconds Ksenia is required to spend
to change the last year list to the current one.
If the lists are already equal, print 0.

### Examples
#### input
```plain
3
XS
XS
M
XL
S
XS
```
#### output
```plain
2
```
#### input
```plain
2
XXXL
XXL
XXL
XXXS
```
#### output
```plain
1
```
#### input
```plain
2
M
XS
XS
M
```
#### output
```plain
0
```

### Note

In the first example Ksenia can replace "M" with "S"
and "S" in one of the occurrences of "XS" with "L".

In the second example Ksenia should replace "L" in "XXXL" with "S".

In the third example lists are equal.

```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
#include <unordered_map>
using namespace std;
unordered_map<string,int>mp;
int main(void)
{
	ios::sync_with_stdio(false);
	cin.tie(0);cout.tie(0);
	int i,n,ans=0;
	cin>>n;
	string str;
	for(i=1;i<=n;++i)
	{
		cin>>str;
		++mp[str];
	}
	for(i=1;i<=n;++i)
	{
		cin>>str;
		int& tmp=mp[str];
		if(tmp>0)--tmp;
		else ++ans;
	}
	printf("%d\n",ans);
	return 0;
}
```
