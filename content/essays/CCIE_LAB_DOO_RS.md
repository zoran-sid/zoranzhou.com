# 1.1 Introduce



# 1.2 配置VLANs



## **SW110**

二侧的客户端接口Access， vlan 2000和vlan 2001

```
SW110：
 interface Ethernet 0/0
  switchport mode access
  switchport access vlan 2000
  
  interface Ethernet 0/1
  switchport mode access
  switchport access vlan 2001
```



## **SW610**

添加Vlan200，

上行的二个端口均添加Trunk vlan add 2001的支持

SW610二侧的客户端一边是vlan2000，另一侧2001

```
SW610:
Vlan 2000
 interface range Ethernet 2/0-1
 switchport mode trunk
 switchport trunk encapsulation dot1q
 switchport trunk allowed vlan add 2001
 
 interface Ethernet 0/0
 switchport mode access
 switchport access vlan 2000
 
  interface Ethernet 0/1
  switchport mode access
  switchport access vlan 2001
```



## **SW601 & SW602**

二太交换机下行到SW610的二个端口，增加Trunk支持，并且支持vlan 1，2000，2001

```
SW601/SW602:
 interface Ethernet 2/0
 switchport mode trunk
 switchport trunk encapsulation dot1q
 switchport trunk allowed vlan 1,2000,2001
```



# 1.3 配置 Etherchannel



## SW101

先取消port-channel 1 和3的支持，

顺时针port-channel分别是1，2，3，对于SW101就是1和3

在port-channel 1 和port-channel 3添加Trunk支持并且支持vlan 1，2000，2001，最终激活

SW101作为RSTP的根桥，在所有vlan1，2000，2001优先级设置为最高0

所有接口加入边缘端口的快速收敛机制

进入port-channel1和3，设置为端口guard root

进入其他端口同样设置guard root

```
SW101:
 no interface port-channel 1
 no interface port-channel 3
 interface range Ethernet 1/2-3
  switchport
  switchport trunk encapsulation dot1q
  switchport mod trunk
  switchport trunk allowed vlan 1,2000,2001
  no shutdown
  channel-group 1 mode active
 interface range Ethernet 2/0-1
  switchport
  switchport trunk encapsulation dot1q
  switchport mod trunk
  switchport trunk allowed vlan 1,2000,2001
  no shutdown
  channel-group 3 mode active
 spanning-tree mode rapid-pvst
 spanning-tree vlan 1,2000,2001 priority 0
 spanning-tree portfast edge default
 Interface range port-channel 1, port-channel 3
   spanning-tree guard root
 Interface range Ethernet 0/3, Ethernet 1/0-3,Ethernet 2/0-1
   spanning-tree guard root
```



## **SW102**

```
SW102:
 no interface port-channel 2
 no interface port-channel 3
 
interface range Ethernet 1/2-3
  switchport
  switchport trunk encapsulation dot1q
  switchport mod trunk
  switchport trunk allowed vlan 1,2000,2001
  no shutdown
  channel-group 2 mode active
 
interface range Ethernet 2/0-1
  switchport
  switchport trunk encapsulation dot1q
  switchport mod trunk
  switchport trunk allowed vlan 1,2000,2001
  no shutdown
  channel-group 3 mode active
 
spanning-tree mode rapid-pvst
 spanning-tree vlan 1,2000,2001 priority 4096
 spanning-tree portfast edge default
 
interface port-channel 2
  spanning-tree guard root
  
Interface range Ethernet 0/3, Ethernet 1/0-3
   spanning-tree guard root
```



## **SW110**

取消port-channel 1和 2，同理之前的操作

不需要设置root保护了

```
SW110:
no interface port-channel 1
 no interface port-channel 2
 interface range Ethernet 1/0-1
  switchport
  switchport trunk encapsulation dot1q
  switchport mod trunk
  switchport trunk allowed vlan 1,2000,2001
  no shutdown
  channel-group 1 mode active
 interface range Ethernet 1/2-3
  switchport
  switchport trunk encapsulation dot1q
  switchport mod trunk
  switchport trunk allowed vlan 1,2000,2001
  no shutdown
  channel-group 2 mode active
 spanning-tree mode rapid-pvst
 spanning-tree portfast edge default
```



## 现象

**检查命令**

```
show etherchannel summery
show spanning-tree vlan [2000/2001]
show vlan brief
show interface trunk
show spanning-tree interface port-channel [1/2/3] active detail 
```

**show etherchannel summery**

![image-20241127191158841](LAB实验笔记.assets/image-20241127191158841.png)

**show spanning-tree vlan**

![image-20241127191250130](LAB实验笔记.assets/image-20241127191250130.png)

**show vlan brief**

![image-20241127191319612](LAB实验笔记.assets/image-20241127191319612.png)

**show interface trunk**

![image-20241127191553316](LAB实验笔记.assets/image-20241127191553316.png)

**show spanning-tree interface port-channel 1 active detail**

```
root guard is enabled on the port
```

![image-20241127191636567](LAB实验笔记.assets/image-20241127191636567.png)



# 1.4 配置网络服务

## **SW101**

```
SW101：
 ip dhcp relay information trust-all
 ip dhcp relay information option
 
 interface vlan 2000
 ip helper-address 10.2.255.211
 standby version 2
 standby use-bia
 standby 2000 ip 10.1.100.1
 standby 2000 priority 110
 standby 2000 preempt

 interface vlan 2001
 ip helper-address 10.2.255.211
 standby version 2
 standby use-bia
 standby 2000 ip 10.1.101.1
 standby 2000 priority 110
 standby 2000 preempt
```

## SW102

```
SW102：
 ip dhcp relay information trust-all
 ip dhcp relay information option
 
 interface vlan 2000
 ip helper-address 10.2.255.211
 standby version 2
 standby use-bia
 standby 2000 ip 10.1.100.1
 standby 2000 preempt

 interface vlan 2001
 ip helper-address 10.2.255.211
 standby version 2
 standby use-bia
 standby 2000 ip 10.1.101.1
 standby 2000 preempt
```



## 新版本

**IP SLA：**服务等级协议

icmp-echo xxx

创建track条目 1，匹配绑定IP SLA 1

 standby 210 timers 1 5 [1s发一次Hello包，5s收不到则切换]

standby 210 preempt delay minimum 15 抢占延迟15s

standby authentication md5 key-string CC!E!nf4 使用md5加密交互报文

 standby 210 track 1 decrement 20 如果未满足track 1条目，则priority下降20，110→90

## **SW101**

```
SW101：
 ip dhcp relay information trust-all
 ip dhcp relay information option

ip sla 1
icmp-echo 10.2.255.211
exit
track 1 ip sla 1 reachability
ip sla schedule 1 life forever start-time now

 interface vlan 2000
 ip helper-address 10.2.255.211
 standby version 2
 standby 210 ip 10.1.100.1
 standby 210 timers 1 5
 standby 210 priority 110
 standby 210 preempt delay minimum 15
 standby 210 authentication md5 key-string CC!E!nfr4
 standby 210 track 1 decrement 20

 interface vlan 2001
 ip helper-address 10.2.255.211
 standby version 2
 standby 220 ip 10.1.101.1
 standby 220 timers 1 5
 standby 220 priority 110
 standby 220 preempt delay minimum 15
 standby 220 authentication md5 key-string CC!E!nfr4
 standby 220 track 1 decrement 20
```



## SW102

```
SW102:
ip dhcp relay information trust-all
 ip dhcp relay information option

ip sla 1
icmp-echo 10.2.255.211
exit
track 1 ip sla 1 reachability
ip sla schedule 1 life forever start-time now

 interface Vlan2000
 ip helper-address 10.2.255.211
 standby version 2
 standby 210 ip 10.1.100.1
 standby 210 preempt delay minimum 15
 standby 210 authentication md5 key-string CC!E!nfr4
 standby 210 track 1 decrement 20
 

 interface Vlan2001
 ip helper-address 10.2.255.211
  standby version 2
 standby 220 ip 10.1.101.1
 standby 220 preempt delay minimum 15
 standby 220 authentication md5 key-string CC!E!nfr4
 standby 220 track 1 decrement 20
```



## 检查考场预配

## **SW110**

```
ip dhcp snooping vlan 2000-2001
 ip dhcp snooping

 interface range port-channel 1-2
 ip dhcp snooping trust
```



## 现象

```
show ip dhcp binding
show ip helper-address
show standby brief
```

**show ip dhcp binding**

![image-20241127192005651](LAB实验笔记.assets/image-20241127192005651.png)

**show ip helper-address**

![image-20241127192042368](LAB实验笔记.assets/image-20241127192042368.png)

**show standby brief**

![image-20241127192109996](LAB实验笔记.assets/image-20241127192109996.png)



# *1.5 配置DC和HQ区域的路由协议（OSPF）

OSPF must be enabled on all interfaces, except for the  following: R23-GE4  R24-GE4  R21-GE1  R22-GE1  R11-GE0/0  R12-GE0/0

![image-20241127163838165](LAB实验笔记.assets/image-20241127163838165.png)

## R11 & R12

R11&R12 除了E0/0,1-3口+环回口都加入ospf 1进程中，并且区域Area0

```
R11&R12:
interface range E0/1-3,lo0
ip ospf 1 area 0
```

## **新版 R11&R12**

 **ospf三种加密方式：**none (or null), simple, or MD5

ip ospf authentication message-digest  启动OSPF端口MD5认证

ip ospf message-digest-key 1 md5 CC!E!nfr4  设置MD5认证密码

```
新版R11/R12
int lo 0
ip ospf 1 a 0

interface ran e0/1-3
ip ospf authentication message-digest
ip ospf message-digest-key 1 md5 CC!E!nfr4
ip ospf 1 a 0
```



## **SW101 & SW102**

SW101&SW102 中VLAN2000和VLAN2001均加入OSPF1进程中，区域Area0

```
interface range vlan 2000-2001
ip ospf 1 area 0
```

## **新版 SW101&102**

```
新版SW101&102
int range vlan 2000-2001
ip ospf 1 a 0

interface range e0/0-1
ip ospf authentication message-digest
ip ospf message-digest-key 1 md5 CC!E!nfr4
ip ospf 1 a 0
```



## **R21 & R22**

R21&R22 除了0口，其他接口包括环回口加入ospf 1中

```
R21&R22:
interface range Ethernet 0/1-3, loopback 0
   ip ospf 1 area 0
```



## **R21**

对R21的BGP单独处理，禁止引入IGP路由到OSPF中

```
  router bgp 65002
  no bgp redistribute-internal
 
 router ospf 1
  redistribute bgp 65002 subnets metric-type 1
```



## **R23**

```
R23:
router ospf 1 
router-id 10.2.255.23

 interface range Ethernet 0/1-2, loopback 0
   ip ospf 1 area 0
```



## **R24**

```
 router ospf 1 
   router-id 10.2.255.24
 
 interface range Ethernet 0/1-2, loopback 0
   ip ospf 1 area 0
```

## 新版 SW201/SW202

```
interface vlan 3999
ip mtu 1496
```



## 现象

```
show ip ospf neighbors

R11/R12/R21/R22
三个邻居
SW101/SW102/SW211/SW212
五个邻居
R23/R24
二个邻居
SW201/SW202
九个邻居
```



# 1.6 配置MD5加密的命名EIGRP

![image-20241121105232983](LAB实验笔记.assets/image-20241121105232983.png)

配置key chain MD5加密

```
key chain CCIE_MD5
 key 1
  key-string CC!E!nfr4
```

配置命名的EIGRP

```
router eigrp ccie
 address-family ipv4 unicast autonomous-system 65006
  network 10.0.0.0
  af-interface default
   passive-interface
```



## **SW601 & SW602**

在af-interface中给邻居的接口加入MD5加密，注意vlan2000和vlan2001都要加入eigrp进程中

```
SW601/SW602:
key chain CCIE_MD5
 key 1
  key-string CC!E!nfr4
 router eigrp ccie
 address-family ipv4 unicast autonomous-system 65006
  network 10.0.0.0
  af-interface default
   passive-interface
  af-interface Ethernet0/0
   authentication mode md5
   authentication key-chain CCIE_MD5
   no passive-interface
  exit-af-interface
  af-interface Ethernet0/1
   authentication mode md5
   authentication key-chain CCIE_MD5
   no passive-interface
  exit-af-interface
  af-interface Ethernet0/2
   authentication mode md5
   authentication key-chain CCIE_MD5
   no passive-interface
  exit-af-interface
  af-interface vlan 2000
   authentication mode md5
   authentication key-chain CCIE_MD5
   no passive-interface
  exit-af-interface
   af-interface vlan 2001
   authentication mode md5
   authentication key-chain CCIE_MD5
   no passive-interface
  exit-af-interface
```



## **R61**

```
R61:
key chain CCIE_MD5
 key 1
  key-string CC!E!nfr4
 
router eigrp ccie
 address-family ipv4 unicast autonomous-system 65006
  network 10.0.0.0
  af-interface default
   passive-interface
  exit-af-interface
  af-interface Ethernet0/1
   authentication mode md5
   authentication key-chain CCIE_MD5
   no passive-interface
  exit-af-interface
  af-interface Ethernet0/2
   authentication mode md5
   authentication key-chain CCIE_MD5
   no passive-interface
  exit-af-interface
  af-interface Ethernet0/3
   authentication mode md5
   authentication key-chain CCIE_MD5
   no passive-interface
  exit-af-interface
 exit-address-family
```



## **R62**

```
key chain CCIE_MD5
 key 1
  key-string CC!E!nfr4
```



## 现象

```
show ip eigrp neighbors
show ip eigrp interfaces detail
show key chain
show ip route eigrp

R61/R62
三个邻居
SW601/SW602
五个邻居
```

**show ip eigrp interfaces detail**

```
检查key-chain 是否均为CCIE_MD5
```

![image-20241127192811744](LAB实验笔记.assets/image-20241127192811744.png)

**show key chain**

```
检查密码是否正确
```

![image-20241127192857915](LAB实验笔记.assets/image-20241127192857915.png)

**show ip route eigrp**

![image-20241127193107142](LAB实验笔记.assets/image-20241127193107142.png)



# *1.7 在R1-R6 配置OSPF(P2P)+MPLS标签(AUTO)

![image-20241120204930834](LAB实验笔记.assets/image-20241120204930834.png)

验证R1-R6是否都建立OSPF邻居关系

确保SP#1区域配置MPLS交换标签

所有Lo作为LDP的Router ID

OSPF没有2类LSA（P2P网络）



## **R1 & R2**

配置MPLS router-id为环回口lo0

```
mpls ldp router-id loopback 0 force
```

配置lo0的ospf进程

配置MPLS标签

R1&R2:

```
R1&R2:
mpls ldp router-id loopback 0 force
 interface loopback 0
  ip ospf 1 area 0
 interface range Ethernet 0/0-2
  ip ospf network point-to-point
  ip ospf 1 area 0
  mpls ip
 router ospf 1
  prefix-suppression
  mpls ldp autoconfig area 0
```

**prefix-suppression**

减少1类和 2类的SLA，去除stub网络中1类LSA, 将2类 LSA掩码编程32位，从而减少1类和2类LSA数量，对其他LSA无影响

**mpls ldp autoconfig area 0**

配置上mpls ldp autoconfig area0命令 后，所有属于OSPF进程中area0中的所有接⼝都会激活LDP协议， 确保LDP会话的⾃动建⽴和标签的分发。



## **R3 &R4 &R5 &R6:**

```
R3&R4&R5&R6:

mpls ldp router-id loopback 0 force
 interface loopback 0
  ip ospf 1 area 0
 interface Ethernet 1/3
  ip ospf 1 area 0
  ip ospf network point-to-point
  mpls ip
 router ospf 1
  prefix-suppression
  mpls ldp autoconfig area 0
```



## **R4**

```
R4:

interface loopback 0
  ip address 100.255.254.4 255.255.255.255
```



### **新版变化**

- R1-R6增加了mpls的md5密码校验；

- R1和R2分别对直连的（R3/R5）和（R4和R6）加入access-list，并应用在mpls ldp上；

  ```
  access-list 10 permit 100.255.254.2
  access-list 10 permit 100.255.254.3
  access-list 10 permit 100.255.254.5
  
  mpls ldp password option 1 for 10 CC!E!nfr4
  mpls ldp password required for 10
  ```

  - OSPF进程中配置mpls自动标签下发，区域 area 0

**R1**

```
R1
access-list 10 permit 100.255.254.2
access-list 10 permit 100.255.254.3
access-list 10 permit 100.255.254.5

mpls ldp router-id lo0 force
mpls ldp password option 1 for 10 CC!E!nfr4
mpls ldp password required for 10

int lo 0
ip ospf 1 area 0

interface range e0/0-2
ip ospf network point-to-point 
ip ospf 1 area 0
mpls ip

router ospf 1
prefix-suppression
mpls ldp autoconfig area 0
```

**R2**

```
R2
access-list 10 permit 100.255.254.1
access-list 10 permit 100.255.254.4
access-list 10 permit 100.255.254.6

mpls ldp router-id lo0 force
mpls ldp password option 1 for 10 CC!E!nfr4
mpls ldp password required for 10

int lo 0
ip ospf 1 area 0

interface range ethernet 0/0-2
ip ospf network point-to-point 
ip ospf 1 area 0
mpls ip

router ospf 1
prefix-suppression
mpls ldp autoconfig area 0
```

**R3**

```
mpls ldp router-id lo0 force
mpls ldp neighbor 100.255.254.1 password CC!E!nfr4

int lo 0
ip ospf 1 area 0

in e1/3
ip ospf 1 area 0
ip ospf network point-to-point
mpls ip

router ospf 1
prefix-suppression
mpls ldp autoconfig area 0
```

**R4**

```
mpls ldp router-id lo0 force
mpls ldp neighbor 100.255.254.2 password CC!E!nfr4

int lo 0
ip address 100.255.254.4 255.255.255.255
ip ospf 1 area 0

int e1/3
ip ospf 1 area 0
ip ospf network point-to-point
mpls ip

router ospf 1
prefix-suppression
mpls ldp autoconfig area 0
```

**R5**

```
mpls ldp router-id lo0 force
mpls ldp neighbor 100.255.254.1 password CC!E!nfr4

int lo 0
ip ospf 1 area 0

int e1/3
ip ospf 1 area 0
ip ospf network point-to-point
mpls ip

router ospf 1
prefix-suppression
mpls ldp autoconfig area 0
```

**R6**

```
mpls ldp router-id lo0 force
mpls ldp neighbor 100.255.254.2 password CC!E!nfr4

int lo 0
ip ospf 1 area 0

int e1/3
ip ospf 1 area 0
ip ospf network point-to-point
mpls ip

router ospf 1
prefix-suppression
mpls ldp autoconfig area 0
```



## 现象

```
show ip route ospf
show mpls ldp neighbors
```

**show ip route ospf**

```
存在
10.255.254.[2/3/4/5/6]
5个OSPF路由
```

![image-20241127193510175](LAB实验笔记.assets/image-20241127193510175.png)

**show mpls ldp neighbors**

```
存在
100.255.254.2
100.255.254.3
100.255.254.5
三个邻居[mpls ldp router-id lo 0 force]
```

![image-20241127193544691](LAB实验笔记.assets/image-20241127193544691.png)



# 1.8 MPLS和BGP

![image-20241120204900105](LAB实验笔记.assets/image-20241120204900105.png)

配置PE和CE，MPLS VPN题目，使用vrf FABD2的路由表

R3必须有5个active BGP邻居，分别是，R4, R5, R6, R21, R11

R1和R2是P路由器（骨干），只能运行MPLS，不能跑BGP

R3, R4, R5, R6均为PE路由器

## ***R3**

![image-20241120210303806](LAB实验笔记.assets/image-20241120210303806.png)

引入VRF 路由表，非MPLS域的物理接口接入VRF forwarding，将非MPLS域的BGP与R3建立BGP邻居关系。

R4, R5, R6 建立带加密的BGP邻居关系，并且在vpnv4中激活**（二步）**

RD是用于确保不同VPNv4通道内的地址的唯一性，防止不同客户使用相同的网段导致流量错误定向到其他客户网络中

新版需要在vrf中加入以下命令

```
bgp 10000
address-family ipv4 vrf fabd2
redistribute connected
neighbor 100.3.21.2 maximum-prefix 100000 90 restart 5
```



```
R3

vrf definition fabd2 
 rd 10000:3 
 route-target both 10000:1 
 
address-family ipv4 unicast
 exit-address-family
 
interface Ethernet0/0
 vrf forwarding fabd2 
ip address 100.3.11.1 255.255.255.252 
 
interface Ethernet0/1
 vrf forwarding fabd2 
ip address 100.3.21.1 255.255.255.252 
 
router bgp 10000 
 bgp router-id 100.255.254.3 
 no bgp default ipv4-unicast 
 neighbor 100.255.254.4 remote-as 10000 
 neighbor 100.255.254.4 password CC!E!nfr4 
 neighbor 100.255.254.4 update-source Loopback0 
 neighbor 100.255.254.5 remote-as 10000 
 neighbor 100.255.254.5 password CC!E!nfr4 
 neighbor 100.255.254.5 update-source Loopback0 
 neighbor 100.255.254.6 remote-as 10000 
 neighbor 100.255.254.6 password CC!E!nfr4 
 neighbor 100.255.254.6 update-source Loopback0 
 
address-family vpnv4 
 neighbor 100.255.254.4 activate 
 neighbor 100.255.254.5 activate 
 neighbor 100.255.254.6 activate 
 
address-family ipv4 vrf fabd2 
 redistribute connected
 neighbor 100.3.11.2 remote-as 65001 
 neighbor 100.3.11.2 activate 
 neighbor 100.3.21.2 remote-as 65002 
 neighbor 100.3.21.2 activate
 neighbor 100.3.21.2 maximum-prefix 100000 90 restart 5
```



## **R3& R4& R5& R6**

VPNv4中BGP激活邻居关系（补全操作）

```
vrf definition fabd2 
 no route-target both 10000:4
 route-target both 10000:1
 
 router bgp 10000 
 neighbor 100.255.254.3 password CC!E!nfr4 
 neighbor 100.255.254.4 password CC!E!nfr4 
 neighbor 100.255.254.5 password CC!E!nfr4 
 neighbor 100.255.254.6 password CC!E!nfr4 
```



## 现象

```
show ip bgp all summary
show ip bgp vpnv4 all
```

**show ip bgp all summary**

```
存在
bgp vrf邻居
100.3.11.2
100.3.21.2
bgp vpnv4邻居
100.255.254.4
100.255.254.5
100.255.254.6
```

![image-20241127194057340](LAB实验笔记.assets/image-20241127194057340.png)

**show ip bgp vpnv4 all**

![image-20241127194153143](LAB实验笔记.assets/image-20241127194153143.png)



# *1.9 在R11和R12上做重分布配置

![image-20241120214158780](LAB实验笔记.assets/image-20241120214158780.png)

使用route-map和prefilx-list过滤101.22.0.0/30，并允许其他全部地址段通信。

在OSPF中引入BGP OE1类型路由（内部路由到达ASBR的cost值+ASBR到达外部路由的cost），用于满足但要使用route-map应用过滤。

OE2不包含内部到达ASBR的cost值。



## **R11**

```
R11
ip prefix-list DENY-R22 deny 101.22.0.0/30
 ip prefix-list DENY-R22 permit 0.0.0.0/0 le 32
 route-map DENY-R22 permit 10
 match ip address prefix-list DENY-R22
 router ospf 1
 redistribute bgp 65001 metric-type 1 subnets route-map DENY-R22
```

## 新版R11

**当题目R11说不能使用route-map使用以下方法**

重点命令

```
distribute-list prefix DENY-R22 out bgp 65001
```

```
R11
ip prefix-list DENY-R22 deny 101.22.0.0/30
 ip prefix-list DENY-R22 permit 0.0.0.0/0 le 32
 
 router ospf 1
 redistribute bgp 65001 subnets metric-type 1
 distribute-list prefix DENY-R22 out bgp 65001
```



## **R12**

**题目要求：**R12要重分布和ISP直连接口所在网络，到OSPF中

```
R12
router ospf 1
  redistribute connected subnets metric-type 1
```

## 新版R12

```
R12
route-map C2O permit 10
match interface e0/0

router ospf 1
redistribute connected metric-type 1 subnets route-map C2O
```



## 现象

```
show ip route ospf | in O E
检查SW101/SW201,R23
```

![image-20241127195105854](LAB实验笔记.assets/image-20241127195105854.png)



# 1.10 BGP 的BFD检测配置

R5-R61之间，R6-R62之间配置BFD检测。

![image-20241120214506799](LAB实验笔记.assets/image-20241120214506799.png)

按需求：

```
clear ip bgp *
```



## **R5**

min_rx（BFD设备预 期多久从BFD邻居那⾥收到BFD数据包）设置为333毫秒。

multiplier 设置为3，就是说当BFD设备接连没收到邻居的三个BFD数据包以 后，会宣告BFD检测失败，告诉设备链路失效。

ttl-security  hops 1，⽤于满⾜题⽬要求的‘ Routers R5-61 and R6-R62 must  only establish eBGP session withrouters 1 hop away.’ ，意味着 希望接收到数据包的TTL值⾄少为‘ 255-1=254’ （这⾥假设发送者 设置的TTL最初为255，这是常⻅的最⼤值）。

neighbor fall-over。命令⽤来激活BGP邻居会话快速中断特性。该特性改进了BGP收敛和响应时间，以便能更好的适应BGP 邻居变动。

```
Interface Ethernet0/0
  bfd interval 333 min_rx 333 multiplier 3

 router bgp 10000
  address-family ipv4 vrf fabd2
  neighbor 100.5.61.2 ttl-security hops 1
  neighbor 100.5.61.2 fall-over bfd
  neighbor 100.5.61.2 password CC!E!nfr4
 end
  clear ip bgp *
```



## R61

```
Interface Ethernet0/0
  bfd interval 333 min_rx 333 multiplier 3

 router bgp 65006
  neighbor 100.5.61.1 password CC!E!nfr4
  neighbor 100.5.61.1 fall-over bfd
  neighbor 100.5.61.1 ttl-security hops 1
 end
  clear ip bgp *
```

 The TCP session on top of which BGP peerings between R5 R61 operate must carry an MD5 flag. 

**因此R6和R62需要配置MD5 flag参数保护了。**

## **R6**

```
Interface Ethernet0/0
  bfd interval 333 min_rx 333 multiplier 3

 router bgp 10000
  address-family ipv4 vrf fabd2
  neighbor 100.6.62.2 ttl-security hops 1
  neighbor 100.6.62.2 fall-over bfd
 end
  clear ip bgp *
```



## **R62**

```
Interface Ethernet0/0
  bfd interval 333 min_rx 333 multiplier 3
 
 router bgp 65006
  neighbor 100.6.62.1 fall-over bfd
  neighbor 100.6.62.1 ttl-security hops 1
 end
  clear ip bgp *
```



## 现象

```
show bfd neighbors details
show ip bgp vpnv4 vrf fabd2 neighbor 100.5.61.2 (R5)
```

**show bfd neighbors details**

![image-20241127195350302](LAB实验笔记.assets/image-20241127195350302.png)



# 1.11 DMVPN

![image-20241127165222097](LAB实验笔记.assets/image-20241127165222097.png)

## R24

crypto isakmp policy 10 优先级为10的ISAKMP加密配置

hash md5 使用md5加密

 no crypto isakmp key cisco address 0.0.0.0 删除无加密的配置

 crypto isakmp key CC!E!nfr4 address 0.0.0.0 使用带md5 ISAKMP加密的配置

tunnel protection ipsec profile prof  Tunnel接口使用名字为prof的ipsec加密配置

```
R24
crypto isakmp policy 10
  hash md5
 no crypto isakmp key cisco address 0.0.0.0
 crypto isakmp key CC!E!nfr4 address 0.0.0.0
 interface Tunnel0
  tunnel source Ethernet0/0
  tunnel protection ipsec profile prof
  ip nhrp map multicast dynamic
 
 router eigrp ccie
 address-family ipv4 unicast autonomous-system 65006
   af-interface Tunnel0
     no passive-interface
```



## R61

```
R61

 interface e1/0
  vrf forwarding WAN
  ip address 200.99.61.2 255.255.255.252
 
 router bgp 65006
  address-family ipv4 vrf WAN
  neighbor 200.99.61.1 remote-as 19999
  neighbor 200.99.61.1 activate
 
 no crypto isakmp key cisco address 0.0.0.0
 crypto keyring KR vrf WAN
  pre-shared-key address 0.0.0.0 0.0.0.0 key CC!E!nfr4
 
 interface Tunnel0
  ip mtu 1440
  no ip nhrp map multicast 10.2.255.24
  ip nhrp map multicast 200.99.24.2
  no ip nhrp map 10.2.255.24 10.200.0.1
  ip nhrp map 10.200.0.1 200.99.24.2
  tunnel source Ethernet 1/0
  tunnel vrf WAN

 router eigrp ccie
 address-family ipv4 unicast autonomous-system 65006
   af-interface Tunnel0
     no passive-interface
```



## R70

```
R70

 interface Ethernet0/1
  vrf forwarding WAN
  ip address 200.99.70.2 255.255.255.252
  no shutdown
  
 router bgp 65007
  address-family ipv4 vrf WAN
    neighbor 200.99.70.1 remote-as 19999
    neighbor 200.99.70.1 activate
 
 crypto keyring KR vrf WAN
  no pre-shared-key address 0.0.0.0 0.0.0.0 key cisco
  pre-shared-key address 0.0.0.0 0.0.0.0 key CC!E!nfr4
 
 interface Tunnel0
  no ip nhrp map multicast 10.2.255.24
  ip nhrp map multicast 200.99.24.2
  no ip nhrp map 10.2.255.24 10.200.0.1
  ip nhrp map 10.200.0.1 200.99.24.2
  tunnel source Ethernet 0/1
  tunnel vrf WAN
 
 router eigrp ccie
  address-family ipv4 unicast autonomous-system 65006
    af-interface Tunnel0
    no passive-interface
```



## R5

```
R5

access-list 1 deny 10.2.114.0 0.0.0.3
access-list 1 deny 10.2.214.0 0.0.0.3
access-list 1 deny host 10.2.255.24 
access-list 1 permit any

router bgp 10000
 address-family ipv4 vrf fabd2
 neighbor 100.5.61.2 distribute-list 1 out
 neighbor 100.5.61.2 distribute-list 1 in
```





## 现象

```
show dmvpn
show ip eigrp neighbors
show ip route eigrp
```

**show dmvpn**

![image-20241129142952398](LAB实验笔记.assets/image-20241129142952398.png)

**show ip eigrp neighbors**

![image-20241129143027788](LAB实验笔记.assets/image-20241129143027788.png)

**show ip route eigrp**

![image-20241130140910703](LAB实验笔记.assets/image-20241130140910703.png)

## 排障

![image-20241129150547642](LAB实验笔记.assets/image-20241129150547642.png)

## 解析

对于R24而言

```
R24 HUB

// GRE over IPsec配置
crypto isakmp policy 10
 encr 3des
 hash md5   // *
 authentication pre-share
 group 2
crypto isakmp key CC!E!nfr4 address 0.0.0.0  // *密码是CC!E!nfr4


crypto ipsec transform-set trans esp-3des esp-md5-hmac //建立传输集
 mode tunnel

crypto ipsec profile prof  //IPSEC加密配置
 set security-association lifetime seconds 900
 set transform-set trans   //调用传输集合
//  GRE over IPsec配置

 interface Ethernet0/0
 ip address 200.99.24.2 255.255.255.252 //建立NHRP映射使用公网物理接口地址
 
 interface Tunnel0 //使用Tunnel 0 接口建立GRE隧道
 ip address 10.200.0.1 255.255.255.0
 no ip redirects
 ip mtu 1440
 ip nhrp map multicast dynamic  //NHRP自动建立协议
 ip nhrp network-id 1010  //network-id需要一致
 tunnel source Ethernet0/0  //source接口要对应公网出口
 tunnel mode gre multipoint  //GRE多播模式，可建立多个不同IP的隧道
 tunnel protection ipsec profile prof  //使用ipsec加密
 
 router eigrp ccie
 address-family ipv4 unicast autonomous-system 65006
 af-interface Tunnel0
   no passive-interface  //确保Tunnel0不是静默状态
   
 router bgp 65002
 bgp log-neighbor-changes
 neighbor 200.99.24.1 remote-as 19999
```

对于R61和R70

```
R61 Spoke
crypto keyring KP vrf WAN 
  pre-shared-key address 0.0.0.0 0.0.0.0 key CC!E!nfr4 //crypto加密要在vrf WAN中
  
 crypto isakmp policy 10 //isakmp加密方式
 encr 3des
 hash md5  //确保有md5
 authentication pre-share
 group 2
 
 crypto ipsec transform-set trans esp-3des esp-md5-hmac 
 mode tunnel
 
 crypto ipsec profile prof
 set security-association lifetime seconds 900
 set transform-set trans 
 
 interface Ethernet1/0  //确保物理接口在VRF WAN中
 vrf forwarding WAN
 ip address 200.99.61.2 255.255.255.252
 
 interface Tunnel0
 ip address 10.200.0.61 255.255.255.0
 no ip redirects
 ip nhrp map multicast 200.99.24.2
 ip nhrp map 10.200.0.1 200.99.24.2
 ip nhrp network-id 1010  //network-id需要一致
 ip nhrp nhs 10.200.0.1   //配置nhrp server地址，spoke会自动向server注册隧道地址到公网地址的映射
 tunnel source Ethernet1/0  //source接口是物理出口
 tunnel mode gre multipoint
 tunnel vrf WAN   //tunnel也要在vrf WAN中
 tunnel protection ipsec profile prof  //确保使用了ipsec加密文件
 
 router eigrp ccie
 address-family ipv4 unicast autonomous-system 65006
 af-interface Tunnel0
 no passive-interface  //确保Tunnel 0不是静默状态
 
 router bgp 65006
 address-family ipv4 vrf WAN
  neighbor 200.99.61.1 remote-as 19999
  neighbor 200.99.61.1 activate  //BGP 邻居关系在VRF WAN中
```



# 1.12 NAT & Telnet

![image-20241127170723947](LAB实验笔记.assets/image-20241127170723947.png)

## R23

```
R23

ip http server
 Interface range Ethernet0/1-2
 ip nat inside
 
 interface Ethernet0/0
 ip nat outside
 
 ip access-list standard CCIENAT
  permit 10.0.0.0 0.255.255.255 

ip nat inside source list CCIENAT interface Ethernet0/0 overload
 ip nat inside source static tcp 10.2.255.23 80 200.99.23.2 2002 extendable 

ip route 0.0.0.0 0.0.0.0 200.99.23.1

username ccieuser password CC!E!nfr4
 ip access-list extended CCIETELNET 
  deny tcp any any eq 23 
  permit tcp any any eq 3003
 
 line vty 0 15
  login local
  access-class CCIETELNET in
  rotary 3
  transport input telnet
```



# *1.13 二侧接口保护



## SW700

```
SW700

vlan 100,414

 Interface Ethernet 2/1
   switchport trunk encapsulation dot1q
   switchport mode trunk
 
 errdisable recovery cause psecure-violation
 errdisable recovery interval 120/180(新版)
```



```
先show mac address-table | include 0/
eg:
sw700#sh mac address-table | include 0/
   1    aabb.cc02.4000    DYNAMIC     Et0/1
   1    aabb.cc02.5000    DYNAMIC     Et0/0
   
interface Ethernet0/0
 switchport access vlan 100
 switchport mode access
 switchport port-security
 switchport port-security maximum 1
 switchport port-security mac-address aabb:cc02:4000
 switchport port-security aging time 1
 switchport port-security violation shutdown/restrict（新版）
 
 interface Ethernet0/1
 switchport access vlan 414
 switchport mode access
 switchport port-security
 switchport port-security maximum 1
 switchport port-security mac-address aabb:cc02:5000
 switchport port-security violation restrict/shutdown（新版）
```

```
 switchport port-security aging time 1（对应shutdown需要加入）
 pretect的配置则不需要上述命令
```



# 1.14 AAA认证



## SW211

```
SW211

aaa new-model
 radius server ise 
  address ipv4 10.2.252.11 auth-port 1645 acct-port 1646
  key 0 CC!E!nfr4

 aaa group server radius ISEG
 server name ise

 aaa server radius dynamic-author
 client 10.2.252.11 server-key 0 CC!E!nfr4
 
 ip radius source-interface e1/1
 radius-server retransmit 6
 radius-server timeout 10
 
 aaa authentication login NO_AUTH none
 aaa authentication login SSH_EXEC_G group ISEG
 aaa authorization exec default none
 aaa authorization exec SSH_EXEC_G group ISEG
 
 line vty 0 15
 transport input ssh
 authorization exec SSH_EXEC_G
 login authentication SSH_EXEC_G

 line console 0
  login authentication NO_AUTH
```



# 过时版本知识点

**MSTP实例配置**

```
spanning-tree mode mst
spanning-tree mst configuration
name CCIE
revision 1
instance 1 vlan 1001-2000
instance 2 vlan 2001-4094
spanning-tree mst 0-1 root primary
vtp domain CCIE
vtp version 3
vtp password xxx hidden
vtp mode server mst
end
vtp primary mst force
```

**VRRP配置**

```
int vlan 2000
vrrp 100 ip 10.1.100.1
vrrp 100 priority 105
ip ospf 1 a 0
```

**ip sla配置**

```
ip sla 1
icmp-echo 10.2.255.211
threshold 400
timeout 400
frequency 5
ip sla schedule 1 life forever start-time now

track 1 ip sla 1
delay down 10
```

**IPv6配置**

```
int vlan 2000
ipv6 enable
ipv6 address 2001:DB8:1:100::1/64
ipv6 nd router-preference High
ipv6 nd ra interval msec 1000
ipv6 nd ra lifetime 3
```

**IPv6-EIGRP配置**

```
router eigrp ccie
address-family ipv6 unicast auto 65001
eigrp router-id 10.1.255.11
af-int default
passive-interface
shutdown
af-int e0/1
no passive-int
no shutdown
```
