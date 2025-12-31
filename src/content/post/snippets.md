---
title: 杂散笔记
date: 2018-08-11
updated: 2025-12-04
sticky: 99
---
这里是一些零散的功能笔记，用于记录本人常用的知识、命令或者代码片段等，不定期更新。

::more

## 查看一个程序是 64 位还是 32 位

在程序运行的时候可以使用任务管理器查看进程后是否带有 \*32（ Windows10+ 就看是否有"32 位"）
如果是一瞬间就执行完毕（转瞬即逝）的程序，就采取以下办法：
* 简化颜色模式：兼容性中降低色彩和分辨率的选项可勾选的就是 32 位程序，否则是 64 位程序
* 查看文件头法：用二进制软件打开程序在文件头中能找到 ``PE..d`` 的是 64 位，``PE..L`` 的是 32 位

## 下载 Google Chrome 离线安装包

Chrome 浏览器主页：https://www.google.cn/chrome/

参数：``standalone=1`` 指离线安装包，``platform=win64`` 指 64 位 Windows 版本。

* windows 64：[https://www.google.cn/chrome/?standalone=1&platform=win64](https://www.google.cn/chrome/?standalone=1&platform=win64)
* windows 32：[https://www.google.cn/chrome/?standalone=1&platform=win](https://www.google.cn/chrome/?standalone=1&platform=win)
* Linux 64：[https://www.google.cn/chrome/?standalone=1&platform=linux](https://www.google.cn/chrome/?standalone=1&platform=linux)
* Mac：[https://www.google.cn/chrome/?standalone=1&platform=mac](https://www.google.cn/chrome/?standalone=1&platform=mac)

## 用 `Magick` 制作网站 favicon PNG

本站头像原图下载地址：[https://static.lolifamily.js.org/lolifamily/avatar.jpg](https://static.lolifamily.js.org/lolifamily/avatar.jpg)

```cmd
FILENAME=81510629_p0.jpg
magick $FILENAME -resize 192x192 ( +clone -alpha extract -fill white -colorize 100%% -fill black -draw "rectangle 0,0 %[fx:w],%[fx:h]" -fill white -draw "circle %[fx:w/2-0.5],%[fx:h/2-0.5] 0,%[fx:h/2-0.5]" ) -alpha off -compose CopyOpacity -composite -define png:compression-level=9 favicon-192x192.png
magick $FILENAME -resize 32x32 ( +clone -alpha extract -fill white -colorize 100%% -fill black -draw "rectangle 0,0 %[fx:w],%[fx:h]" -fill white -draw "circle %[fx:w/2-0.5],%[fx:h/2-0.5] 0,%[fx:h/2-0.5]" ) -alpha off -compose CopyOpacity -composite -define png:compression-level=9 favicon-32x32.png
magick $FILENAME -resize 180x180 -define png:compression-level=9 favicon-180x180.png
```

## 用 `Magick` 制作切割图

```cmd
magick "assets\day_desktop.png" ( +clone -fill black -colorize 100 -fill white -draw "polygon 0,0 %[fx:w],0 %[fx:w],%[fx:h*3/5] 0,%[fx:h*2/5]" ) -alpha off -compose copy_opacity -composite "assets\dark_desktop.png" +swap -compose over -composite "assets\desktop.png"
magick "assets\day_mobile.png" ( +clone -fill black -colorize 100 -fill white -draw "polygon 0,0 0,%[fx:h] %[fx:w*2/5],%[fx:h] %[fx:w*3/5],0" ) -alpha off -compose copy_opacity -composite "assets\dark_mobile.png" +swap -compose over -composite "assets\mobile.png"
```

## 本人使用 `nginx.conf`

```nginx
server_names_hash_bucket_size 128;

map $host $site_root_name {
  default _;
  loliblogs.yearnstudio.cn loliblogs;
  lolifamily.yearnstudio.cn lolifamily;
}

map $http_upgrade $connection_upgrade {
  default upgrade;
  ''      close;
}

gzip on;
gzip_proxied any;
gzip_vary on;
gzip_types text/html text/richtext text/plain text/css text/x-script text/x-component text/x-java-source text/x-markdown application/javascript application/x-javascript text/javascript text/js image/x-icon image/vnd.microsoft.icon application/x-perl application/x-httpd-cgi text/xml application/xml application/rss+xml application/vnd.api+json application/x-protobuf application/json multipart/bag multipart/mixed application/xhtml+xml font/ttf font/otf font/x-woff font/woff2 font/svg+xml image/svg+xml application/vnd.ms-fontobject application/ttf application/x-ttf application/otf application/x-otf application/truetype application/opentype application/x-opentype application/font-woff application/eot application/font application/font-sfnt application/wasm application/javascript-binast application/manifest+json application/ld+json application/geo+json;

server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name _;

  location ~ ^/\.well-known/ {
    root /usr/share/nginx/html;
  }

  location / {
    return 301 https://$host$request_uri;
  }
}

# modern configuration
ssl_protocols TLSv1.3;
ssl_ecdh_curve X25519:prime256v1:secp384r1;
ssl_prefer_server_ciphers off;

server {
  listen 443 ssl default_server;
  listen [::]:443 ssl default_server;
  http2 on;

  listen 443 quic reuseport;
  listen [::]:443 quic reuseport;
  server_name _;

  if ($site_root_name = _) {
    return 444;
  }

  ssl_certificate conf.d/lolifamily.pem;
  ssl_certificate_key conf.d/lolifamily.key;

  # HSTS (ngx_http_headers_module is required) (63072000 seconds)
  add_header Alt-Svc 'h3=":443"; ma=86400' always;
  add_header Content-Security-Policy "default-src 'self' 'unsafe-inline' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https://api.star-history.com; frame-src 'self' https://giscus.app; frame-ancestors 'none';" always;
  add_header X-Frame-Options "DENY" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
  add_header Cross-Origin-Opener-Policy "same-origin" always;
  add_header Cross-Origin-Resource-Policy "same-origin" always;
  add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), interest-cohort=()" always;

  location ~ /_astro {
    add_header Cache-Control "public, max-age=63072000, immutable" always;
  }

  # 一级目录404递归查找：子目录优先使用自己的404，不存在则fallback到根404
  error_page 404 = @error404;
  error_page 403 500 502 503 504 /403.html;

  # 重定向所有 /page/1 到对应的首页，避免重复内容
  rewrite ^/page/1$ / permanent;
  rewrite ^/(.*)/page/1$ /$1 permanent;

  try_files $uri $uri.html $uri/ =404;

  root /usr/share/nginx/html/$site_root_name;

  location @error404 {
    internal;
    # 提取一级目录路径，将 /dir/path 改写为 /dir/404.html
    rewrite ^(/[^/]+)/.+ $1/404.html break;
    try_files $uri /404.html;
  }
}

server {
  listen 443 ssl;
  listen [::]:443 ssl;
  server_name mcsm-demo-nb2.hugo.net.cn;
  http2 on;

  ssl_certificate conf.d/fullchain.crt;
  ssl_certificate_key conf.d/private.key;

  add_header Content-Security-Policy "default-src 'self'; frame-ancestors 'none'; sandbox;" always;
  add_header X-Frame-Options "DENY" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
  add_header Cross-Origin-Opener-Policy "same-origin" always;
  add_header Cross-Origin-Resource-Policy "same-origin" always;
  add_header Cache-Control "no-store, no-cache, must-revalidate";
  
  location / {
    proxy_pass http://127.0.0.1:24444;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;

    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;

    proxy_read_timeout 60s;
    proxy_send_timeout 30s;

    # Disable cache
    proxy_request_buffering off;
    proxy_buffering off;
  }
}
```

## 简易老板键 AHK 2.0 脚本

```autohotkey2
#Requires AutoHotkey v2.0
#SingleInstance Force
#WinActivateForce
SetTitleMatchMode 2       ; 模糊匹配

if not A_IsAdmin
{
  try {
    Run "*RunAs `"" A_ScriptFullPath "`""
  }
  ExitApp
}

GroupAdd "SecretApps", "ahk_exe steam.exe"
GroupAdd "SecretApps", "ahk_exe SpaceEngineers.exe"
GroupAdd "SecretApps", "ahk_exe SpaceEngineers2.exe"
GroupAdd "SecretApps", "ahk_exe Legacy.exe"
GroupAdd "SecretApps", "ahk_exe Modern.exe"

SECRET_GROUP := "ahk_group SecretApps"
COVER_APP := "ahk_exe Acrobat.exe"

`::
  {
    try {
      WinSetTransparent 0, SECRET_GROUP    ; 砍掉Windows动画
      WinHide SECRET_GROUP
    }

    try {
      WinActivate COVER_APP
      WinMaximize COVER_APP
    }
  }

; Shift + F12
+F12::
  {
    DetectHiddenWindows True
    try {
      WinShow SECRET_GROUP
      WinSetTransparent "Off", SECRET_GROUP
    }

    DetectHiddenWindows False
  }
```
