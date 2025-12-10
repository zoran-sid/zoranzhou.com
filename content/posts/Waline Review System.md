---
author: "Zoran"
title: "Waline 评论系统嵌入 BLOG 方案"
date: "2025-11-24"
description: "使用 Waline方案，涉及 Vercel + LeanCloud"
tags:
  - Technology
ShowToc: true
TocOpen: true
ShowWordCount: true
ShowReadingTime: true
---

# Waline 评论系统

Waline 是一个基于 LeanCloud 等后端的无后端评论系统，在 Hugo 等静态站点中非常流行。

优势：

- 前端资源小，加载快；
- 云端存储，无需部署数据库；
- 支持托管后台，配合 LeanCloud 效果很好；
- 支持多种样式；
- 支持游客或者QQ/微博等登录方式；



我选择此方案原因是支持社交媒体登录，评论区样式美观~

![image-20251209172100285](https://e5d9f02.webp.fi/image-20251209172100285.png)

# 部署流程

## 创建 LeanCloud 账号

![创建应用](https://e5d9f02.webp.fi/leancloud-1-CucZPnJ0.png)

```
获取三个 API
AppID
AppKey
MasterKey
```

![ID 和 Key](https://e5d9f02.webp.fi/leancloud-2-C9bCeSu_.png)

**国内版需要完成备案接入：**

如果你正在使用 Leancloud 国内版 ([leancloud.cn](https://leancloud.cn/))，推荐你切换到国际版 ([leancloud.app](https://leancloud.app/))。否则，你需要为应用额外绑定已备案的域名，同时购买独立 IP 并完成备案接入:

- 登录国内版并进入需要使用的应用
- 选择 `设置` > `域名绑定` > `API 访问域名` > `绑定新域名` > 输入域名 > `确定`。
- 按照页面上的提示按要求在 DNS 上完成 CNAME 解析。
- 购买独立 IP 并提交工单完成备案接入。(独立 IP 目前价格为 ￥ 50/个/月)

![域名设置](https://e5d9f02.webp.fi/leancloud-3-CT_lZM0A.png)



## Vercel部署（服务端）

输入个人喜好的 Vercel 项目名称，并且创建

![image-20251209172854011](https://e5d9f02.webp.fi/image-20251209172854011.png)

点击顶部的 `Settings` - `Environment Variables` 进入环境变量配置页，并配置三个环境变量 `LEAN_ID`, `LEAN_KEY` 和 `LEAN_MASTER_KEY` 。它们的值分别对应上一步在 LeanCloud 中获得的 `APP ID`, `APP KEY`, `Master Key`。

![设置环境变量](https://e5d9f02.webp.fi/vercel-5-CIj2EZQq.png)

环境变量配置完成之后点击顶部的 `Deployments` 点击顶部最新的一次部署右侧的 `Redeploy` 按钮进行重新部署。该步骤是为了让刚才设置的环境变量生效。

![redeploy](https://e5d9f02.webp.fi/vercel-6-CQnJ4Agt.png)

此时会跳转到 `Overview` 界面开始部署，等待片刻后 `STATUS` 会变成 `Ready`。此时请点击 `Visit` ，即可跳转到部署好的网站地址，此地址即为你的服务端地址。

### 绑定域名（可选）

1. 点击顶部的 `Settings` - `Domains` 进入域名配置页
2. 输入需要绑定的域名并点击 `Add`

![Add domain](https://e5d9f02.webp.fi/vercel-8-BDTeHH3e.png)



最终可以通过域名访问评论系统和管理系统：

- 评论系统：example.yourdomain.com
- 评论管理：example.yourdomain.com/ui



注：第一个注册的用户默认为管理员！！！



# 嵌入HTML

```
嵌入Html文件路径
创建 waline.html
/layouts/partials/comments.html  //取决于theme网页结构
```

## Waline.html

```
<!-- Waline Comment System -->
<link
  rel="stylesheet"
  href="https://unpkg.com/@waline/client@v3/dist/waline.css"
/>

<div id="waline"></div>

<script type="module">
  import { init } from 'https://unpkg.com/@waline/client@v3/dist/waline.js';

  init({
    el: '#waline',
    serverURL: '{{ .serverURL }}',   //从 config.toml 获取
    locale: '{{ .locale | default "en" }}',
    dark: '{{ .dark | default "auto" }}',
  });
</script>

```

## Comments.html

```
  {{- if $pageCommentSystems.waline }}
    {{- with .waline }}
      {{- partial "waline.html" . }}
```





本教程参考网站：https://waline.js.org/en/guide/get-started
