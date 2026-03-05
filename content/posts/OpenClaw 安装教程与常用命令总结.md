---
author: "Zoran"
title: "OpenClaw 安装教程与常用命令总结"
date: "2026-03-06"
description: "从零开始安装配置 OpenClaw AI 助手，以及日常使用中的常用命令汇总"
tags:
  - Technology
  - OpenClaw
  - AI
  - Tutorial
ShowToc: true
TocOpen: true
ShowWordCount: true
ShowReadingTime: true
ShowBreadCrumbs: true
ShowShareButtons: true
---

# 前言

OpenClaw 是一个强大的 AI 助手平台，可以让你在各种场景下与 AI 进行交互。本文将详细介绍如何在 Windows 系统上安装 OpenClaw，并总结日常使用中的常用命令。

---

# 安装 OpenClaw

## 环境要求

- **操作系统**: Windows 10/11, macOS, 或 Linux
- **Node.js**: v18 或更高版本
- **npm**: 随 Node.js 一起安装
- **Git**: 用于版本控制和技能管理

## 安装步骤

### 1. 安装 Node.js

访问 [Node.js 官网](https://nodejs.org/) 下载并安装 LTS 版本。

验证安装：
```bash
node -v
npm -v
```

### 2. 安装 OpenClaw

使用 npm 全局安装 OpenClaw：

```bash
npm install -g openclaw
```

### 3. 验证安装

```bash
openclaw --version
```

### 4. 初始化工作区

OpenClaw 会在用户目录下创建工作区：

```bash
# Windows
C:\Users\<用户名>\.openclaw\workspace

# macOS/Linux
~/.openclaw/workspace
```

---

# 配置 OpenClaw

## 配置文件位置

配置文件位于工作区根目录：

```
.openclaw/
├── workspace/
│   ├── AGENTS.md          # 多代理工作流配置
│   ├── SOUL.md            # AI 行为准则
│   ├── TOOLS.md           # 工具配置
│   ├── MEMORY.md          # 长期记忆
│   └── memory/            # 每日记忆文件
│       └── YYYY-MM-DD.md
```

## 配置模型 API

编辑配置文件添加 AI 模型 API：

```bash
openclaw configure --section models
```

支持的模型提供商：
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini)
- Moonshot (Kimi)
- 以及其他兼容 OpenAI API 的提供商

---

# 常用命令总结

## 基础命令

| 命令 | 说明 |
|------|------|
| `openclaw --version` | 查看版本 |
| `openclaw --help` | 显示帮助信息 |
| `openclaw status` | 查看当前状态 |

## 会话管理

| 命令 | 说明 |
|------|------|
| `openclaw session list` | 列出所有会话 |
| `openclaw session history <session-key>` | 查看会话历史 |
| `openclaw session send <session-key> "消息"` | 向会话发送消息 |

## 技能管理

| 命令 | 说明 |
|------|------|
| `openclaw skills list` | 列出已安装技能 |
| `openclaw skills info <skill-name>` | 查看技能详情 |
| `clawdhub install <skill-name>` | 从 ClawdHub 安装技能 |
| `clawdhub search <keyword>` | 搜索技能 |

## 配置管理

| 命令 | 说明 |
|------|------|
| `openclaw configure` | 交互式配置 |
| `openclaw configure --section <section>` | 配置特定部分 |

## 浏览器自动化 (需要 agent-browser 技能)

| 命令 | 说明 |
|------|------|
| `agent-browser open <url>` | 打开网页 |
| `agent-browser snapshot` | 获取页面快照 |
| `agent-browser click @e1` | 点击元素 |
| `agent-browser screenshot` | 截图 |

## 搜索技能 (需要 tavily-search 技能)

```bash
node ~/.openclaw/workspace/skills/tavily-search-*/scripts/search.mjs "搜索内容" -n 10
```

---

# 工作区技能推荐

以下是一些实用的技能推荐：

| 技能名称 | 功能 | 安装命令 |
|----------|------|----------|
| agent-browser | 浏览器自动化 | `clawdhub install agent-browser` |
| tavily-search | AI 优化搜索 | `clawdhub install tavily-search` |
| summarize | 内容总结 | `clawdhub install summarize` |
| self-improving-agent | 自我改进 | `clawdhub install self-improving-agent` |
| find-skills | 技能发现 | `clawdhub install find-skills` |

---

# 日常使用流程

## 1. 启动 OpenClaw

```bash
openclaw
```

## 2. 检查状态

```bash
openclaw status
```

## 3. 使用技能

在对话中直接请求使用特定技能，例如：

> "帮我用浏览器访问 example.com 并截图"

## 4. 发布博客（以 Hugo 为例）

```bash
cd D:\BLOG
git add .
git commit -m "update content"
git push origin main
```

---

# 故障排除

## 常见问题

### 1. 命令未找到

确保 npm 全局安装路径已添加到系统 PATH：

```bash
npm config get prefix
```

### 2. 技能安装失败

检查网络连接，或尝试手动安装：

```bash
# 克隆技能到工作区
git clone <skill-repo> ~/.openclaw/workspace/skills/<skill-name>
```

### 3. API 密钥错误

验证配置文件中的 API 密钥：

```bash
openclaw configure --section models
```

---

# 进阶技巧

## 1. 自定义提示词

编辑 `SOUL.md` 文件来自定义 AI 的行为准则和回复风格。

## 2. 长期记忆

重要信息会被记录到 `MEMORY.md`，AI 会在后续会话中参考这些记忆。

## 3. 子代理

复杂任务可以分解给子代理处理：

```bash
openclaw spawn --task "复杂任务描述"
```

## 4. 定时任务

使用 cron 功能设置定时任务：

```bash
openclaw cron add "0 9 * * *" "检查邮件"
```

---

# 总结

OpenClaw 是一个功能强大的 AI 助手平台，通过安装不同的技能可以扩展其能力。掌握基础命令后，可以大大提高工作效率。

**核心要点：**
- 使用 `clawdhub` 管理技能
- 善用浏览器自动化进行网页操作
- 定期查看和整理 MEMORY.md 中的记忆
- 根据需求自定义 SOUL.md 的行为准则

---

**参考链接：**
- [OpenClaw 官方文档](https://docs.openclaw.ai)
- [ClawdHub 技能市场](https://clawhub.com)
- [GitHub 仓库](https://github.com/openclaw/openclaw)
