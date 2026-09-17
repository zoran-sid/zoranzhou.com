---
author: "Zoran"
title: "从零开始搭建你的免费 BLOG 博客（Github+Cloudflare）"
date: "2024-05-01"
updated: "2026-09-17"
description: "基于 GitHub 与 Cloudflare 的静态站点部署方案（Hugo）"
tags:
  - Technology
ShowToc: true
TocOpen: true
ShowWordCount: true
ShowReadingTime: true
ShowBreadCrumbs: true
ShowShareButtons: true
lang: zh-CN
translationKey: building-blog
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

## Cloudflare R2 对象存储 + WebP Cloud 代理加速

随着博客内容的增加，图片资源的存储和加载速度成为影响用户体验的关键因素。这里介绍一套免费的图片存储与加速方案：**Cloudflare R2** 配合 **WebP Cloud** 代理。

### 为什么需要这套方案？

- **GitHub 仓库限制**：大量图片会增加仓库体积，影响克隆和部署速度
- **加载速度**：直接从 GitHub 或 Cloudflare Pages 加载图片，跨国访问速度不稳定
- **格式优化**：现代浏览器支持 WebP 格式，体积更小，加载更快
- **成本考量**：R2 提供 10GB 免费存储，WebP Cloud 提供免费代理转换服务

### Cloudflare R2 配置

R2 是 Cloudflare 提供的兼容 S3 API 的对象存储服务。

#### 创建 R2 存储桶

1. 登录 Cloudflare Dashboard，进入 **R2** 页面
2. 点击 **Create bucket**，输入存储桶名称（如 `blog-storage`）
3. 选择存储桶位置，建议选 **Automatic** 让 Cloudflare 自动优化

#### 配置公开访问

R2 默认是私有的，需要配置公开访问才能通过 URL 直接访问图片：

1. 进入存储桶设置，找到 **Public Access** 选项
2. 开启 **Allow Public Access**
3. 绑定自定义域名（推荐）：
   - 在 **Custom Domains** 中添加你的子域名，如 `images.yourdomain.com`
   - 或者使用 WebP Cloud 提供的代理域名

#### 获取 API 凭证

用于通过 API 上传图片：

1. 进入 **R2** → **Manage R2 API Tokens**
2. 点击 **Create API Token**
3. 选择 **Object Read & Write** 权限
4. 复制 **Access Key ID** 和 **Secret Access Key**

**API 连接信息示例：**

```
Account ID: your-account-id
Access Key ID: your-access-key
Secret Access Key: your-secret-key
Bucket: blog-storage
S3 API Endpoint: https://your-account-id.r2.cloudflarestorage.com
```

#### 上传图片到 R2

可以使用多种方式上传：

**方式一：Cloudflare Dashboard 网页上传**
- 适合偶尔上传少量图片

**方式二：AWS CLI / boto3 脚本**
- 适合批量上传和自动化工作流

```python
import boto3

s3 = boto3.client(
    's3',
    endpoint_url='https://your-account-id.r2.cloudflarestorage.com',
    aws_access_key_id='your-access-key',
    aws_secret_access_key='your-secret-key',
    region_name='auto'
)

# 上传文件
s3.upload_file('local-image.jpg', 'blog-storage', 'image-20250101.jpg')
```

**方式三：第三方工具（如 rclone、Cyberduck）**
- 图形化界面，操作直观

### WebP Cloud 代理加速

WebP Cloud（webp.fi）是一个免费的图片代理服务，可以自动将图片转换为 WebP 格式，并提供全球 CDN 加速。

#### 配置 WebP Cloud

1. 访问 [WebP Cloud](https://webp.fi) 官网
2. 注册账号并添加你的 R2 存储桶作为源站
3. 配置自定义域名（可选）

#### 使用方式

假设你的 R2 图片原始链接是：
```
https://your-bucket.your-account-id.r2.cloudflarestorage.com/image.jpg
```

通过 WebP Cloud 代理后：
```
https://your-proxy.webp.fi/image.jpg
```

WebP Cloud 会自动：
- 将图片转换为 WebP 格式（浏览器支持时）
- 压缩图片体积
- 通过 Cloudflare CDN 全球加速

#### 在博客中使用

在 Hugo 的 Markdown 文章中引用：

```markdown
![图片描述](https://your-proxy.webp.fi/image-20250101.jpg)
```

### 完整工作流示例

1. **撰写文章**时，将图片保存到本地
2. **上传图片**到 R2 存储桶
3. **获取 WebP Cloud 代理链接**
4. **在 Markdown 中引用**代理链接
5. **部署博客**，图片会自动通过 WebP Cloud 加速加载

### 成本与限额

| 服务 | 免费额度 | 超出后 |
|------|---------|--------|
| Cloudflare R2 | 10GB 存储/月 | $0.015/GB/月 |
| Cloudflare R2 | 100 万次请求/月 | $0.36/百万次 |
| WebP Cloud | 无限（目前免费） | 免费 |

对于个人博客来说，免费额度完全够用。

### 总结

这套方案的优势：
- ✅ **完全免费**：R2 + WebP Cloud 对个人用户免费
- ✅ **全球加速**：Cloudflare CDN 覆盖全球
- ✅ **自动优化**：WebP 格式自动压缩，提升加载速度
- ✅ **兼容性好**：S3 API 标准，工具生态丰富
- ✅ **与现有工作流集成**：不影响 Hugo + GitHub + Cloudflare Pages 的部署流程

通过这套方案，你的博客图片可以实现快速、稳定、低成本的全球分发。

---

## 2026 年 9 月补记：博客慢慢换了个样子

前面这篇教程先留在这里。最开始的网站，确实就是照着这些步骤一点点搭起来的，截图里的界面、当时用的主题，还有那些复制过来的配置，也算是这个博客刚开始时的模样。

只是后来又折腾了一阵，现在再打开网站，已经和上面不太一样了。底层从 Hugo 换成了 Astro，最近又借助 GPT-5.6 Sol 和 GPT-6 Astra 做了几轮重构。趁着这次整理，在后面接着记几句，也方便以后回头看看，自己是怎么一路改过来的。

如果你是想了解 Hugo 和 PaperModX，前面的内容可以作为当时的搭建记录；如果想参考这个网站现在的做法，就从这里往下看。旧文里的服务界面、免费额度和价格也可能已经变化，使用前还是要去对应官网核对一下。

### 从套用主题，到慢慢整理自己的内容

刚开始搭博客的时候，想法很简单。找一个顺眼的主题，把文章放进去，有自己的域名，能正常打开，就觉得挺满足了。Hugo 和 PaperModX 帮我完成了这一步，很多现成的功能，也省去了自己从头写的麻烦。

后来写的东西多了一些，博客里又陆续放进了读书记录、照片、跑步和出行的足迹。它们放在同一个网站里，却不太适合全都挤在一张文章列表上。想改首页，想给生活留个入口，也想把学习中的东西单独放好。于是，这个博客就这样一点点变了样子。

现在项目用的是 Astro 5，配合 TypeScript、MDX 和 Tailwind CSS 4。文章仍然保存在 Markdown 文件里，页面的布局则交给组件处理。正文和样式分开放，日后再调整页面时，写过的文字也可以继续留着。

我比较喜欢这一点。毕竟框架可能还会换，页面也可能还会改，但一篇篇文章总归是想留下来的。

这次重构把主站的入口整理成了文章、实践、生活和关于。首页放几篇精选文章，接上最近的记录、正在学习的内容，再留一张生活照片。颜色也收到了暖白、墨色和一点蓝色。没有那么多东西抢着出现在第一屏，读起来能安静一点。

跑步路线用 MapLibre GL 展示，原始 GPX 文件留在项目里。地图上可以把轨迹画得更清楚，但记录里的距离和起终点，还是应该尊重原始数据。生活部分则把照片、足迹和书影音放到了一起，想看哪一部分，再慢慢点进去。

另外留了一个独立的 [WEB3 LAB](/zh-CN/lab/)，用来放学习路线和研究笔记。目前从 TypeScript 开始，后面的内容还在计划里。学到哪里，就记到哪里，倒也不用急着把每个页面都填满。

GPT-5.6 Sol 和 GPT-6 Astra 都参与过这段重构。借助 AI，可以把之前觉得麻烦、一直拖着没动的想法拿出来试一试。不过网站最后长成什么样，还是需要自己一点点确认。入口是不是太多，手机上读文章舒不舒服，中英文切换会不会跳到空页面，这些都得实际打开看看。

有时候，需求说小一点反而更容易推进。先把一篇文章的阅读页面整理舒服，再去改首页；先让语言切换能找到正确的文章，再考虑其他细节。每次改一点，用一用，再接着调整。

### 现在怎样写一篇文章

换到 Astro 以后，日常写作并没有变得很复杂。项目源码还是放在 [GitHub 仓库](https://github.com/zoran-sid/zoranzhou.com)，下面这些命令和目录，对应的是这个仓库当前的版本。

本地准备好 Git、符合项目依赖要求的 Node.js 和 npm，第一次把项目拉下来，可以这样启动：

```sh
git clone https://github.com/zoran-sid/zoranzhou.com.git
cd zoranzhou.com
npm ci
npm run dev
```

然后打开 `http://localhost:4321/zh-CN/`，就能看到中文页面。依赖按仓库里的锁文件安装，先把现有版本跑起来，再慢慢改自己的内容。

技术文章主要放在 `src/content/blog/`，随笔放在 `src/content/essays/`。新写一篇文章，就是在对应目录里增加一个 Markdown 文件。文件开头填上标题、日期、语言这些信息，下面照常写正文：

```markdown
---
title: "最近又整理了一下博客"
date: "2026-09-17"
description: "记下这次调整，也给以后留一点参考。"
tags:
  - Technology
lang: zh-CN
draft: false
---

好像每隔一段时间，就会想给博客换一点东西。
```

还没写完的话，把 `draft` 改成 `true` 就好。旧文章有了新的补充，可以加上 `updated` 日期，不必把最初的发布时间一起改掉。

中英文版本是分别保存的，两篇文章用相同的 `translationKey` 对应起来。它不会自动把中文翻译成英文，译文还是需要另外整理。如果没有对应的译文，网站切换语言时会回到目标语言的列表。

项目里还留了一个本地内容编辑器，运行 `npm run editor`，打开 `http://127.0.0.1:4322` 就可以使用。不想一直看着 Markdown 源码时，可以在浏览器里写。它保存的仍然是本地文件，也只在自己的电脑上运行。

照片依旧可以用 Markdown 引用。以前文章里的图床链接继续保留，现在也有一部分图片直接放在项目里。至于选哪种方式，还是看自己平时怎样整理照片比较顺手，不必为了开始写作，先把所有配套都搭齐。

### 部署这件事，还是交给 Cloudflare

换了框架，GitHub 和 Cloudflare 这部分倒是继续沿用了下来。顺便补充一下前文的表述：现在这套方案中，GitHub 负责保存仓库，Cloudflare Pages 负责构建和发布网页，不需要另外开启 GitHub Pages。

Astro 配置里保留的是 `output: "static"`。文章会在构建时生成页面，输出到 `dist/`，再由 Cloudflare Pages 托管。线上没有内容编辑后台，也没有生产数据库。搜索、主题切换和地图这些交互，仍然可以在浏览器里完成。

网站根地址 `/` 另有一个很小的 Pages Function，用来读取语言偏好，把访问者带到中文或英文首页。其他页面仍然是已经生成好的静态文件。

发布前，在本地做一次检查：

```sh
npm run lint
npm run build
npm run preview
```

前两个命令检查项目并生成网站，最后一个用来预览构建结果，访问地址看终端提示即可。它们都不会替你上传。

对于现在这个仓库，Cloudflare Pages 的构建命令是 `npm run build`，输出目录是 `dist`。这些和前面 Hugo 那一节的配置不同，迁移旧项目时也要一起改过来。仓库里的 `wrangler.toml` 同样把 Pages 输出目录设成了 `dist`。

平时修改好文章，先在本地看看，再把改动提交、推送到连接好的 GitHub 生产分支，后续由 Pages 构建和发布。本地保存文件和线上更新是两回事，写到一半的时候，也就不用担心它已经出现在网站上。

前文说“免费”，更多是当时不用再为博客单独租一台服务器的轻松感。现在回头看，域名仍然要续费，图床和托管服务也各有自己的额度。对我来说，少照看一些服务，多留一点时间写东西，才是这套方式一直用下来的原因。

从最初套用主题，到现在慢慢整理成自己的样子，博客似乎也没有一个真正完工的时候。偶尔有想法就改一点，出去走走回来放几张照片，学到什么再记上一段。之前写得生涩的内容也留着，过一阵子回头看，还能想起来那时在折腾什么。

就先这样慢慢更新吧。页面可以以后再改，今天想写的东西，先留下来。
