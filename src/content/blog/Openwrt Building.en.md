---
author: "Zoran"
title: "My OpenWrt Custom Build Workflow"
date: "2025-06-20"
description: "Building a custom OpenWrt system on an Ubuntu virtual machine"
tags:
  - Technology
  - Networking
  - OpenWrt
  - Linux
ShowToc: true
TocOpen: true
ShowWordCount: true
ShowReadingTime: true
ShowBreadCrumbs: true
ShowShareButtons: true
lang: en
translationKey: openwrt-building
slug: openwrt-building-en
---

# Building OpenWrt from Source

## Prerequisites

Before starting, ensure your build environment meets these requirements:

**OS:** Ubuntu 22.04 LTS (or Debian 11+)
**Disk:** At least 30 GB free
**RAM:** At least 4 GB
**Network:** Stable internet connection

### Install Build Dependencies

```bash
sudo apt update
sudo apt install -y build-essential clang flex bison g++ gawk \
  gcc-multilib g++-multilib gettext git libncurses-dev \
  libssl-dev python3-distutils rsync unzip zlib1g-dev \
  file wget python3 python3-pip
```

---

## Setting Up the Build Environment

### Clone OpenWrt Source

```bash
git clone https://github.com/openwrt/openwrt.git
cd openwrt
git checkout v23.05.4  # Use a stable release
```

### Update and Install Feeds

Feeds are package repositories that provide additional software:

```bash
./scripts/feeds update -a
./scripts/feeds install -a
```

---

## Configuration

### Launch Menuconfig

```bash
make menuconfig
```

### Essential Settings

**Target System:**
- Select your router's architecture (e.g., `x86/64` for x86 devices, or `MediaTek Ralink ARM` for specific routers)

**Target Profile:**
- Choose your specific device model

**LuCI (Web Interface):**
- `LuCI` → `Collections` → `luci`
- `LuCI` → `Applications` → `luci-app-upnp` (optional)

**Essential Packages:**
- `Network` → `SSH` → `openssh-sftp-server`
- `Network` → `VPN` → `wireguard-tools` (if needed)
- `Utilities` → `htop`
- `Utilities` → `bash`

**Language Support:**
- `LuCI` → `Modules` → `luci-i18n-base-zh-cn` (Chinese UI)
- Or `luci-i18n-base-en` (English UI)

---

## Custom Package Modifications

### Adding Custom Packages

Place custom package sources in the `package/` directory:

```bash
mkdir -p package/custom/myapp
```

Create `package/custom/myapp/Makefile`:

```makefile
include $(TOPDIR)/rules.mk

PKG_NAME:=myapp
PKG_VERSION:=1.0
PKG_RELEASE:=1

include $(INCLUDE_DIR)/package.mk

define Package/myapp
  SECTION:=custom
  CATEGORY:=Custom
  TITLE:=My Custom Application
  DEPENDS:=+libc
endef

define Package/myapp/description
  A custom application for my router.
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
endef

define Build/Compile
	# Compilation steps here
endef

define Package/myapp/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/myapp $(1)/usr/bin/
endef

$(eval $(call BuildPackage,myapp))
```

---

## Building

### Start the Build

```bash
make -j$(nproc) V=s
```

- `-j$(nproc)`: Uses all CPU cores for parallel compilation
- `V=s`: Verbose output (useful for debugging)

### Common Build Issues

| Issue | Solution |
| :--- | :--- |
| Out of disk space | `make clean` and try again with fewer packages |
| Download failures | Use a proxy or VPN; check `dl/` directory |
| Compilation errors | Run `make package/NAME/compile V=s` to isolate |
| Kernel panic in VM | Increase VM RAM to at least 4 GB |

### Build Output

Successful builds produce firmware images in `bin/targets/`:

```
bin/targets/x86/64/
├── openwrt-x86-64-generic-ext4-combined.img.gz
├── openwrt-x86-64-generic-squashfs-combined.img.gz
├── packages/
└── profiles.json
```

---

## Flashing the Firmware

### x86 Devices

Write the image directly:
```bash
dd if=openwrt-x86-64-generic-squashfs-combined.img of=/dev/sdX bs=4M
```

### Router Devices

Use the web interface or TFTP method specific to your device.

---

## Post-Installation

1. Connect to `192.168.1.1` via browser
2. Set root password
3. Configure WAN interface (DHCP or PPPoE)
4. Set up WiFi (if applicable)
5. Install additional packages via LuCI or `opkg`

---

## Conclusion

Building OpenWrt from source gives you:

✅ Complete control over included packages  
✅ Custom optimizations for your specific hardware  
✅ No bloatware — only what you need  
✅ Latest security patches  
✅ Deep understanding of your router's firmware  

The process takes 1–3 hours for the first build but can be fully automated with scripts for future updates.
