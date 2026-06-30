---
author: "Zoran"
title: "Building Your Free Blog from Scratch (GitHub + Cloudflare)"
date: "2024-05-01"
description: "A static site deployment guide based on GitHub and Cloudflare (Hugo)"
tags:
  - Technology
  - Tutorial
  - Cloudflare
  - GitHub
ShowToc: true
TocOpen: true
ShowWordCount: true
ShowReadingTime: true
ShowBreadCrumbs: true
ShowShareButtons: true
lang: en
translationKey: building-blog
slug: building-blog-en
---

# Preface

As a long-time VPS server holder, I initially tried using Alibaba Cloud's VPS as a platform for my Hugo Blog site. Throughout the deployment process and based on the final results, I identified the following issues:

- Performance limited by VPS hardware configuration
- HTTPS requires manual certificate configuration on the web server
- Content publishing is cumbersome; backend data updates are not timely and rely on scripts
- Low website reliability
- Conflicts with other services deployed on the same VPS

**Ultimately, I chose the GitHub Pages + Cloudflare hosting solution for my blog. It solves all the above problems — and most importantly, it's free!**

## Why GitHub Pages + Cloudflare?

### GitHub Pages

GitHub Pages provides free static site hosting directly from your repository. Key advantages:

- **Free hosting** with unlimited bandwidth for personal sites
- **Automatic HTTPS** via Let's Encrypt
- **Git-based workflow** — push to deploy
- **Custom domain support**
- **Built-in CI/CD** via GitHub Actions

### Cloudflare

Cloudflare sits in front of GitHub Pages providing:

- **Global CDN** — content served from 300+ data centers
- **DDoS protection** — enterprise-grade security
- **Free SSL/TLS** certificates
- **Performance optimization** — minification, image optimization, caching
- **Analytics** — traffic insights without third-party scripts

### Architecture Overview

```
[Your Computer] → git push → [GitHub Repository]
                                  ↓
                          [GitHub Actions]
                                  ↓
                          [GitHub Pages] ← [Cloudflare CDN] ← [Visitors]
```

---

## Step 1: Set Up Hugo

### Install Hugo

**Windows (Chocolatey):**
```bash
choco install hugo-extended
```

**macOS (Homebrew):**
```bash
brew install hugo
```

**Linux (Snap):**
```bash
sudo snap install hugo
```

### Create a New Hugo Site

```bash
hugo new site my-blog
cd my-blog
git init
```

### Add a Theme

Choose a theme from [themes.gohugo.io](https://themes.gohugo.io/). For example, the PaperMod theme:

```bash
git submodule add https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
```

Update your `hugo.toml` (or `config.toml`):

```toml
baseURL = "https://yourdomain.com/"
languageCode = "en-us"
title = "My Blog"
theme = "PaperMod"
```

---

## Step 2: Deploy to GitHub Pages

### Create a GitHub Repository

1. Create a new repository on GitHub named `<username>.github.io`
2. Link your local repo:

```bash
git remote add origin https://github.com/<username>/<username>.github.io.git
```

### Configure GitHub Actions

Create `.github/workflows/hugo.yml`:

```yaml
name: Deploy Hugo site to Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive
      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: 'latest'
          extended: true
      - name: Build
        run: hugo --minify
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
```

Push to trigger deployment:

```bash
git add .
git commit -m "Initial Hugo site"
git push -u origin main
```

---

## Step 3: Configure Cloudflare

### Add Your Domain to Cloudflare

1. Sign up at [cloudflare.com](https://www.cloudflare.com/)
2. Add your domain and follow the nameserver change instructions
3. Wait for DNS propagation (up to 24 hours, usually much faster)

### Configure DNS Records

Add a CNAME record:
- **Name**: `@` (or your subdomain)
- **Target**: `<username>.github.io`
- **Proxy status**: Proxied (orange cloud)

### SSL/TLS Settings

Set SSL/TLS encryption mode to **Full** or **Full (strict)**.

### Page Rules (Optional)

Create page rules for advanced caching:
- `yourdomain.com/*` → Cache Level: Cache Everything, Edge Cache TTL: a month

---

## Step 4: Write and Publish

### Create a New Post

```bash
hugo new posts/my-first-post.md
```

Edit the generated markdown file, then:

```bash
git add .
git commit -m "New post: My First Post"
git push
```

GitHub Actions will automatically build and deploy. Within minutes, your post is live on Cloudflare's global CDN.

---

## Conclusion

This GitHub Pages + Cloudflare setup gives you:

✅ **100% Free** — no hosting costs  
✅ **Global CDN** — fast loading worldwide  
✅ **Automatic HTTPS** — secure by default  
✅ **Git-based workflow** — push to publish  
✅ **DDoS protection** — enterprise-grade security  

It's the ideal solution for personal blogs, documentation sites, and project portfolios.
