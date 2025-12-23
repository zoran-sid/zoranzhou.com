---
author: "Zoran"
title: "Minecraft 本地虚拟化联机进阶玩法"
date: "2025-12-23"
description: "虚拟化 Minecraft 联机控制面板及其内网穿透"
tags:
  - Technology
ShowToc: true
TocOpen: true
ShowWordCount: true
ShowReadingTime: true
ShowBreadCrumbs: true
ShowShareButtons: true
---

# 传统方案

网上常见的联机方案是买一台 VPS 服务器，用它的公网 IP 来做联机映射。这种方法操作起来最简单，但 VPS 的配置往往和预算挂钩，预算有限的话，性能很难跟上 **Minecraft** 的运行需求。

既然如此，我们能否借助本地电脑的算力，用内网映射的方式来提升游戏性能，让联机体验更丝滑？

接下来，我将使用  **VMware Workstation**  搭建一台本地的  **Minecraft**  服务器。



# 安装 Ubuntu 系统

在 VMware Workstation 上部署 Ubuntu 系统

![image-20251223184012710](https://e5d9f02.webp.fi/image-20251223184012710.png)

为了方便后续的内网传统，VM 选择桥接模式（该模式可以让虚拟机直接直连网卡，网卡通过有线网络连接路由器），最终实现的效果就是 Ubuntu 直连路由器。之后在 Ubuntu 图形化中修改 IP 地址与路由器同网段。

![image-20251223184828438](https://e5d9f02.webp.fi/image-20251223184828438.png)

之后在 Terminal 中安装控制面板套件：

```
sudo su -c "wget -qO- https://script.mcsmanager.com/setup_cn.sh | bash"

# 先启动面板守护进程。
# 这是用于进程控制，终端管理的服务进程。
systemctl start mcsm-daemon.service
# 再启动面板 Web 服务。
# 这是用来实现支持网页访问和用户管理的服务。
systemctl start mcsm-web.service

# 重启面板命令
systemctl restart mcsm-daemon.service
systemctl restart mcsm-web.service

# 停止面板命令
systemctl stop mcsm-web.service
systemctl stop mcsm-daemon.service
```

之后通过 `{IP}:23333` 访问控制面板，做初步配置。

![image-20251223190902081](https://e5d9f02.webp.fi/image-20251223190902081.png)

安装 Minecraft 所需的 JAVA JDK 21 环境

```
sudo apt install openjdk-21-jdk
java -version
```

![image-20251223192206195](https://e5d9f02.webp.fi/image-20251223192206195.png)



# NPS 服务端配置

VPS 防火墙请开启 80/443/8080/8024 端口，用于内网穿透映射

```
sudo ./nps install
The default configuration file of nps use 80，443，8080，8024 ports
80 and 443 ports for host mode default ports
8080 for web management access port
8024 for net bridge port, to communicate between server and client

配置conf/nps.conf
#web
web_username=xxx           //用户名
web_password=xxx           //密码
web_port = 8080         //默认8080端口登录
web_ip=0.0.0.0
```

NPS 开机自启

```
systemctl enable Nps
```

![image-20251223201913781](https://e5d9f02.webp.fi/image-20251223201913781.png)

防火墙端口开启，这里以阿里云为例：

![image-20251223201618757](https://e5d9f02.webp.fi/image-20251223201618757.png)

通过 {IP/域名}:8080 访问服务端控制面板，如下：

![image-20251223202018281](https://e5d9f02.webp.fi/image-20251223202018281.png)

创建客户端列表

![image-20251223202632165](https://e5d9f02.webp.fi/image-20251223202632165.png)

创建客户端隧道至 25565 端口（游戏默认25565端口，可按需修改）

**注：**记得放行 25565 端口防火墙规则

![image-20251223202859258](https://e5d9f02.webp.fi/image-20251223202859258.png)

配置 Server Port

```
Server port: 25565
Target:{127.0.0.1/内网IP地址}:25565  // 25565 公网端口映射到私网 25565 端口
```

![image-20251223203109753](https://e5d9f02.webp.fi/image-20251223203109753.png)

## VM Ubuntu NPS 客户端服务

安装 NPS Client ，按照 NPS Server 提示运行内网穿透配置

```
wget https://github.com/ehang-io/nps/releases/download/v0.26.10/linux_386_client.tar.gz
./npc -server={服务端IP/域名}:8024 -vkey={秘钥信息} -type=tcp
```

![image-20251223210352889](https://e5d9f02.webp.fi/image-20251223210352889.png)

Ubuntu Terminal 中运行，保持虚拟机后台运行！

![image-20251223210044136](https://e5d9f02.webp.fi/image-20251223210044136.png)



# Minecraft 服务端安装

访问内网 IP:23333，进入 Mincraft 服务器控制面板。创建新实例

```
启动命令
java -jar xxx.jar   //具体请根据服务端文件名称填写
```

![image-20251223203352299](https://e5d9f02.webp.fi/image-20251223203352299.png)

上传服务端文件：

这里以 paper server 1.20.4 为例：

**下载地址：**

```
https://fill-data.papermc.io/v1/objects/cabed3ae77cf55deba7c7d8722bc9cfd5e991201c211665f9265616d9fe5c77b/paper-1.20.4-499.jar
```

上传至服务器文件根目录内启动服务：

![image-20251223203548710](https://e5d9f02.webp.fi/image-20251223203548710.png)

按照要求同意通用协议：

**这里只需要在配置服务端配置文件中打开即可！**

![image-20251223203805442](https://e5d9f02.webp.fi/image-20251223203805442.png)



# 总结

最终通过 Minecraft 多人服务器即可联机！

虽然总体上比较复杂，但可以最大化解决服务器配置不足的问题，只需要按需调整公网带宽即可。常规 1M 公网带宽可以支持 2-3 人原生服务器游玩。

![image-20251223204230564](https://e5d9f02.webp.fi/image-20251223204230564.png)



# 参考链接

**以下链接为所需要用到的原始下载链接：**

```
https://github.com/ehang-io/nps
https://docs.mcsmanager.com/zh_cn/
https://papermc.io/downloads/paper
```