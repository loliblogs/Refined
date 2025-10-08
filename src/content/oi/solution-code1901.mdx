---
title: solution-code1901
categories: 题解
tags: [状压DP]
date: 2018-06-23
---

注意优先级！！！`!` 的优先级比 `&` 的优先级高，要打括号。

::more


```cpp
#include <iostream>
#include <cstdio>
#include <cstring>
#include <algorithm>
using namespace std;
int f[2][(1<<14)+5];
bool a[15][15];
int main(void)
{
	int i,j,S,n,m,x,ch,cnt=1,pre=0,ans=0;
	scanf("%d%d",&n,&m);
	memset(a,1,sizeof(a));
	memset(f[cnt],-1,sizeof(f[cnt]));
	for(i=1;i<=m;++i)
	{
		while(ch=getchar())if(ch>='A'&&ch<='Z')break;
		scanf("%d",&x);
		a[ch-'A'][x-1]=0;
	}
	f[cnt][0]=0;
	m=n<<1;
	for(i=0;i<n;++i)
	{
		for(j=0;j<m;++j)
		{
			pre^=1;cnt^=1;
			memset(f[cnt],-1,sizeof(f[cnt]));
			for(S=0;S<(1<<m);++S)
			{
				if(a[i][j])
				{
					f[cnt][S]=f[pre][S^(1<<j)];
					if(!(S&(1<<j)))
					{
						if(j>0&&!(S&(1<<(j-1))))f[cnt][S]=max(f[cnt][S],f[pre][S^(1<<(j-1))]);
						if(f[cnt][S]>=0)++f[cnt][S];
						f[cnt][S]=max(f[cnt][S],f[pre][S]);
					}
				}
				else f[cnt][S]=S&(1<<j)?-1:f[pre][S];
			}
		}
	}
	for(i=(1<<n);i<(1<<m);++i)f[cnt][i&((1<<n)-1)]=max(f[cnt][i&((1<<n)-1)],f[cnt][i]);
	for(i=n;i<m;++i)
	{
		for(j=0;j<n;++j)
		{
			pre^=1;cnt^=1;
			memset(f[cnt],-1,sizeof(f[cnt]));
			for(S=0;S<(1<<n);++S)
			{
				if(a[i][j])
				{
					f[cnt][S]=f[pre][S^(1<<j)];
					if(!(S&(1<<j)))
					{
						if(j>0&&!(S&(1<<(j-1))))f[cnt][S]=max(f[cnt][S],f[pre][S^(1<<(j-1))]);
						if(f[cnt][S]>=0)++f[cnt][S];
						f[cnt][S]=max(f[cnt][S],f[pre][S]);
					}
				}
				else f[cnt][S]=S&(1<<j)?-1:f[pre][S];
			}
		}
	}
	for(i=0;i<(1<<n);++i)ans=max(ans,f[cnt][i]);
	printf("%d\n",ans);
	return 0;
}

```
