---
author: "Zoran"
title: "自用 OPENWRT 编译流程分享"
date: "2025-6-20"
description: "Ubuntu 虚拟机本地编译 Openwrt 系统"
tags:
  - Technology
ShowToc: true
TocOpen: true
ShowWordCount: true
ShowReadingTime: true
ShowBreadCrumbs: true
ShowShareButtons: true
---

# OpenWrt编译

## 前提条件

1. Vmware Workstation 或者同类产品的虚拟化软件
2. 已经安装好的Ubuntu 64bit 系统

**警告：不要使用 root 用户去编译！**

```
sudo apt-get update
sudo apt-get -y install build-essential asciidoc binutils bzip2 gawk gettext git libncurses5-dev libz-dev patch python3 unzip zlib1g-dev lib32gcc1 libc6-dev-i386 subversion flex uglifyjs git-core gcc-multilib p7zip p7zip-full msmtp libssl-dev texinfo libglib2.0-dev xmlto qemu-utils upx libelf-dev autoconf automake libtool autopoint device-tree-compiler g++-multilib antlr3 gperf wget curl swig rsync  //编译预配环境
```



## 克隆 Lede 仓库

```
git clone https://github.com/coolsnowwolf/lede 
cd lede   //进入克隆好的仓库
```

编辑 feeds.conf.default

```
按照这个库去填，包含科学上网插件等等
src-git kenzo https://github.com/kenzok8/openwrt-packages
src-git small https://github.com/kenzok8/small
src-git packages https://github.com/coolsnowwolf/packages
src-git luci https://github.com/coolsnowwolf/luci
src-git routing https://github.com/coolsnowwolf/routing
src-git telephony https://github.com/openwrt/telephony.git;openwrt-23.05
```

## 编译

更新插件库，开始编译

```
./scripts/feeds update -a
./scripts/feeds install -a
make menuconfig
```

![image-20251209233905105](https://e5d9f02.webp.fi/image-20251209233905105.png)

`Target System` : 选择系统架构，这里默认 x86 平台

`Target Images` ：

```
ext4：小型 Linux，适合装软件，需要大空间，软路由/NAS 场景推荐。
Squashfs：系统不可直接写入，只能通过 overlay 存储配置和数据，适合跑在嵌入式、小闪存设备（刷机+恢复出厂设置玩法。
combined：boot 分区和 rootfs 合成在一起。刷在硬盘或者 U 盘可以直接启动。 x86架构装机默认推荐此版本，适合 SSD 启动。
generic：通用固件（非特定硬件化优化），适合搭配不同文件系统。
```

推荐选择方案：

![image-20251209234838229](https://e5d9f02.webp.fi/image-20251209234838229.png)

重要科学上网插件库路径：

```
LUCI/Applications/luci-app-xxx   //按需选择
第一次编译不推荐选择过多，建议删除非必要插件，提高编译成功率
```

```
编译清单
LuCI ---> Applications ---> luci-app-accesscontrol  #访问时间控制
LuCI ---> Applications ---> luci-app-acme  #ACME自动化证书管理环境（丢弃）
LuCI ---> Applications ---> luci-app-adblock   #ADB广告过滤
...（略）

来自：https://www.right.com.cn/forum/thread-344825-1-1.html
```

下载编译所需要的文件

```
make -j8 download V=s   // 8 代表八线程
make -j1 V=s   //编译，第一次推荐使用一线程，方便检查报错信息，如果报错请删除报错的插件
```

![image-20251209235924990](https://e5d9f02.webp.fi/image-20251209235924990.png)

编译结束后在此文件夹中可见导出文件：

```
/lede/bin/target/x86/64/
```

![image-20251210000129216](https://e5d9f02.webp.fi/image-20251210000129216.png)

### 二次编译：

```
./scripts/feeds update -a && ./scripts/feeds install -a             # 更新Feeds
rm -rf ./tmp && rm -rf .config                                      # 清除编译配置和缓存
make menuconfig                                                      # 进入编译配置菜单
make -j8 download
make -j$(($(nproc) + 1)) V=s
```

### 更改配置编译

```
cd lede
rm -rf ./tmp && rm -rf .config
make menuconfig
make -j$(($(nproc) + 1)) V=s
```

### 更改 LAN 口默认 IP 地址

```
cd lede
vim package/base-files/files/bin/config_generate
```

**默认密码**：password
