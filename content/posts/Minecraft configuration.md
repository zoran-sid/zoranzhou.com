---
author: "Zoran"
title: "Minecraft 服务器调参指南"
date: "2025-12-23"
description: "优化 Minecraft 服务器性能"
tags:
  - Technology
ShowToc: true
TocOpen: true
ShowWordCount: true
ShowReadingTime: true
ShowBreadCrumbs: true
ShowShareButtons: true
---



# 服务器常见列表

## server.properties

| 属性                              | 类型                 | 默认值             | 描述                                                         |
| :-------------------------------- | :------------------- | :----------------- | :----------------------------------------------------------- |
| allow-flight                      | 布尔值               | false              | 允许玩家在安装添加飞行功能的mod前提下在生存模式下飞行。 允许飞行可能会使恶意破坏者更加常见，因为此设定会使他们更容易达成目的。在创造模式下无作用。 |
| allow-nether                      | 布尔值               | true               | 允许玩家进入下界。                                           |
| broadcast-console-to-ops          | 布尔值               | true               | 向所有在线OP发送所执行命令的输出。                           |
| broadcast-rcon-to-ops             | 布尔值               | true               | 向所有在线OP发送通过RCON执行的命令的输出。                   |
| difficulty                        | 字符串               | easy               | 定义服务器的游戏难度（例如生物对玩家造成的伤害，饥饿和中毒对玩家的影响方式等）。 |
| enable-command-block              | 布尔值               | false              | 是否启用命令方块。                                           |
| enable-jmx-monitoring             | 布尔值               | false              | 用于暴露以毫秒为单位的tick时间。 为了启用JRE的JMX，你需要添加在此处所述的一些JVM标志。 |
| enable-query                      | 布尔值               | false              | 允许使用GameSpy4协议的服务器监听器。用于获取服务器信息。     |
| enable-rcon                       | 布尔值               | false              | 是否允许远程访问服务器控制台。                               |
| enable-status                     | 布尔值               | true               | 使服务器在服务器列表中看起来是“在线”的。                     |
| enforce-secure-profile            | 布尔值               | true               | 要求玩家必须具有Mojang签名的公钥才能进入服务器。             |
| enforce-whitelist                 | 布尔值               | false              | 在服务器上强制执行白名单。 当启用后，不在白名单（前提是启用）中的用户将在服务器重新加载白名单文件后从服务器踢出。 |
| entity-broadcast-range-percentage | 整数（10-1000）      | 100                | 此选项控制实体需要距离玩家有多近才会将数据包发送给客户端。   |
| force-gamemode                    | 布尔值               | false              | 强制玩家加入时为默认游戏模式。                               |
| function-permission-level         | 整数（1-4）          | 2                  | 设定函数的默认权限等级。 4个等级的详情见 #op-permission-level。 |
| gamemode                          | 字符串               | survival           | 定义默认游戏模式。                                           |
| generate-structures               | 布尔值               | true               | 定义是否能生成结构（例如村庄）。                             |
| generator-settings                | 字符串               |                    | 本属性质用于自定义世界的生成。详见超平坦世界和自定义了解正确的设定及例子。 |
| hardcore                          | 布尔值               | false              | 如果设为 true，服务器难度的设置会被忽略并且设为hard（困难），玩家在死后会自动切换至旁观模式。 |
| hide-online-players               | 布尔值               | false              | 如果设为 true，服务端在响应客户端状态请求时不会返回在线玩家列表。 |
| initial-disabled-packs            | 字符串               | 空白               | 需要在创建世界过程中禁用的数据包名称，以逗号分隔。           |
| initial-enabled-packs             | 字符串               | vanilla            | 需要在创建世界过程中启用的数据包名称，以逗号分隔。特别地，功能数据包必须在此指定才能生效。 |
| level-name                        | 字符串               | world              | “level-name”的值将作为世界名称及其文件夹名。                 |
| level-seed                        | 字符串               | 空白               | 与单人游戏类似，为你的世界定义一个种子。                     |
| level-type                        | 字符串               | minecraft:normal   | 使用世界预设ID，确定地图所生成的类型。                       |
| log-ips                           | 布尔值               | true               | 是否在有新玩家加入游戏时，在服务器日志中记录其IP地址。       |
| max-build-height                  | 整数                 | 256                | 玩家在游戏中能够建造的最大高度。可能会在该值较小时生成超过该值的地形。 |
| max-chained-neighbor-updates      | 整数                 | 1000000            | 限制连锁NC更新的数量，超过此数量的连锁NC更新会被跳过。若为负数则无限制。 |
| max-players                       | 整数（0-2147483647） | 20                 | 服务器同时能容纳的最大玩家数量。请注意，在线玩家越多，对服务器造成的负担也就越大。 |
| max-tick-time                     | 整数（0–(2^63 - 1)） | 60000              | 设置每个tick花费的最大毫秒数。超过该毫秒数时，服务器watchdog插件将停止服务器程序并附带上信息： |
| max-world-size                    | 整数（1-29999984）   | 29999984           | 设置可让世界边界获得的最大半径值，单位为方块。通过成功执行的命令能把世界边界设置得更大，但不会超过这里设置的最大方块限制。 |
| motd                              | 字符串               | A Minecraft Server | 本属性值是玩家客户端的多人游戏服务器列表中显示的服务器信息，显示于名称下方。 |
| network-compression-threshold     | 整数                 | 256                | 默认会允许n-1字节的数据包正常发送, 如果数据包为n字节或更大时会进行压缩。所以，更低的数值会使得更多的数据包被压缩，但是如果被压缩的数据包字节太小将反而使压缩后字节更大。 -1 - 完全禁用数据包压缩 0 - 压缩全部数据包 注：以太网规范要求把小于64字节的数据包填充为64字节。因此，设置一个低于64的值可能没有什么好处。也不推荐让设置的值超过MTU（通常为1500字节）。 |
| online-mode                       | 布尔值               | true               | 是否让服务器对比Minecraft账户数据库验证登录信息。            |
| op-permission-level               | 整数（1-4）          | 4                  | 设定使用/op命令时OP的权限等级。所有存档会从之前的存档继承能力和命令。 1 - OP可以绕过重生点保护。 2 - OP可以使用所有单人游戏作弊命令（除了/publish，因为不能在服务器上使用；/debug也是）并使用命令方块。命令方块和领域服服主/管理员有此等级权限。 3 - OP可以使用大多数多人游戏中独有的命令，包括 /debug，以及管理玩家的命令（/ban，/op等等）。 4 - OP可以使用所有命令，包括 /stop, /save-all, /save-on 和 /save-off。 |
| player-idle-timeout               | 整数                 | 0                  | 如果不为0，服务器将在玩家的空闲时间达到设置的时间（单位为分钟）时将玩家踢出服务器 注：当服务器接受到下列数据包之一时将会重置空闲时间：点击窗口附魔物品更新告示牌 玩家挖掘方块玩家放置方块 更换拿着的物品 动画（挥动手臂） 实体动作客户端状态聊天信息 使用实体 |
| prevent-proxy-connections         | 布尔值               | false              | 如果服务器发送的ISP/AS和Mojang的验证服务器的不一样，玩家将会被踢出。 |
| pvp                               | 布尔值               | true               | 是否允许PvP。也只有在允许PvP时玩家自己的箭才会受到伤害。     |
| query.port                        | 整数（1-65534）      | 25565              | 设置监听服务器的端口号（参见 enable-query）。                |
| rate-limit                        | 整数                 | 0                  | 设置玩家被踢出服务器前，可以发送的数据包数量。 设置为0表示关闭此功能。 |
| rcon.password                     | 字符串               | 空白               | 设置RCON远程访问的密码（参见enable-rcon）。                  |
| rcon.port                         | 整数（1-65534)       | 25575              | 设置RCON远程访问的端口号。                                   |
| require-resource-pack             | 布尔值               | false              | 当此选项启用（设为true）时，玩家会被提示作出选择（是否启用服务器资源包）。如果玩家拒绝则会被服务器断开连接。 但是，若玩家使用Linux系统加入服务器，游戏目录内的server-resource-packs没有写权限，则会提示“无法应用服务器资源包”“所有依赖自定义资源包的功能都有可能不按预期工作”，并提示玩家“继续”或“断开连接”。若玩家选择“继续”，则仍可在此服务器中游戏。 |
| resource-pack                     | 字符串               | 空白               | 可选选项，可输入指向一个资源包的URI。                        |
| resource-pack-prompt              | 字符串               | 空白               | 可选，用于在使用require-resource-pack时在资源包提示界面显示自定义信息。 与聊天组件语法一致，可以包含多行文本。 |
| resource-pack-sha1                | 字符串               | 空白               | 资源包的SHA-1值，必须为小写十六进制，建议填写它。这还没有用于验证资源包的完整性，但是它提高了资源包缓存的有效性和可靠性。 |
| server-ip                         | 字符串               | 空白               | 将服务器与一个特定IP绑定。                                   |
| server-port                       | 整数（1-65534）      | 25565              | 改变服务器（监听的）端口号。                                 |
| simulation-distance               | 整数（3-32）         | 10                 | 设置服务端可更新实体范围的最大值，即玩家各个方向上的区块数量（是以玩家为中心的半径，不是直径）。 |
| spawn-animals                     | 布尔值               | true               | 决定动物是否可以生成。                                       |
| spawn-monsters                    | 布尔值               | true               | 决定攻击型生物（怪物）是否可以生成。                         |
| spawn-npcs                        | 布尔值               | true               | 决定是否生成村民。 true - 启用。生成村民。 false - 禁用。不生成村民。 |
| spawn-protection                  | 整数                 | 16                 | 通过将该值进行2x+1的运算来决定出生点的保护半径。设置为1会保护以出生点为中心的3×3方块的区域，2会保护5×5方块的区域，3会保护7×7方块的区域。 |
| sync-chunk-writes                 | 布尔值               | true               | 启用后区块文件以同步模式写入。                               |
| text-filtering-config             | 字符串               | 空白               | 服务器中需要被屏蔽的文本。                                   |
| use-native-transport              | 布尔值               | true               | 是否使用针对Linux平台的数据包收发优化。此选项仅会在Linux平台上生成。 |
| view-distance                     | 整数（3-32）         | 10                 | 设置服务端发送给客户端的世界数据量，也就是设置玩家各个方向上的区块数量（是以玩家为中心的半径，不是直径）。 |
| white-list                        | 布尔值               | false              | 启用服务器的白名单。                                         |



# 服务器滞后指标 

## TPS

TPS：TickPerSecond。它也是服务器所有者可以直接控制唯一项目，下述指南专门用于提高 TPS。 服务器以 20 TPS 的速率处理所有任务。诸如怪物移动、作物生长和玩家与块的交互等任务需要由服务器Ticks才能正常运行。TPS 低于 20 意味着服务器运行滞后，必须跳过任务才能按时执行重要任务。

**20.0** = 无卡顿

**19.95 - 19.99** = 几乎无卡顿

**18.5 - 19.94** = 一般。可能有一些卡顿，但对游戏无明显影响。

**16.0 - 18.4** = 差。



# 优化推荐

**simulation-distance**：模拟距离是服务器将在玩家周围互动的距离。

- 推荐值: 4-8 
- 性能影响: 中

**view-distance**：渲染距离。

- 默认值: 10
- 推荐值: 4-8
- 性能影响: 重

**network-compression-threshold**：服务器尝试压缩之前限制数据包的大小。

- 默认值：256
- 推荐值：64-128（过小容易造成过大的服务器 CPU 负担）

