---
name: Zoran — Personal Journal
description: 浅色滚动渐变、全屏微光点与分章节动态的个人写作和生活档案。
colors:
  page: "#f5f7fb"
  surface: "#fff"
  surface-soft: "#ffffff59"
  ink: "#25314a"
  muted: "#566079"
  accent: "#3e50a0"
  brand-magenta: "#b0148b"
  brand-leaf: "#22635b"
  accent-ink: "#fff"
  cover: "#ffffff80"
  cover-ink: "#25314a"
  field: "#ffffff80"
  field-ink: "#25314a"
  field-muted: "#566079"
  dark-page: "#14181c"
  dark-surface: "#1d2226"
  dark-surface-soft: "#ffffff0c"
  dark-ink: "#eceae2"
  dark-muted: "#b9bcb2"
  dark-accent: "#ffae91"
  dark-brand-magenta: "#ed94d4"
  dark-brand-leaf: "#8cc7bb"
  dark-accent-ink: "#14181c"
  dark-cover: "#ffffff0c"
  dark-cover-ink: "#eceae2"
  atmosphere-0: "#eef4fa"
  atmosphere-1: "#f3f0f8"
  atmosphere-2: "#faf1ed"
  atmosphere-3: "#f9f6ed"
  dark-atmosphere-0: "#14181c"
  dark-atmosphere-1: "#20252a"
  dark-atmosphere-2: "#292e33"
  dark-atmosphere-3: "#203238"
  ticket-movie: "#79b8d4"
  ticket-concert: "#b19ac9"
  ticket-theatre: "#cf9dab"
  ticket-comedy: "#d5ab7c"
  ticket-sport: "#8ab794"
  ticket-train: "#d5a091"
  ticket-flight: "#9fbbc5"
  ticket-receipt: "#c5b48b"
  ticket-travel: "#84b8af"
  ticket-other: "#8fa99c"
  ticket-cover-default-stock: "#e4eced"
  ticket-cover-default-print: "#203b47"
  ticket-cover-movie-stock: "#dcebf0"
  ticket-cover-movie-print: "#173d4c"
  ticket-cover-concert-stock: "#e8dfc9"
  ticket-cover-concert-print: "#373453"
  ticket-cover-stage-stock: "#eee1cb"
  ticket-cover-stage-print: "#62452c"
  ticket-cover-exhibition-stock: "#eeede5"
  ticket-cover-exhibition-print: "#354b44"
  ticket-cover-sport-stock: "#e1ead7"
  ticket-cover-sport-print: "#284b3c"
  ticket-cover-train-stock: "#eedbd0"
  ticket-cover-train-print: "#704331"
  ticket-cover-flight-stock: "#e3e8df"
  ticket-cover-flight-print: "#354a53"
  ticket-cover-travel-stock: "#dce9e1"
  ticket-cover-travel-print: "#31594e"
  ticket-cover-other-stock: "#e7e4d8"
  ticket-cover-other-print: "#4b5145"
  ticket-cover-receipt-stock: "#f0e8d9"
  ticket-cover-receipt-print: "#514b3c"
  ticket-cover-dark-default-stock: "#243b45"
  ticket-cover-dark-default-print: "#d9e9ed"
  ticket-cover-dark-concert-stock: "#343149"
  ticket-cover-dark-concert-print: "#ece0bf"
  ticket-cover-dark-stage-stock: "#40342d"
  ticket-cover-dark-stage-print: "#edddc6"
  ticket-cover-dark-green-stock: "#2b3c34"
  ticket-cover-dark-green-print: "#dfebdd"
  ticket-cover-dark-receipt-stock: "#3b372e"
  ticket-cover-dark-receipt-print: "#e9e2d3"
typography:
  brand:
    fontFamily: Canela, Georgia, serif
    fontSize: 65px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: -2px
  display:
    fontFamily: Canela, Noto Serif SC, Songti SC, STSong, serif
    fontSize: clamp(4.5rem, 12vw, 10.5rem)
    fontWeight: 400
    lineHeight: 1
    letterSpacing: -0.035em
  headline:
    fontFamily: Canela Deck, Noto Serif SC, Songti SC, STSong, serif
    fontSize: clamp(2rem, 3.1vw, 3rem)
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
  body:
    fontFamily: Canela Text, Georgia, serif
    fontSize: 1rem
    lineHeight: 1.8
  body-zh:
    fontFamily: PingFang SC, Microsoft YaHei, Noto Sans SC, system-ui, sans-serif
    fontSize: 1rem
    lineHeight: 1.9
  label:
    fontFamily: Lato, PingFang SC, Microsoft YaHei, sans-serif
    fontSize: 0.8125rem
  small:
    fontFamily: Lato, PingFang SC, Microsoft YaHei, sans-serif
    fontSize: 0.875rem
    lineHeight: 1.65
  subheading:
    fontFamily: Canela Deck, Noto Serif SC, Songti SC, STSong, serif
    fontSize: 1.25rem
    lineHeight: 1.5
  section-heading-small:
    fontFamily: Canela Deck, Noto Serif SC, Songti SC, serif
    fontSize: 1.5rem
    fontWeight: 400
    lineHeight: 1.4
  code:
    fontFamily: JetBrains Mono Variable, SFMono-Regular, Consolas, monospace
    fontSize: 1rem
    lineHeight: 1.9
  ticket-cover-title:
    fontFamily: Canela Deck, Canela, Georgia, serif
    fontSize: clamp(1.25rem, 7cqi, 1.875rem)
    fontWeight: 400
    lineHeight: 1.25
  ticket-cover-date:
    fontFamily: Canela Deck, Canela, Georgia, serif
    fontSize: clamp(1.3rem, 8cqi, 2rem)
    fontWeight: 400
    lineHeight: 1
rounded:
  control: 4px
  comment-panel: 8px
  ticket: 12px
  flat: "0"
spacing:
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
  section: 64px
components:
  ticket-cover:
    backgroundColor: "{colors.ticket-cover-default-stock}"
    textColor: "{colors.ticket-cover-default-print}"
    rounded: "{rounded.control}"
    padding: 6%
  ticket-cover-movie:
    backgroundColor: "{colors.ticket-cover-movie-stock}"
    textColor: "{colors.ticket-cover-movie-print}"
  comment-emoji-popup:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
  comment-like-selected:
    textColor: "{colors.accent}"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.control}"
    padding: 0.8rem 1.3rem
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.accent-ink}"
  feature-story:
    backgroundColor: "{colors.field}"
    textColor: "{colors.field-ink}"
    padding: 2.5rem
    rounded: "{rounded.flat}"
  article-tag:
    textColor: "{colors.ink}"
    height: 44px
    padding: 0.25rem 0.65rem
  cover:
    backgroundColor: "{colors.cover}"
    textColor: "{colors.cover-ink}"
    padding: clamp(1.5rem, 4vw, 3.5rem)
---

# Design System: Zoran’s Personal Journal

## Overview

**Creative North Star: "随阅读展开的个人刊物"**

用接近白色的浅蓝、浅紫、暖白渐变连接全站，微光点覆盖整个视口并缓慢漂移。首页的精选文章、生活与学习区域各有细线、日光和轨道的变化。字体、真实照片与文章结构保持清晰；技术正文沿用稳定的阅读排版。

**Key Characteristics:**
- 全屏浅色渐变随阅读位置变化，微光点持续缓慢移动
- 板块各自表达内容，整体共享字体、颜色与动态节奏
- 真实文章、头像与摄影主导页面，原始摄影保持原色

最新方向由用户明确提出：放弃酒红、降低饱和度、让渐变随滚动过渡，并把微光点扩展到全屏。本规范记录当前代码，替换之前的绿色和酒红方案。最终验证依用户要求限于代码和构建。

## Colors

颜色角色取自前置 tokens；渐变色序列由 src/lib/scroll-atmosphere.ts 管理。浅色由雾蓝经浅紫、暖白过渡到象牙白；夜间使用炭灰到青灰的低饱和渐变；主站为暖白正文和浅珊瑚操作色，Lab 保留独立蓝灰面板与浅蓝操作色。操作文字和正文墨色保持稳定。透明内容底允许渐变自然贯穿页面。

**The Reading Rule.** 颜色可随位置变化，阅读对比度保持稳定。test:atmosphere 在每个主题 301 个进度点检查正文、次要文字和链接，并计算光点最强叠加处的对比度。此计算覆盖指定颜色模型，实际合成效果由本地浏览器检查。

Taste 的调色库与真实案例研究用于比较方向；用户已否决其中的酒红方案。最终渐变是按用户要求确定的配色，不宣称出自某个获奖网站。研究过程保存在设计系统 MASTER 和方向笔记。

详情票面（TicketFace）按用户提供的实体票参考区分类别：电影雾蓝、音乐会淡紫、戏剧柔粉、喜剧浅杏、赛事浅绿、火车暖桃、机票灰蓝、小票暖米、旅行浅青。票纸在浅色主题混合 70% surface 与 30% 分类色，深色主题混合 84% surface 与 16% 分类色；文字沿用 ink / muted，类型名称与图标同步表达类别。

### Ticket cover scope

列表封面使用独立的纸色与印墨配对，规范中的 `ticket-cover-*-stock` / `ticket-cover-*-print` 对应 `src/styles/ticket-covers.css` 内 `.ticket-cover` 的局部 `--stock` / `--print`；它们不替换全站颜色或详情票面的 `ticket-*` 分类色。细线由当前印墨与透明色混合 25% 形成，图案底由印墨 6% 与纸色混合形成。

| 类别 | 浅色配对前缀 | 深色配对前缀 | 印刷语言 |
| --- | --- | --- | --- |
| 默认 | `ticket-cover-default` | `ticket-cover-dark-default` | 冷灰纸与深墨 |
| 电影 | `ticket-cover-movie` | `ticket-cover-dark-default` | 雾蓝纸、深蓝墨、反色胶片画框 |
| 音乐会 | `ticket-cover-concert` | `ticket-cover-dark-concert` | 暖纸与靛墨、唱片沟槽、粗日期 |
| 戏剧、演出、喜剧 | `ticket-cover-stage` | `ticket-cover-dark-stage` | 节目单暖纸与棕墨、舞台拱门 |
| 展览 | `ticket-cover-exhibition` | `ticket-cover-dark-green` | 灰白纸与绿墨、几何版画留白 |
| 赛事 | `ticket-cover-sport` | `ticket-cover-dark-green` | 浅绿纸与深绿墨、跑道 |
| 火车 | `ticket-cover-train` | `ticket-cover-dark-stage` | 暖桃纸与棕墨、路线 |
| 航班 | `ticket-cover-flight` | `ticket-cover-dark-green` | 灰绿纸与蓝灰墨、航线 |
| 旅行 | `ticket-cover-travel` | `ticket-cover-dark-green` | 浅青纸与绿墨、路线与邮戳 |
| 其他 | `ticket-cover-other` | `ticket-cover-dark-green` | 灰米纸与灰绿墨、纪念邮戳 |
| 小票、餐饮、发票 | `ticket-cover-receipt` | `ticket-cover-dark-receipt` | 米色纸与暖灰墨 |

**The Cover Scope Rule.** 2:3 竖向封面只用于票根列表，以原创 SVG 印刷图形表达类别；照片、海报和上传图片保留在详情页。封面与详情分别维护，不把封面的裁切与信息限额带入详情。

## Typography

使用项目已有的三款 Canela 字体：Canela Regular 用于 zoran 字标和首页署名，Canela Deck Regular 用于英文栏目与文章标题，Canela Text Regular 用于英文正文。中文标题由 Noto Serif SC 承接，正文用系统中文黑体；Lato 与系统黑体用于导航、按钮、日期和路线数据。JetBrains Mono Variable 用于代码。所有字体均本地提供并使用 swap；只引用实际存在的 Regular 文件，不假设截图中的 Light、Medium 已在项目中。

标题使用 Regular 400，以字号和留白建立层级。中文标题字距为 0，行高 1.4；英文标题字距 -0.018em，行高 1.25。正文中文行高 1.9、英文 1.8。首页署名保留艺术字变化与乒乓球动画；手机字号为 clamp(2.8rem, 13.8vw, 5.8rem)。手机栏目标题约 30–36px，文章列表约 19–24px，正文至少 16px，日期等辅助信息至少 13px。保留原始长标题，允许自然换行。

## Layout

主站最大宽 76rem；长文为 42rem 正文和 14rem 目录，间距 5rem。首页以署名与“随记 / Notes”开篇：最新一条记录以正文预览和配图呈现，没有记录时保留简短空状态与列表入口。随后是精选文章、项目（有内容时）、封面书架、旅行手记，以及并列的跑步记录和最近观影。Writing 是分类与时间列表，Projects 是实际实践，Life 以摄影开篇，About 是头像与个人背景。Lab 保留当前学习与分阶段计划。

断点为 640、768、900、1024、1280px，具体组件按内容选择。窄屏单列，目录折叠，代码与表格在阅读列内部滚动。装饰层使用绝对或固定定位，不参与排版和命中测试。

## Elevation & Depth

全屏背景固定于视口，颜色由滚动进度插值，140ms 时间常数使滚动停止后自然收住。微光点是 108 个确定位置、分为 9 组的 SVG 光点，缓慢漂移 18–28.4s；手机隐藏部分组并减小位移。无需 Canvas、滤镜模糊或动画依赖。

**The Motion Rule.** 动态服务章节节奏。全屏光点串联阅读；精选文章使用细线随滚动延展，生活部分使用柔和日光漂移，项目与 Lab 使用慢速轨道。正文段落不逐段动画。内容默认可见，JavaScript 失败时仍可阅读。

尊重 prefers-reduced-motion，保留静态渐变和光点。离开视口的章节动画暂停，隐藏标签页暂停光点、星光和章节循环。主题切换在隐藏页面时直接完成；滚动补间只在需要更新时申请帧。打印隐藏全部装饰。

日夜切换为 1.8s：日光 → 浅杏与灰紫余晖 → 炭灰夜色，太阳沿右侧天空落下；切回浅色时反向升起。背景由日间、黄昏、夜间三层透明度组合，太阳独立于低透明度光点层。阅读主题在日落 62% / 日出 38% 时切换，避免一开始就把白字放上白天背景。快速重复点击直接完成最后选择，清理旧计时器和动画；减少动态设置下立即切换。

浏览器边缘与页面共用随滚动变化的底色：html、body 和固定背景层采用当前渐变的中间色，日夜天空先合成，再在上下各 12% 的范围内淡入底色。光点与太阳保持独立。ThemeScript 在首屏绘制前同步 color-scheme 与 theme-color；手动切换、系统主题变化和滚动均更新同一组颜色。这样为 Safari 的边缘取色和其他浏览器的主题标签提供一致信号，浏览器控件的最终外观由浏览器决定。Lab 保留独立底色。

Karpathy Guidelines 用于代码收尾：减少重复状态和无效观察器，集中主题切换生命周期；标题悬停每帧只读取一次容器几何，不动态更改字体宽度；滚动指示器复用进度函数并合并逐帧更新。

## Shapes

内容色面为直角；控件为 4px 小圆角。摄影为矩形原图。全屏光点由点与径向透明过渡构成；章节细线和轨道为真实矢量几何，不作为内容或数据图表。

详情票面沿用纸票的轮廓：12px 圆角、两侧缺口和虚线存根；消费与餐饮小票采用 4px 上角及锯齿底边。裁切只作用于背景，文字与键盘焦点保持完整。评论编辑框为 8px 圆角，使用主题细线与透明底色。列表封面使用 4px 圆角与 2:3 竖向纸面，两侧缺口位于高度 80% 处；日期存根使用虚线，音乐会和赛事分别使用 2px、3px 实线。

## Components

- Primary button：浅色为蓝墨底浅字，深色为浅珊瑚底深字；focus 使用 2px 轮廓。
- Text link：使用共用 ArrowIcon，20×20 viewBox、1.5px 笔画、实际 1em。
- Selected writing：半透明浅色面突出博客构建文章，入场 650ms；细线仅在章节顶部。
- Article tag：至少 44×44px，格式与成熟度位于标题后的元数据。
- Life feature：照片一次 850ms 裁切展开，日光位于照片与文字背后，保留原图色彩。
- Search / Life navigation：保留搜索焦点、Escape、语言过滤、图片浏览及书影音分类计数。
- Lab focus：深蓝灰阅读底、轻透明学习区，独立 --lab-* 命名空间；首页轨道 28s/36s 反向缓慢运行。
- Lab mark：connected-W，深蓝底、浅蓝笔画与浅青圆点。SVG 是唯一来源，icons:lab 生成 PNG。
- Motion：尊重系统减少动态设置。
- Subscription：说明区直接使用页面渐变底色，不叠白色面板或分隔框。步骤与说明正文使用 UI 字体，小标题以 700 字重区分；二级标题保留 Canela Deck / 中文宋体。正文至少 16px，段落宽度不超过 65ch；手机端取消侧栏内缩，订阅地址输入框使用 16px 字体。
- Ticket face：完整详情沿用 `src/components/TicketFace.astro` 与 `src/styles/tickets.css`，保留全部票面字段及完整比例图片。列表由独立 TicketCover 呈现。
- Comments：标题沿用 Canela Deck / 中文宋体，编辑区与留言使用 UI 字体及至少 16px 正文；透明底和 8px 圆角融入现有渐变。登录身份横排，手机工具栏与提交行分开，控制项至少 44px。表情与点赞状态见下方组件规则。



### Ticket covers

`src/components/TicketCard.astro` 提供链接与独立键盘焦点，`src/components/TicketCover.astro` 负责封面内容，`src/styles/ticket-covers.css` 负责纸色、几何与分类差异。列表网格由 `src/styles/tickets.css` 提供：最小列宽 17rem（不足时占满可用宽度），间距 1.5rem；每张封面最大宽 24rem，固定比例 2:3。封面内部为类别与标题、原创图形、主要信息、日期存根四段，内边距 6%，段间距 4cqi，存根行高 24cqi。

标题采用现有标题字体，字号与行高见 `ticket-cover-title`，最多两行；英文继承 `--font-title-en`，中文继承 `--font-title-zh`。音乐会改用 UI 字体、标题 700 字重和日期 800 字重；赛事标题采用 UI 字体 800 字重。类别为 14px，字段标签与年份为 13px，字段值为 clamp(1rem, 4.8cqi, 1.125rem)，日期使用 `ticket-cover-date`。标题和日期的 cqi 相对每张封面计算。

电影使用双卷盘与两侧齿孔；音乐会使用唱片椭圆沟槽；戏剧、演出和喜剧使用舞台拱门；展览使用几何版画；赛事使用跑道；交通使用路线及对应交通图形；旅行与其他纪念使用日期邮戳。所有图形均为组件中的内联 SVG 或 CSS 几何，设为装饰，不替代真实类别文字。

封面最多显示两项真实字段，优先保留座位；交通票有起终点时显示路线。地点、字段值与可选票号各自截断，完整内容由详情提供。日期使用真实票面日期；不补造座位、航班号、旅程或活动信息。标题在悬停与键盘焦点时加下划线；焦点位于外层链接，保留 2px accent 轮廓与 4px 偏移。支持悬停且允许动态时封面上移 3px，过渡为 200ms ease-out；减少动态设置关闭该位移和过渡。

### Comments: emoji and account likes

样式范围为 `src/styles/comments.css` 的 `.comments`；行为来源为 `src/lib/comment-config.ts`、`src/lib/comment-emoji.ts`、`src/lib/comments.ts` 与 `src/lib/comment-like.ts`。评论标题、正文、主题细线、浅色面与强调色继续共享全站变量。编辑区最小高 9rem，输入焦点改变浅色底与所在框线；按钮、链接保留 2px accent 键盘轮廓。

表情选择与搜索使用本站提供的 24 个 SVG 表情和本地关键词索引，搜索支持中文与英文。弹层跟随评论区宽度，最大 33rem，使用 surface 底与 line-strong 边框；选择项为 44×44px、内边距 8px，搜索结果区最大高 14rem 并可纵向滚动。发表后的表情以 1.5em 方形嵌入文字，基线偏移 -0.25em。保留 Twemoji 授权链接与“表情与写法”说明；预览与发表结果可能有差异的语法在说明中明确标出。

点赞为登录账号对每条评论的一次永久操作。点击后爱心与计数立即显示选中状态，按钮在请求期间设置 `aria-busy` 并禁止重复提交；成功后保持选中与禁用，不提供取消点赞。280ms ease-out 跳动只在允许动态时执行。数量与账号状态由服务器核对：确定失败时恢复原状态；写入响应丢失时再次查询，仍无法确认则保持选中并提示刷新核对，避免重复计数。未登录、失败和未确认状态显示反馈；状态同时通过 `role="status"`、`aria-pressed` 与 `aria-busy` 表达。评论加载、账号切换和分页同步服务器状态。

### Personal collections

参考 [Maggie Appleton](https://maggieappleton.com) 将写作与个人收藏分别组织的方式，
以 Zoran 已有的书目、观看日期、路线和旅行文章丰富首页。保留既定渐变、字体与动效。
书架由真实封面、书名和作者构成；旅途以主图和手记组成左右布局；跑步使用可扫读的
日期和里程列表；电影使用可点击海报与片名，观看日期只参与内部排序。不同内容采用各自合适的密度，不重复套用容器。

Library 为独立双语书架，Media 是可按类型、关键词筛选的海报档案，Life 汇集这些实际
内容。封面保持原色；小图本地缓存；正文与控件继续使用共享主题变量。交互退化到静态
链接与完整列表；手机书架为两列，旅行手记和活动区域按 DOM 阅读顺序变为单列。


## Do's and Don'ts

### Do
- Do 保留文章标题、照片原色和真实学习状态。
- Do 使用语义颜色变量，检查整个渐变区间的文字对比度。
- Do 保留减少动态效果支持和后台暂停。
- Do 为主要按钮和文章标签保留至少 44px 点击高度。

### Don't
- Don’t 用空卡片或虚构项目填满首页。
- Don’t 把微动画复制到每个正文段落或制造逐段阅读等待。
- Don’t 用光点承载信息，或让装饰层接收点击、影响布局。
- Don’t 为这些动效引入 React、WebGL 或新的动画运行时。


## Personal identity and navigation — 2026-10-24

Continue the pale scroll atmosphere, with a more personal masthead and a single focal
intro. The navigation wordmark reads **zoran**, with three leaves attached above the
first and last letters like small antlers. Its serif is the project's Canela Regular.
Only the word is magenta (deep magenta by day, lighter magenta at night). The leaves
retain their existing green in each theme and stay still, including on hover/focus.
The hero currently reads **Zoran**: an understated white ping-pong ball hops over the
actual glyph tops in order, then disappears. Each load adds bounded
variation to the hops while retaining those landing positions. Serif/italic lettering and one
sans-serif o give the name character without loading additional fonts. This is an
original typographic sequence inspired by the requested animated-film opening idea.

The Garden links directly to Writing; a separate animated chevron opens a compact
single-column directory with Blog, Essays, Library and Photography, without row icons.
The mobile drawer has six links: Blog, Essays, Library, Photography, Now and About.
Essays opens the existing `/blog/formats/essay` index. Projects and other collections
stay in the full footer directory and relevant collection pages.
Language switching appears once, in the toolbar, including on narrow phones.
Now is a dated writing/journey timeline; About is a public CV with
sector-level employer descriptions. On phones, the existing toolbar stays at the top,
while the directory beneath it slides from the right. It uses large serif links, a
thin close cross in the original menu button, safe-area padding and native modal focus.

The supplied Maggie Appleton screenshots guide the three-leaf framing, four-petal /
inner-arc circular glyphs, and prominent elliptical subscription control. Glyphs change
shape on link hover/focus. The footer ends with an envelope, subscription and social
icons, plus copyright/licence. No motivational sentence is appended.
The footer gives subscription its own non-wrapping pill row, followed by a single row
of five social icons with 44px targets and 12px gaps. Below 900px, the full two-column
directory sits beneath copyright with a separating rule. Wider layouts place the
directory alongside the contact block; secondary collections remain reachable without
crowding the drawer or compressing the subscription control.

Headings share the main ink in both themes. Canela, Canela Deck and Noto Serif SC
create section differences through type, scale and rhythm.
Existing accent tokens remain available for controls and the small geometric icons.
Mobile sections retain distinct spacing and visual leads, avoiding one continuous wall
of equally weighted text. The route list uses geometric hover glyphs and text metadata;
it never fetches preview routes. Cinema uses clickable covers and titles; dates remain
internal sort metadata, and only neighbouring covers blur during pointer selection.

Source lint exceptions are limited to the real dropdown's elevation and the structural
Now timeline connector. The user's ball animation, static leaf wordmark, mixed lettering and
existing gradients take precedence over generic skill style restrictions. Final checks
remain code and build only; visual timing and rendering acceptance stay with the user.

## Mobile reading layout — 2026-10-25

The supplied Picsew PDF guides the single-column reading order and two-column book
shelf. At widths below 640px, homepage section headings, descriptions and collection
links stack; descriptions keep the full reading width. Sections use 3rem vertical
padding, while titles and their descriptions stay close. The current-learning text
sits in the page flow instead of an inset tinted box.

Little moments groups the landscape image, location/date, article title and summary
into one featured entry. Recent reflections form a separate list with titles first,
dates second and subtle separators. The collection link follows both groups. Desktop
keeps the feature and the list beside each other; below 768px they stack in that order.

Route details show date/location in one row and available distance/duration/elevation
in a separate equal-width row. Their shared container uses only top/bottom rules, with
no clipped grid or empty fifth tile. The article's own Markdown heading introduces
the story; the layout adds no duplicate STORY label and no extra first-heading rule.

The mobile modal temporarily contains the existing toolbar so its controls and focus
stay usable. Only the independently scrollable directory animates (320ms in / 240ms
out). Close, Escape, desktop resizing, page exit and reduced-motion changes restore
scrolling and the toolbar. The logo, language, search and theme controls remain the
same DOM elements. Reduced motion skips the slide.


### 随记预览（2026-10-25）

首页始终只展示最新一条随记；文字最多 5 行，配图最多 3 张。随记列表每页 10 条，每条文字最多 8 行、
配图最多 6 张；详情保留完整图文。单图保留完整画面，多图采用紧凑网格，超出部分以 +N 表示。
文字预览使用现有正文字体，时间和可选地点使用辅助文字样式；不增加滚动动画或地图加载。
缩略图预留比例、延迟加载，正文和相册的完整内容通过明确链接访问。
