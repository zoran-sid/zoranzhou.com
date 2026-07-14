---
title: "Why a valid webhook signature is not enough"
description: "A theoretical security analysis of the gap between authentic webhook delivery and unique business processing."
date: 2026-07-15
tags: ["webhook", "HMAC", "replay", "idempotency"]
lang: en
translationKey: "lab-security-webhook-replay"
slug: "webhook-replay-analysis-en"
type: security
track: product-security
status: planned
verificationStatus: theoretical
project: testnet-wallet-platform
technologies: ["Webhook", "HMAC", "Idempotency"]
securityLevel: educational
testnetOnly: true
audited: false
realFunds: false
featured: true
currentPhase: "Threat-model definition"
implementedFeatures: []
knownLimitations:
  - "The scenario has not been reproduced against an implementation."
  - "No provider-specific signing format has been selected."
  - "No regression test exists yet."
draft: false
---

## Classification

**Theoretical analysis — not implementation-tested.** This page records a security hypothesis and a future test plan. It is not evidence of a discovered or fixed vulnerability.

## Background

An HMAC signature can demonstrate that a webhook body was produced by a party holding the shared secret and was not modified after signing. That property does not, by itself, establish that the event is fresh or that the business action has not already been applied.

## Normal workflow

1. A provider signs an event payload.
2. The receiver validates the signature.
3. The receiver maps the event to a business action.
4. The action updates local state.

## Threat

An attacker or faulty delivery system may resend a previously valid request. If the receiver checks only the signature, the same authentic event can reach the business handler more than once.

## Preconditions

- A valid signed request can be captured or redelivered.
- The receiver accepts old timestamps or has no freshness check.
- The event has no durable uniqueness constraint, or duplicate handling is not atomic with the business update.

## Potential impact

The impact depends on the downstream workflow. Possible outcomes include duplicate ledger entries, repeated notifications, inconsistent transaction state, or a duplicated withdrawal request. None of these outcomes has been reproduced in the planned platform.

## Planned control design

- Verify the signature against the exact raw request body.
- Enforce a bounded timestamp window where the provider format supports it.
- Persist a provider event identifier behind a uniqueness constraint.
- Apply the uniqueness decision and business update in one transaction boundary.
- Return a stable success response for an already-processed event.

## Regression test plan

The future test should submit the same valid signed event twice and verify that only one business transition occurs. It should also cover expired timestamps, changed bodies, concurrent duplicate delivery, and recovery after a partial failure.

## Limitations

The final design depends on the selected provider's canonicalization, timestamp, retry, and event-identifier contracts. No control on this page is currently labeled implemented, tested, or verified.
