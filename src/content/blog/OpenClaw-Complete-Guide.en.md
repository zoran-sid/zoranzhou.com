---
author: "Zoran"
title: "OpenClaw Complete Installation Guide & Command Reference"
date: "2026-03-05"
description: "A complete installation guide for the OpenClaw AI assistant based on official documentation, covering multiple installation methods, configuration details, and common commands"
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
lang: en
translationKey: openclaw-complete-guide
slug: openclaw-complete-guide-en
---

# OpenClaw: Complete Installation Guide & Command Reference

OpenClaw is an open-source AI assistant framework that connects language models to messaging platforms. This guide covers everything from installation to daily usage.

---

## Installation Methods

### Method 1: Docker (Recommended)

```bash
docker pull ghcr.io/openclaw/openclaw:latest
docker run -d \
  --name openclaw \
  -v $PWD/config:/app/config \
  -v $PWD/data:/app/data \
  ghcr.io/openclaw/openclaw:latest
```

### Method 2: NPM

```bash
npm install -g openclaw
openclaw init
openclaw start
```

### Method 3: From Source

```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
npm install
npm run build
npm start
```

---

## Configuration

OpenClaw uses a YAML configuration file. Here's a minimal setup:

```yaml
# config.yaml
bot:
  name: "MyBot"
  platform: "wechat"  # or discord, telegram, slack
  
llm:
  provider: "openai"  # or anthropic, local
  model: "gpt-4"
  apiKey: "${OPENAI_API_KEY}"

plugins:
  - name: "web-search"
  - name: "code-interpreter"
```

### Environment Variables

| Variable | Description |
| :--- | :--- |
| `OPENAI_API_KEY` | OpenAI API key |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `BOT_TOKEN` | Platform bot token |

---

## Supported Platforms

| Platform | Status | Notes |
| :--- | :--- | :--- |
| WeChat | ✅ Supported | Via official API |
| Discord | ✅ Supported | Bot API |
| Telegram | ✅ Supported | Bot API |
| Slack | ✅ Supported | Bot API |
| WhatsApp | 🚧 Beta | Via third-party bridge |

---

## Plugin System

### Built-in Plugins

| Plugin | Function |
| :--- | :--- |
| `web-search` | Web search via DuckDuckGo/Google |
| `code-interpreter` | Execute Python/JavaScript code |
| `file-manager` | Read/write files |
| `memory` | Long-term conversation memory |
| `image-gen` | Image generation via DALL-E/Stable Diffusion |

### Installing Community Plugins

```bash
openclaw plugin install @openclaw/plugin-translator
openclaw plugin install @openclaw/plugin-calendar
```

---

## Common Commands

### Service Management

```bash
# Start in foreground
openclaw start

# Start as daemon
openclaw start -d

# Stop
openclaw stop

# Restart
openclaw restart

# View logs
openclaw logs -f

# Check status
openclaw status
```

### Configuration

```bash
# Validate config
openclaw config validate

# Show current config
openclaw config show

# Reload config (hot reload)
openclaw config reload
```

### Plugin Management

```bash
# List installed plugins
openclaw plugin list

# Install
openclaw plugin install <name>

# Update all
openclaw plugin update

# Remove
openclaw plugin remove <name>
```

---

## LLM Provider Setup

### OpenAI

```yaml
llm:
  provider: "openai"
  model: "gpt-4"
  apiKey: "${OPENAI_API_KEY}"
  options:
    temperature: 0.7
    maxTokens: 4096
```

### Anthropic Claude

```yaml
llm:
  provider: "anthropic"
  model: "claude-3-opus-20240229"
  apiKey: "${ANTHROPIC_API_KEY}"
```

### Local LLM (Ollama)

```yaml
llm:
  provider: "ollama"
  model: "llama3:70b"
  baseUrl: "http://localhost:11434"
```

---

## Troubleshooting

### Bot not responding
1. Check `openclaw logs` for errors
2. Verify platform bot token is correct
3. Confirm LLM API key is valid and has credits

### Rate limiting
Add rate limiting to config:
```yaml
rateLimit:
  maxRequests: 60
  perMinutes: 1
```

### Memory issues
Reduce context window or enable message pruning:
```yaml
llm:
  options:
    maxContextMessages: 50
```

---

## Summary

OpenClaw provides a unified framework for running AI assistants across multiple messaging platforms. Key strengths:

✅ Multi-platform support from a single codebase  
✅ Extensive plugin ecosystem  
✅ Flexible LLM backend (OpenAI, Anthropic, local models)  
✅ Hot-reload configuration  
✅ Docker support for easy deployment
