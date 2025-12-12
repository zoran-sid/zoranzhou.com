---
author: "Zoran"
title: "从零开始搭建你的免费 BLOG 博客（Github+Cloudflare）"
date: "2024-05-01"
description: "基于 GitHub 与 Cloudflare 的静态站点部署方案（Hugo）"
tags:
  - Technology
ShowToc: true
TocOpen: true
ShowWordCount: true
ShowReadingTime: true
ShowBreadCrumbs: true
ShowShareButtons: true
---

# 前言

由于我是长期 VPS 服务器的持有用户，最开始我尝试使用阿里云的 VPS 服务器作为平台作为Hugo Blog站点，随着部署的过程和最终的效果呈现，我觉得存在以下几方面的问题：

- 性能受限于 VPS 的性能配置；
- 使用 HTTPS，需要在 WEB 服务上配置 https 证书；
- 发布内容繁琐复杂，后台数据更新不够及时，依赖于脚本；
- 网页可靠性较低；
- 与 VPS 其他部署的服务部分处在冲突。



**最后我选择 GitHub Pages 配合 Cloudflare 托管的方案实现 BLOG 的搭建。可以解决以上所以问题，重要的是免费！**



# GitHub + Cloudflare

## 注册配置 GitHub 仓库

```
Respsitory name： example.com （自定义填写Blog网站的仓库名）
```

![image-20251209154251574](https://e5d9f02.webp.fi/image-20251209154251574.png)

## 安装 Git

### 安装 Git

后续为了方便本地化管理 GitHub仓库。

```
官网地址：https://git-scm.com/
```

![image-20251209155117127](https://e5d9f02.webp.fi/image-20251209155117127.png)

### 本地 SSH 秘钥

在 Windows 本地使用 cmd 生成本地 SSH 秘钥

![image-20251209155528735](https://e5d9f02.webp.fi/image-20251209155528735.png)

### 设置 SSH keys

在 GitHub 设置的 SSH and GPG keys 中填写生成的秘钥 SSH Keys

![image-20251209155251700](https://e5d9f02.webp.fi/image-20251209155251700.png)

**之后就可以通过 Git 命令，https 上传文件到仓库了~**



## Hugo 主题

在 Hugo themes 中挑选自己合适的主题，作为BLOG的模版。

```
https://themes.gohugo.io/
```

本网站主题如下：

```
https://github.com/reorx/hugo-PaperModX
```

### Git 拉取仓库

```
git clone https://github.com/reorx/hugo-PaperModX.git
```

**文件格式**

- **content**：存储posts等
- **data**：社交媒体的配置
- **layouts**：整个静态网页的布局（重要！）
- **assets**：存储 css，js 文件，默认 toml 拉取头像
- **i18n**：多语言
- 我这里选择覆盖 ExampleSite 和仓库根目录，具体不同 theme 会有不同的配置方案。该教程不适配任何主题。

### 拉取文件到 GitHub

1. **git init** ：在此文件夹生成一个.git隐藏文件；
2. **git add .** : 将文件添加到缓存区( 注意这个"."，是有空格的，"."代表这个test这个文件夹下的目录全部都提交，也可以通过git add 文件名 提交指定的文件)；
3. **git status**：查看现在的状态，也可以不看，随你啦，可以看到picture文件夹里面的内容都提交上去了；
4. **git commit -m** "这里是注释"：提交添加到缓存区的文件；
5. **git remote add origin remote_url** ： 添加新的git方式的origin, github上创建好的仓库和本地仓库进行关联；
6. **git push origin main**：推送文件到仓库。

**注：**

- 第4步可能会让你配置个人信息，否则无法推送文件，具体请看 CLI 提示。
- 确保推送的仓库主分支和 CLI 一致。



## 配置 toml 文件

```
title = "ZORAN"  //BLOG标题
baseURL = "https://zoranzhou.com/"  //主网站信息
languageCode = "en-us"
defaultContentLanguage = "en"
enableEmoji = true
ignoreErrors = ["additional-script-loading-error"]
disqusShortname = ""

[pagination]  //主页显示文章数量
pagerSize = 10

##############################
# Params
##############################
[params]
TocSide = "left"   //左对齐
EnableInstantClick = false  //这里因为加了waline方案，所以需要false，确保html正确的刷新出来

# --- Logo ---
[params.logo] 
icon = "favicon.png" //存储在assets/favicon.png
iconWidth = 128        
iconHeight = 128
text = ""             

##############################
# Menu 确保导航分页都正常显示
##############################
[menu]

  [[menu.main]]
  name = "Home"
  url = "/"
  weight = 1

  [[menu.main]]
  name = "Blog"
  url = "/posts/"
  weight = 2
  
  [[menu.main]]
  name = "Archives"
  url = "/archives/"
  weight = 3
    [menu.main.params]
    external = false

# --- Social Icons --- 社交媒体配置
[[params.social]]
name = "github"
url = "xxx"

[[params.social]]
name = "twitter"
url = "xxx"

##############################
# Comments 评论区方案（可选）
##############################
[params.commentSystems.waline]
serverURL = "xxx" 评论区后台URL
locale = "en"

[params.defaultCommentSystems]
waline = true

```



## 其他常用属性

### Theme Switch Toggle (白天夜晚主题相关)

Shows icon besides title of page to change theme

To disable it :

```yml
disableThemeToggle: true
```

You can refer following table for better understanding...

| `defaultTheme` | `disableThemeToggle` | checks local storage? | checks system theme? | Info              |
| -------------- | -------------------- | --------------------- | -------------------- | ----------------- |
| `auto`         | true                 | No                    | Yes                  | only system theme |
|                | false                | Yes (if not->2)       | Yes (2)              | _switch present_  |
| `dark`         | true                 | No                    | No                   | force dark only   |
|                | false                | Yes                   | No                   | _switch present_  |
| `light`        | true                 | No                    | No                   | force light only  |
|                | false                | Yes                   | No                   | _switch present_  |

### Archives Layout（存档页面布局）

Create a page with `archive.md` in `content` directory with following content

```
.
├── config.toml
├── content/
│   ├── archives.md   <--- Create archive.md here
│   └── posts/
 ── static/
```

and add the following to it

```
---
title: "Archive"
layout: "archives"
url: "/archives/"
summary: archives
---
```

**注**：Archives 布局不支持多语言月份翻译。

### Search Page （搜索）

PaperModX uses [Fuse.js Basic](https://fusejs.io/getting-started/different-builds.html#explanation-of-different-builds) for seach functionality

Add the following to site config, `config.yml`

```
[outputs]
  home = ["HTML", "JSON","RSS"]
```

Create a page with `search.md` in `content` directory with following content.

```
---
title: "Search" # in any language you want
layout: "search" # is necessary
# url: "/archive"
# description: "Description for Search"
summary: "search"
---
```

To hide a particular page from being searched, add it in post's fron't matter

```
searchHidden: true
```

### Share Buttons on post （分享按钮）

Displays Share Buttons at Bottom of each post

to show share buttons add

```yml
params:
    ShowShareButtons: true
```

---

### Show post reading time （显示阅读时间）

Displays Reading Time (the estimated time, in minutes, it takes to read the content.)

To show reading time add

```yml
Params:
    ShowReadingTime: true
```

---

### Show Table of Contents (Toc) on blog post （目录）

Displays ToC on blog-pages

To show ToC add following to page-variables

```yml
ShowToc: true
```

To keep Toc Open **by default** on a post add following to page-variables:

```yml
TocOpen: true
```

### BreadCrumb Navigation （返回主页）

Adds BreadCrumb Navigation above Post's Title to show subsections and Navigation to Home

```yml
params:
    ShowBreadCrumbs: true
```

Can be diabled for particular page's front-matter

```yml
---
ShowBreadCrumbs: false
---

```



## Cloudflare配置

### Workers & Pages

配置workers & Pages

![image-20251209161458013](https://e5d9f02.webp.fi/image-20251209161458013.png)

链接 GitHub 仓库

![image-20251209161531167](https://e5d9f02.webp.fi/image-20251209161531167.png)

选择刚才创建好的仓库

```
Project name：随意
Production branch：选择正确的分支
Framework preset：选择Hugo
```

![image-20251209161700588](https://e5d9f02.webp.fi/image-20251209161700588.png)

之后默认部署即可

### 添加自定义域名

```
填写自己拥有的域名即可，Cloudflare会自动化处理。
```

![image-20251209162312838](https://e5d9f02.webp.fi/image-20251209162312838.png)

---

**最后就可以通过域名访问到 BLOG了！**

---

