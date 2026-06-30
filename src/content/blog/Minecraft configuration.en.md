---
author: "Zoran"
title: "Minecraft Server Tuning Guide"
date: "2025-12-23"
description: "Optimizing Minecraft server performance"
tags:
  - Technology
  - Gaming
  - Minecraft
ShowToc: true
TocOpen: true
ShowWordCount: true
ShowReadingTime: true
ShowBreadCrumbs: true
ShowShareButtons: true
lang: en
translationKey: minecraft-configuration
slug: minecraft-configuration-en
---

# Common Server Configuration

## server.properties

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| allow-flight | boolean | false | Allows players to fly in survival mode with flight-enabling mods. May make griefing easier. No effect in creative mode. |
| allow-nether | boolean | true | Allows players to enter the Nether. |
| broadcast-console-to-ops | boolean | true | Sends command output to all online OPs. |
| broadcast-rcon-to-ops | boolean | true | Sends RCON command output to all online OPs. |
| difficulty | string | easy | Defines the server difficulty (damage, hunger, poison effects, etc.). Values: peaceful, easy, normal, hard. |
| enable-command-block | boolean | false | Enables command blocks. |

### Key Performance Settings

**view-distance** (default: 10)
Reducing this significantly improves performance. Recommended: 6–8 for survival servers.

**simulation-distance** (default: 10)
Controls the range at which entities are ticked. Lower values reduce CPU load. Recommended: 6–8.

**max-players** (default: 20)
Set to your actual expected player count. Higher values consume more RAM.

**network-compression-threshold** (default: 256)
Packets larger than this size (in bytes) will be compressed. Lower values increase CPU usage but reduce bandwidth.

---

## JVM Tuning (Java Virtual Machine)

### Recommended JVM Flags

For Paper/Spigot servers, use Aikar's flags:

```bash
java -Xms4G -Xmx4G -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1HeapRegionSize=8M -XX:G1ReservePercent=20 -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 -XX:InitiatingHeapOccupancyPercent=15 -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32 -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1 -jar server.jar nogui
```

### Memory Allocation

| Player Count | Recommended RAM |
| :--- | :--- |
| 1–5 | 2 GB |
| 5–15 | 4 GB |
| 15–30 | 6–8 GB |
| 30+ | 8–16 GB |

> ⚠️ Do NOT allocate more than 12 GB for vanilla servers — the G1GC garbage collector becomes inefficient beyond this.

---

## Server Software Comparison

| Software | Performance | Plugin Support | Best For |
| :--- | :--- | :--- | :--- |
| **Vanilla** | Baseline | None | Pure survival |
| **Spigot** | Better | Bukkit plugins | Small servers |
| **Paper** | Excellent | Bukkit + Paper plugins | Most servers |
| **Purpur** | Best | All Paper plugins + extras | Performance-focused |
| **Fabric** | Excellent | Fabric mods | Modded servers |

### Recommended: Paper

Paper is the gold standard for most Minecraft servers. It patches dozens of performance issues in Vanilla/Spigot while maintaining full plugin compatibility.

### Purpur for Extra Performance

Purpur builds on Paper with additional optimizations:
- Configurable entity activation ranges
- Ridiculous game mechanic patches
- Async chunk loading options

---

## Entity & Chunk Optimization

### Reduce Entity Count

In `bukkit.yml`:
```yaml
spawn-limits:
  monsters: 50
  animals: 8
  water-animals: 3
  water-ambient: 3
  ambient: 2
```

### Chunk Garbage Collection

In `paper.yml`:
```yaml
chunk-system:
  auto-save-interval: 6000  # 5 minutes in ticks
  gen-parallelism: 2
  io-threads: 2
  worker-threads: 2
```

### No-Tick View Distance

Paper supports a separate "no-tick" view distance that sends chunks to clients without ticking entities, reducing CPU while keeping visuals:

```yaml
view-distance: 8
simulation-distance: 6
```

---

## Monitoring Tools

### Spark Profiler

Install [Spark](https://spark.lucko.me/) for real-time performance profiling:

```bash
/spark profiler start
/spark profiler stop
```

### Timings Report

Paper's built-in timings system:

```bash
/timings on
/timings paste
```

---

## Summary

| Optimization | Impact | Difficulty |
| :--- | :--- | :--- |
| Switch to Paper/Purpur | 🔴 High | Easy |
| Aikar's JVM flags | 🔴 High | Easy |
| Reduce view distance | 🟡 Medium | Easy |
| Lower entity spawn limits | 🟡 Medium | Easy |
| Pre-generate world | 🔴 High | Medium |
| Use Spark profiling | 🟢 Situational | Medium |
