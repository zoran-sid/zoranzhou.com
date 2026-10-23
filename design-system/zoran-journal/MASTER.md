# Zoran Journal — 设计研究与最终系统

当前规范：[DESIGN.md](../../DESIGN.md)；机器预览：[design.json](../../.impeccable/design.json)。运行时以 global.css、lab.css、atmosphere.css 和 scroll-atmosphere.ts 为准。

UI UX Pro Max 已执行 --design-system --persist、UX / Astro 知识库检索，以及 Magazine/Blog / Portfolio / Winery 配色检索。生成的 Brutalism 与商业配色作为研究输入，没有直接采用。

Taste 的 type-only-statement 方向提供署名与阅读索引的构图参考。配色研究曾查看 oxblood-grey 与 burgundy-bubblegum，对应 [Belgrade 建筑档案](https://belgrade.klmln.com/) 和 [Madie](https://madie.es/)。用户随后明确否决酒红，并要求更淡、随滚动变化的颜色和全屏光点；早期研究不再是颜色标准。

最终采用近白雾蓝 → 浅紫 → 暖白 → 象牙白，稳定蓝墨正文与操作色。主站夜间为炭灰、青灰与浅珊瑚操作色，Lab 保留独立蓝灰面板。全屏微光点串联各页，精选细线、生活日光、Lab 轨道各自形成章节节奏。手机减量、系统减少动态效果与后台暂停；保持原技术栈，没有增加动画依赖。

最终验证遵循用户的代码与构建范围，当前动效没有重新截图或性能实测。首轮设计的浏览器验证记录只作历史证据。

日夜切换以 1.8s 日落 / 日出串联白天、黄昏与夜色。太阳独立于微光点，不受粒子透明度压低。主题状态与动画由同一模块管理，重复点击和后台切换都有确定的最终状态。Karpathy Guidelines 用于这一轮代码审查与清理。
