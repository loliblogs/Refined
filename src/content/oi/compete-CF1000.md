---
title: Educational Codeforces Round 46
tags: []
date: 2018-06-28
categories: [比赛,CF]
---
一场简单题之战，就是比做题的速度以及正确率
（感觉出题人去看球赛去了）

::more

## A. Codehorses T-shirts

一道简单但是题面很难懂的水题，说了半天就是求不同型号的个数
而不是需要修改几个字母，用 map 维护即可。

:postlink[A题代码]{id="oi/solution-CF1000A.md"}

## B. Light It Up

一道贪心的简单题，插入无非就是两种情况：

* 在开灯的区间内插入，应该让插入的元素尽可能地靠后
* 在关灯的区间内插入，应该让插入的元素尽可能地靠前

:postlink[B题代码]{id="oi/solution-CF1000B.md"}

## C. Covered Points Count

区间前缀和的经典问题，离散化后求前缀和（值即为覆盖的条数），
用离散化之前的值直接计算即可。

:postlink[C题代码]{id="oi/solution-CF1000C.md"}

## D. Yet Another Problem On a Subsequence

DP 经典题目，枚举第一个正整数就得到了区间长度，
再暴力枚举区间最后一个值，$O(n^2)$ 的 DP 就搞定了。

:postlink[D题代码]{id="oi/solution-CF1000D.md"}

## E. We Need More Bosses

无向图求割边的模板题，缩点后建立新图 DP 一下就可以了。

对于每条割边，答案都可以为 `dp[x]+1+dp[y]`，
然后 `dp[x]=dp[y]+1`（合并节点 `x` 和 `y`）。

:postlink[E题代码]{id="oi/solution-CF1000E.md"}

## F. One Occurrence

一道有意思的线段树题目，维护一个 pair 值
（下一个元素的位置,权值）对其维护最大值（就是影响越持久）。

把问题离线处理，按照问题的右端点排序，这样就能满足单调性。

输出的时候一定要判断一下 first 的值是否符合要求。

:postlink[F题代码]{id="oi/solution-CF1000F.md"}

## G. Two-Paths

作为压轴题，题目描述很长、很难理解。

还没写好 QwQ

:postlink[G题代码]{id="oi/solution-CF1000G.md"}
