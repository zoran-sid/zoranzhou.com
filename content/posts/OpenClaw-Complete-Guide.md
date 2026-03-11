---
author: "Zoran"
title: "OpenClaw 完全安装指南与命令详解"
date: "2026-03-05"
description: "基于官方文档的 OpenClaw AI 助手完整安装教程，涵盖多种安装方式、配置详解及常用命令汇总"
tags:
  - Technology
  - OpenClaw
  - AI
  - Tutorial
  - CLI
ShowToc: true
TocOpen: true
ShowWordCount: true
ShowReadingTime: true
ShowBreadCrumbs: true
ShowShareButtons: true
---

# 前言

OpenClaw 是一个强大的 AI 助手平台，支持多代理架构、浏览器自动化、定时任务、跨平台消息推送等丰富功能。本文将基于官方文档，详细介绍 OpenClaw 的完整安装流程、配置方法以及日常使用中的各类命令。

---

# 系统要求

在安装 OpenClaw 之前，请确保你的系统满足以下要求：

- **Node.js**: 22 或更高版本（安装脚本会自动安装）
- **操作系统**: macOS、Linux 或 Windows
- **包管理器**: npm（必需）或 pnpm（源码安装时需要）

<aside>
💡 **Windows 用户注意**：强烈建议在 WSL2 环境下运行 OpenClaw，可以获得更好的兼容性和性能。
</aside>

---

# 安装方法

## 方法一：安装脚本（推荐）

安装脚本是最简单的方式，它会自动处理 Node 检测、安装和初始化向导。

### macOS / Linux / WSL2

```
curl -fsSL https://openclaw.ai/install.sh | bash
```

### Windows (PowerShell)

```
iwr -useb https://openclaw.ai/install.ps1 | iex
```

**跳过初始化向导，仅安装二进制文件：**

```
# macOS / Linux / WSL2
curl -fsSL https://openclaw.ai/install.sh | bash -s -- --no-onboard

# Windows PowerShell
& ([scriptblock]::Create((iwr -useb https://openclaw.ai/install.ps1))) -NoOnboard
```

## 方法二：npm / pnpm 安装

如果你已经安装了 Node 22+，可以手动管理安装：

### 使用 npm

```
npm install -g openclaw@latest
openclaw onboard --install-daemon
```

<aside>
⚠️ **macOS 用户注意**：如果你通过 Homebrew 安装了 libvips，可能会导致 sharp 构建失败。强制使用预编译二进制文件：

```
SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install -g openclaw@latest
```
</aside>

### 使用 pnpm

```
pnpm add -g openclaw@latest
pnpm approve-builds -g        # 批准构建脚本
openclaw onboard --install-daemon
```

<aside>
💡 pnpm 需要显式批准带有构建脚本的包。安装后如果出现 "Ignored build scripts" 警告，运行 `pnpm approve-builds -g` 并选择列出的包。
</aside>

## 方法三：从源码安装

适合贡献者或想要本地运行的用户。

```
# 1. 克隆仓库并构建
git clone https://github.com/openclaw/openclaw.git
cd openclaw
pnpm install
pnpm ui:build
pnpm build

# 2. 链接 CLI 到全局
pnpm link --global

# 3. 运行初始化向导
openclaw onboard --install-daemon
```

<aside>
💡 如果不链接全局，也可以在仓库内通过 `pnpm openclaw ...` 运行命令。
</aside>

## 方法四：Docker / Podman

适合容器化或 headless 部署：

```
# Docker
docker run -it --rm openclaw/openclaw:latest

# Podman（rootless）
# 先运行 setup-podman.sh，然后使用启动脚本
```

其他安装方式：
- **Nix**: 声明式安装
- **Ansible**: 自动化集群部署
- **Bun**: 仅 CLI 使用

---

# 安装后验证

安装完成后，运行以下命令验证一切正常：

```
# 检查配置问题
openclaw doctor

# 查看网关状态
openclaw status

# 打开浏览器控制面板
openclaw dashboard
```

---

# 初始化配置

## 运行初始化向导

```
openclaw onboard
```

向导会引导你完成：
1. 工作区设置
2. 模型提供商配置（API Key）
3. 消息通道配置（WhatsApp、Telegram、Discord 等）
4. 技能安装
5. 网关服务安装

## 常用配置选项

### 非交互式配置

```
# 快速模式
openclaw onboard --non-interactive --mode local

# 指定模型提供商
openclaw onboard --auth-choice openai-api-key --openai-api-key $OPENAI_API_KEY

# 远程网关模式
openclaw onboard --mode remote --remote-url https://gateway.example.com --remote-token $TOKEN
```

### 配置模型

```
# 查看模型状态
openclaw models status

# 设置主模型
openclaw models set moonshot/kimi-k2.5

# 设置图像模型
openclaw models set-image openai/gpt-4o

# 添加模型别名
openclaw models aliases add kimi moonshot/kimi-k2.5

# 配置模型认证
openclaw models auth add
openclaw models auth setup-token --provider anthropic
```

---

# 核心命令详解

## 基础命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `openclaw --version` | 查看版本 | `openclaw -V` |
| `openclaw --help` | 显示帮助 | `openclaw --help` |
| `openclaw doctor` | 健康检查 | `openclaw doctor --deep` |
| `openclaw status` | 查看状态 | `openclaw status --usage` |
| `openclaw dashboard` | 打开控制面板 | `openclaw dashboard` |

## 配置管理

```
# 交互式配置向导
openclaw configure

# 获取配置值
openclaw config get agents.defaults.model.primary

# 设置配置值
openclaw config set agents.defaults.model.primary moonshot/kimi-k2.5

# 验证配置
openclaw config validate

# 查看配置文件路径
openclaw config file
```

## 网关管理

```
# 查看网关状态
openclaw gateway status

# 安装网关服务
openclaw gateway install --port 18789

# 启动/停止/重启网关
openclaw gateway start
openclaw gateway stop
openclaw gateway restart

# 查看日志
openclaw logs --follow
openclaw logs --limit 200
```

## 会话管理

```
# 列出所有会话
openclaw sessions list

# 查看会话历史
openclaw sessions history agent:main:main

# 向会话发送消息
openclaw sessions send agent:main:main "你好"
```

## 技能管理

```
# 列出已安装技能
openclaw skills list

# 查看技能详情
openclaw skills info agent-browser

# 检查技能就绪状态
openclaw skills check

# 从 ClawdHub 搜索技能
npx clawhub search browser

# 安装技能
npx clawhub install agent-browser
```

## 消息通道管理

```
# 列出配置的通道
openclaw channels list

# 检查通道状态
openclaw channels status --probe

# 查看通道日志
openclaw channels logs --lines 100

# 添加 Telegram 机器人
openclaw channels add --channel telegram --account alerts --name "Alerts Bot" --token $TELEGRAM_BOT_TOKEN

# 添加 Discord 机器人
openclaw channels add --channel discord --account work --name "Work Bot" --token $DISCORD_BOT_TOKEN

# 移除通道
openclaw channels remove --channel discord --account work --delete
```

## 代理管理

```
# 列出代理
openclaw agents list

# 添加新代理
openclaw agents add my-agent --workspace /path/to/workspace

# 绑定通道到代理
openclaw agents bind --agent my-agent --bind telegram:alerts

# 解绑通道
openclaw agents unbind --agent my-agent --bind telegram:alerts

# 删除代理
openclaw agents delete my-agent
```

## 浏览器自动化

```
# 启动浏览器
openclaw browser start

# 打开网页
openclaw browser open https://example.com

# 获取页面快照
openclaw browser snapshot --interactive

# 点击元素
openclaw browser click @e1

# 输入文本
openclaw browser type @e2 "搜索内容" --submit

# 截图
openclaw browser screenshot --full-page

# 停止浏览器
openclaw browser stop
```

## 定时任务 (Cron)

```
# 查看定时任务
openclaw cron list

# 添加定时任务（每 30 分钟）
openclaw cron add --name "heartbeat" --every 30m --system-event "检查邮件"

# 添加定时任务（特定时间）
openclaw cron add --name "reminder" --at "2026-03-10T09:00:00Z" --message "开会提醒"

# 添加 Cron 表达式任务
openclaw cron add --name "daily" --cron "0 9 * * *" --system-event "每日简报"

# 启用/禁用任务
openclaw cron enable <id>
openclaw cron disable <id>

# 删除任务
openclaw cron rm <id>

# 立即运行任务
openclaw cron run <id>
```

## 节点管理（移动设备）

```
# 列出已配对节点
openclaw nodes list

# 查看节点详情
openclaw nodes describe --node <id>

# 批准配对请求
openclaw nodes approve <requestId>

# 拍照（iOS/Android）
openclaw nodes camera snap --node <id> --facing back

# 录屏（iOS/Android）
openclaw nodes screen record --node <id> --duration 30s

# 获取位置
openclaw nodes location get --node <id>

# 发送通知（macOS）
openclaw nodes notify --node <id> --title "提醒" --body "内容"

# 在节点上运行命令
openclaw nodes run --node <id> ls -la
```

## 内存搜索

```
# 查看内存索引状态
openclaw memory status

# 重新索引内存
openclaw memory index

# 搜索记忆
openclaw memory search "OpenClaw 安装"
```

---

# 工作区文件结构

OpenClaw 在工作区使用以下文件组织配置和记忆：

```
~/.openclaw/
├── workspace/                    # 主工作区
│   ├── AGENTS.md                # 多代理工作流配置
│   ├── SOUL.md                  # AI 行为准则和个性
│   ├── TOOLS.md                 # 工具能力和使用模式
│   ├── MEMORY.md                # 长期记忆（仅主会话）
│   ├── TOOLS.md                 # 工具配置
│   ├── BOOTSTRAP.md             # 首次运行引导（可删除）
│   ├── HEARTBEAT.md             # 定时任务检查清单
│   ├── IDENTITY.md              # AI 身份信息
│   ├── USER.md                  # 用户信息
│   ├── .learnings/              # 学习记录
│   │   ├── LEARNINGS.md
│   │   ├── ERRORS.md
│   │   └── FEATURE_REQUESTS.md
│   └── memory/                  # 每日记忆文件
│       └── YYYY-MM-DD.md
├── config.json                  # 主配置文件
├── agents/                      # 代理配置
└── skills/                      # 已安装技能
```

---

# 推荐技能清单

| 技能名称 | 功能描述 | 安装命令 |
|----------|----------|----------|
| **agent-browser** | 浏览器自动化（导航、点击、截图） | `npx clawhub install agent-browser` |
| **tavily-search** | AI 优化搜索 | `npx clawhub install tavily-search` |
| **summarize** | 内容总结（URL、PDF、视频） | `npx clawhub install summarize` |
| **self-improving-agent** | 自我改进和学习记录 | `npx clawhub install self-improving-agent` |
| **find-skills** | 发现和安装技能 | `npx clawhub install find-skills` |
| **sag** | ElevenLabs 语音合成 | `npx clawhub install sag` |
| **canvas** | 画布展示和 A2UI | `npx clawhub install canvas` |

---

# 故障排除

## openclaw 命令未找到

**诊断：**

```
node -v
npm -v
npm prefix -g
echo "$PATH"
```

**修复（macOS/Linux）：**

将以下行添加到 `~/.zshrc` 或 `~/.bashrc`：

```
export PATH="$(npm prefix -g)/bin:$PATH"
```

**Windows：**
将 `npm prefix -g` 的输出添加到系统 PATH 环境变量。

## 模型认证失败

```
# 检查认证状态
openclaw models status --probe

# 重新添加认证
openclaw models auth add
```

## 网关无法启动

```
# 检查端口占用
openclaw gateway status --deep

# 强制重启
openclaw gateway restart --force

# 查看详细日志
openclaw logs --follow
```

---

# 进阶使用技巧

## 1. 多代理架构

创建隔离的代理用于不同任务：

```
# 创建工作代理
openclaw agents add work-agent --workspace ~/work-agent
openclaw agents bind --agent work-agent --bind slack:work

# 创建个人代理
openclaw agents add personal-agent --workspace ~/personal-agent
openclaw agents bind --agent personal-agent --bind telegram:personal
```

## 2. 环境变量配置

自定义运行时路径：

```
export OPENCLAW_HOME="$HOME/.openclaw-custom"      # 主目录
export OPENCLAW_STATE_DIR="/var/openclaw"          # 可变状态
export OPENCLAW_CONFIG_PATH="/etc/openclaw.json"   # 配置文件
```

## 3. 开发模式

```
# 使用隔离的开发环境
openclaw --dev dashboard

# 使用自定义配置文件
openclaw --profile work dashboard
```

## 4. ACP 桥接（IDE 集成）

```
# 启动 ACP 桥接，连接 IDE 到网关
openclaw acp
```

---

# 更新与卸载

## 更新 OpenClaw

```
# 通过 npm
npm update -g openclaw

# 或通过安装脚本重新安装
curl -fsSL https://openclaw.ai/install.sh | bash
```

## 重置配置

```
# 重置配置（保留 CLI）
openclaw reset --scope config

# 完全重置（包括凭证和会话）
openclaw reset --scope full --yes
```

## 完全卸载

```
# 卸载服务和数据（保留 CLI）
openclaw uninstall --all --yes

# 然后手动删除全局安装
npm uninstall -g openclaw
```

---

# 总结

OpenClaw 是一个功能丰富的 AI 助手平台，主要特点包括：

- **多种安装方式**：安装脚本、npm、源码、Docker
- **多代理支持**：隔离的工作区和路由
- **丰富的技能生态**：浏览器自动化、搜索、语音等
- **跨平台消息**：WhatsApp、Telegram、Discord、Slack 等
- **移动设备集成**：iOS/Android 节点配对
- **定时任务**：Cron 表达式支持
- **浏览器自动化**：完整的网页操作能力

**快速开始命令：**

```
# 安装
curl -fsSL https://openclaw.ai/install.sh | bash

# 初始化
openclaw onboard --install-daemon

# 验证
openclaw doctor
openclaw status

# 打开控制面板
openclaw dashboard
```

---

**参考链接：**

- [OpenClaw 官方文档](https://docs.openclaw.ai)
- [ClawdHub 技能市场](https://clawhub.com)
- [GitHub 仓库](https://github.com/openclaw/openclaw)
- [Discord 社区](https://discord.gg/clawd)

---

*本文基于 OpenClaw 官方文档编写，最后更新于 2026-03-06*
