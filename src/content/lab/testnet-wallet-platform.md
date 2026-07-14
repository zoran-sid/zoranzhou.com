---
title: "测试网数字资产钱包平台"
description: "一个计划中的教育型平台，用于记录测试网上的钱包 API、交易生命周期、后端一致性与产品安全决策。"
date: 2026-07-15
tags: ["钱包", "后端", "安全", "测试网"]
lang: zh-CN
translationKey: "lab-build-testnet-wallet-platform"
type: build
track: backend
status: planned
verificationStatus: unverified
project: testnet-wallet-platform
technologies: ["TypeScript", "NestJS", "PostgreSQL", "Ethereum 测试网"]
securityLevel: educational
testnetOnly: true
audited: false
realFunds: false
featured: true
currentPhase: "范围定义"
implementedFeatures: []
knownLimitations:
  - "目前还没有应用实现。"
  - "尚未验证钱包、RPC、托管服务或数据库集成。"
  - "目前没有安全测试结果或生产就绪声明。"
draft: false
---

## 概览

本条目用于定义一个未来教育型钱包平台原型的预期范围。它是一份规划记录，而不是产品演示。目前不声称存在应用代码、通过的测试、链上活动或生产能力。

> **当前边界：** 计划中、教育用途、仅限测试网、未经审计，并且不使用真实资金。

## 问题

数字资产产品需要协调两种不同的状态：区块链状态与业务状态。一笔交易可能已经被 RPC 服务接受，但产品流程仍然可能未完成、被重复处理、延迟或未经授权。

计划中的原型将探索后端如何明确这些边界，同时避免把简化演示描述为生产基础设施。

## 计划范围

- 用户与钱包 API 边界
- 测试网上的 Ethereum 交易检查
- ERC-20 事件监控
- 提现状态机设计
- Webhook 签名与重放防护
- JWT 授权与角色边界
- 幂等、重试与恢复行为
- PostgreSQL 事务边界与审计日志

以上每一项都是目标，而不是已实现功能。

## 架构基线

第一份架构记录将拆分 API 处理、钱包编排、安全策略、持久化、供应商集成与区块链观察。在实现被标记为原型之前，会先记录信任边界与失败路径。

## 安全设计目标

最初的安全工作将聚焦授权、重复提现、目标地址绑定、Webhook 重放、敏感日志与回归测试证据。只有存在复现与回归测试后，控制措施才会标记为已修复或已验证。

## 已知限制

项目目前没有代码仓库链接、运行中的服务、外部 API 集成、测试报告或审计。页面上的技术名称仅表示候选技术栈。

## 下一验证门槛

下一次公开状态变更需要具备最小可运行的本地服务、已记录的交易状态模型，以及可以从检入证据中复现的测试。
