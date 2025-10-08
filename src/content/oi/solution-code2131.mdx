---
title: solution-code2131
categories: 题解
tags: [搜索]
date: 2018-06-23
---

使用 4-hash 节省判重时间。

判断就是从字符串两端搜索 `C` 和 `W`，
然后确认中间元素是否匹配 `target`。

暴力找 `COW` 后重新组合直接递归搜索。

::more


```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
#include <cstdlib>
using namespace std;
string target="Begin the Escape execution at the Break of Dawn",s;
const int m1=392131,m2=413477,m3=9997,m4=10001,p1=23,p2=31,p3=17,p4=37,lt=target.length();
bool hash1[m1+5],hash2[m2+5],hash3[m3+5],hash4[m4+5];
inline bool check(string a)
{
	int i,a1=0,a2=0,a3=0,a4=0,len=a.length();
	for(i=0;i<len;++i)
	{
		a1=(a1*p1+a[i])%m1;
		a2=(a2*p2+a[i])%m2;
		a3=(a3*p3+a[i])%m3;
		a4=(a4*p4+a[i])%m4;
	}
	if(hash1[a1]&&hash2[a2]&&hash3[a3]&&hash4[a4])return false;
	return hash1[a1]=hash2[a2]=hash3[a3]=hash4[a4]=true;
}
inline void dfs(string s,int dep)
{
	if(!check(s))return;
	if(s==target)
	{
		printf("1 %d\n",dep);exit(0);
	}
	int i,j,k,ls=s.length();
	for(i=ls-1,j=lt-1;s[i]!='C'&&s[i]!='O'&&s[i]!='W';--i,--j)
	{
		if(s[i]!=target[j])return;
	}
	for(i=0;s[i]!='C'&&s[i]!='O'&&s[i]!='W';++i)
	{
		if(s[i]!=target[i])return;
	}
	string sub="",news;
	for(++i;i<ls;++i)
	{
		if(s[i]=='C'||s[i]=='O'||s[i]=='W')
		{
			if(target.find(sub)==-1)return;
			sub="";
		}
		else sub+=s[i];
	}
	for(i=0;i<ls;++i)
	{
		if(s[i]!='O')continue;
		for(j=0;j<i;++j)
		{
			if(s[j]!='C')continue;
			for(k=ls-1;k>i;--k)
			{
				if(s[k]!='W')continue;
				news=s.substr(0,j)+s.substr(i+1,k-i-1)+s.substr(j+1,i-j-1)+s.substr(k+1);
				dfs(news,dep+1);
			}
		}
	}
	return;
}
int main(void)
{
	getline(cin,s);
	dfs(s,0);
	printf("0 0\n");
	return 0;
}

```
