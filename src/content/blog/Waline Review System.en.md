---
author: "Zoran"
title: "Integrating Waline Comment System into Your Blog"
date: "2024-05-02"
description: "Using Waline as a commenting solution with Vercel + LeanCloud"
tags:
  - Technology
  - Tutorial
  - Blog
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

## Why Waline?

| Feature | Waline | Disqus | Giscus |
| :--- | :--- | :--- | :--- |
| Self-hosted | ✅ | ❌ | ✅ (GitHub) |
| No ads | ✅ | ❌ (Pro only) | ✅ |
| Data ownership | ✅ | ❌ | ✅ |
| Login options | Multiple | Multiple | GitHub only |
| Markdown support | ✅ | ✅ | ✅ |
| Email notifications | ✅ | ✅ | ❌ |
| Free | ✅ | ✅ (with ads) | ✅ |

---

## Architecture

```
[Visitor] → [Vercel (Waline server)] → [LeanCloud (Database)]
                                              ↓
                                     [Email Notification]
```

---

## Step 1: Set Up LeanCloud

### Create an Account

1. Go to [leancloud.app](https://www.leancloud.app/) (International) or [leancloud.cn](https://www.leancloud.cn/) (China)
2. Create a new application
3. Go to **Settings** → **App Keys**
4. Note down: `AppID`, `AppKey`, `MasterKey`

### Create the Comment Table

In LeanCloud dashboard:
1. Go to **Storage** → **Create Class**
2. Name it `Comment`
3. Add columns: `nick`, `mail`, `link`, `comment`, `ua`, `url`, `ip`, `insertedAt`

---

## Step 2: Deploy Waline to Vercel

### One-Click Deploy

Click the deploy button on the [Waline documentation](https://waline.js.org/guide/get-started.html) or:

1. Fork/clone [github.com/walinejs/waline](https://github.com/walinejs/waline)
2. Import to Vercel
3. Set environment variables:

| Variable | Value |
| :--- | :--- |
| `LEAN_ID` | Your LeanCloud AppID |
| `LEAN_KEY` | Your LeanCloud AppKey |
| `LEAN_MASTER_KEY` | Your LeanCloud MasterKey |
| `SITE_NAME` | Your blog name |
| `SITE_URL` | Your blog URL |
| `SMTP_SERVICE` | (Optional) For email notifications |
| `AUTHOR_EMAIL` | (Optional) Your email |

4. Deploy!

After deployment, you'll get a URL like `https://waline-xxxxx.vercel.app`.

---

## Step 3: Integrate with Your Blog

### Hugo (PaperMod Theme)

Add to `config.toml`:

```toml
[params]
  [params.waline]
    serverURL = "https://waline-xxxxx.vercel.app"
    lang = "en"
    visitor = true
    emoji = [
      "https://unpkg.com/@waline/emojis@1.1.0/weibo",
      "https://unpkg.com/@waline/emojis@1.1.0/bilibili"
    ]
```

### Astro

Install the Waline client:

```bash
npm install @waline/client
```

Add to your post layout:

```astro
---
import { init } from '@waline/client';
---

<div id="waline"></div>

<script>
  init({
    el: '#waline',
    serverURL: 'https://waline-xxxxx.vercel.app',
    lang: 'en',
    dark: 'auto',
    emoji: [
      'https://unpkg.com/@waline/emojis@1.1.0/weibo',
    ],
  });
</script>
```

### Generic HTML

Add to any page:

```html
<div id="waline"></div>
<link rel="stylesheet" href="https://unpkg.com/@waline/client@v3/dist/waline.css" />
<script type="module">
  import { init } from 'https://unpkg.com/@waline/client@v3/dist/waline.js';
  init({
    el: '#waline',
    serverURL: 'https://waline-xxxxx.vercel.app',
  });
</script>
```

---

## Step 4: Configure Waline

### Admin Management

Visit `https://waline-xxxxx.vercel.app/ui` to manage comments:
- Approve/delete comments
- Pin important comments
- View visitor statistics
- Configure spam filtering

### Akismet Spam Protection

Add to Vercel environment variables:

```env
AKISMET_KEY=your_akismet_api_key
```

### Email Notifications

Configure SMTP in Vercel environment:

```env
SMTP_SERVICE=QQ         # or Gmail, 163, etc.
SMTP_USER=your@email.com
SMTP_PASS=your_password
SITE_NAME=My Blog
```

---

## Migration from Other Systems

### From Disqus

Waline provides an import tool at `https://waline-xxxxx.vercel.app/ui/migration`.

### From Giscus/GitHub Issues

Export GitHub issues as JSON, then use the Waline import API.

---

## Troubleshooting

| Issue | Solution |
| :--- | :--- |
| Comments not loading | Check browser console for CORS errors; verify Vercel URL |
| 401 Unauthorized | Check LeanCloud keys in Vercel env vars |
| 500 Server Error | Check Vercel function logs |
| Chinese characters garbled | Set `lang: 'zh-CN'` in Waline config |
| IP not recorded | Enable `recordIP: true` in server config |

---

## Conclusion

Waline provides a complete, self-hosted commenting solution:

✅ **Free** — Vercel free tier + LeanCloud free tier  
✅ **Data ownership** — You own all comment data  
✅ **No ads** — Unlike Disqus free plan  
✅ **Customizable** — Full control over UI and features  
✅ **Multi-platform** — Works with any static site generator  

It's the ideal commenting solution for personal blogs and documentation sites.
