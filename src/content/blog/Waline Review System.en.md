---
author: "Zoran"
title: "Integrating Waline Comment System into Your Blog"
date: "2024-05-02"
description: "Using Waline as a commenting solution with Vercel + LeanCloud"
tags:
  - Technology
ShowToc: true
TocOpen: true
ShowWordCount: true
ShowReadingTime: true
ShowBreadCrumbs: true
ShowShareButtons: true
lang: en
translationKey: waline-review-system
slug: waline-review-system-en
---

# Waline Comment System

Waline is a serverless commenting system backed by LeanCloud and other backends, extremely popular for Hugo and other static site generators.

Advantages:

- Small frontend resources, fast loading;
- Cloud storage, no need to deploy a database;
- Supports managed backend, works great with LeanCloud;
- Supports multiple styles;
- Supports guest login or QQ/Weibo login methods;

I chose this solution because it supports social media login and the comment section looks great~

![image-20251209172100285](https://e5d9f02.webp.fi/image-20251209172100285.png)

# Deployment Process

## Create LeanCloud Account

![Create Application](https://e5d9f02.webp.fi/leancloud-1-CucZPnJ0.png)

```
Obtain three API keys:
AppID
AppKey
MasterKey
```

![ID and Key](https://e5d9f02.webp.fi/leancloud-2-C9bCeSu_.png)

**China edition requires ICP filing:**

If you are using the LeanCloud China edition ([leancloud.cn](https://leancloud.cn/)), it is recommended to switch to the international edition ([leancloud.app](https://leancloud.app/)). Otherwise, you need to bind an ICP-filed domain for the application, purchase an independent IP, and complete the filing process:

- Log into the China edition and enter the application you need to use
- Select `Settings` > `Domain Binding` > `API Access Domain` > `Bind New Domain` > Enter domain > `Confirm`.
- Follow the on-page instructions to complete the CNAME resolution in DNS.
- Purchase an independent IP and submit a ticket to complete the ICP filing. (Independent IP is currently priced at ¥50/unit/month)

![Domain Settings](https://e5d9f02.webp.fi/leancloud-3-CT_lZM0A.png)



## Vercel Deployment (Server Side)

Enter your preferred Vercel project name and create it.

![image-20251209172854011](https://e5d9f02.webp.fi/image-20251209172854011.png)

Click `Settings` - `Environment Variables` at the top to enter the environment variable configuration page, and configure three environment variables: `LEAN_ID`, `LEAN_KEY`, and `LEAN_MASTER_KEY`. Their values correspond respectively to the `APP ID`, `APP KEY`, and `Master Key` obtained in the previous step from LeanCloud.

![Set Environment Variables](https://e5d9f02.webp.fi/vercel-5-CIj2EZQq.png)

After configuring environment variables, click `Deployments` at the top, then click the `Redeploy` button on the right side of the latest deployment. This step is to make the environment variables you just set take effect.

![Redeploy](https://e5d9f02.webp.fi/vercel-6-CQnJ4Agt.png)

This will redirect to the `Overview` page where deployment begins. Wait a moment until `STATUS` becomes `Ready`. At this point, click `Visit` to go to the deployed website address — this address is your server-side address.

### Bind Domain (Optional)

1. Click `Settings` - `Domains` at the top to enter the domain configuration page
2. Enter the domain you want to bind and click `Add`

![Add domain](https://e5d9f02.webp.fi/vercel-8-BDTeHH3e.png)



Finally, you can access the comment system and management system via your domain:

- Comment system: example.yourdomain.com
- Comment management: example.yourdomain.com/ui



Note: The first registered user is the administrator by default!!!



# Embed HTML

```
Embed HTML file path:
Create waline.html
/layouts/partials/comments.html  // Depends on the theme's web page structure
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
    serverURL: '{{ .serverURL }}',   // Retrieved from config.toml
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





This tutorial references: https://waline.js.org/en/guide/get-started
