---
title: "为什么有效的 Webhook 签名仍然不够"
description: "关于 Webhook 真实来源与业务唯一处理之间差距的理论安全分析。"
date: 2026-07-15
tags: ["Webhook", "HMAC", "重放", "幂等"]
lang: zh-CN
translationKey: "lab-security-webhook-replay"
type: security
track: product-security
status: planned
verificationStatus: theoretical
project: testnet-wallet-platform
technologies: ["Webhook", "HMAC", "幂等性"]
securityLevel: educational
testnetOnly: true
audited: false
realFunds: false
featured: true
currentPhase: "威胁模型定义"
implementedFeatures: []
knownLimitations:
  - "该场景尚未针对实际实现进行复现。"
  - "尚未选择具体供应商的签名格式。"
  - "目前没有回归测试。"
draft: false
---

## 分类

**理论分析——尚未通过实现测试。** 本页记录一个安全假设与未来测试计划，不代表已经发现或修复了漏洞。

## 背景

HMAC 签名可以证明 Webhook 请求体来自持有共享密钥的一方，并且在签名后没有被修改。但这一性质本身不能证明事件是新鲜的，也不能证明对应的业务动作尚未执行。

## 正常流程

1. 供应商对事件载荷进行签名。
2. 接收方验证签名。
3. 接收方把事件映射到业务动作。
4. 业务动作更新本地状态。

## 威胁

攻击者或异常的投递系统可能重新发送一个过去有效的请求。如果接收方只检查签名，同一个真实事件就可能多次进入业务处理器。

## 攻击前提

- 有效签名请求可以被捕获或重新投递。
- 接收方接受过期时间戳，或没有新鲜度检查。
- 事件缺少持久化唯一约束，或重复判断与业务更新不在同一个原子事务内。

## 潜在影响

影响取决于下游流程，可能包括重复账本记录、重复通知、交易状态不一致或重复提现请求。以上结果目前都没有在计划中的平台上复现。

## 计划中的控制设计

- 使用原始请求体逐字节验证签名。
- 在供应商格式支持时限制时间戳有效窗口。
- 通过唯一约束持久化供应商事件标识。
- 在同一事务边界内完成唯一性判断与业务更新。
- 对已经处理过的事件返回稳定的成功响应。

## 回归测试计划

未来测试应两次提交同一个有效签名事件，并验证业务状态只发生一次迁移。测试还应覆盖过期时间戳、被修改的请求体、并发重复投递，以及部分失败后的恢复。

## 限制

最终设计取决于所选供应商的规范化、时间戳、重试与事件标识约定。本页目前没有任何控制措施被标记为已实现、已测试或已验证。
