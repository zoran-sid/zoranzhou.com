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
  code:
    fontFamily: JetBrains Mono Variable, SFMono-Regular, Consolas, monospace
    fontSize: 1rem
    lineHeight: 1.9
rounded:
  control: 4px
  flat: "0"
spacing:
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
  section: 64px
components:
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

## Typography

使用项目已有的三款 Canela 字体：Canela Regular 用于 zoran 字标和首页署名，Canela Deck Regular 用于英文栏目与文章标题，Canela Text Regular 用于英文正文。中文标题由 Noto Serif SC 承接，正文用系统中文黑体；Lato 与系统黑体用于导航、按钮、日期和路线数据。JetBrains Mono Variable 用于代码。所有字体均本地提供并使用 swap；只引用实际存在的 Regular 文件，不假设截图中的 Light、Medium 已在项目中。

标题使用 Regular 400，以字号和留白建立层级。中文标题字距为 0，行高 1.4；英文标题字距 -0.018em，行高 1.25。正文中文行高 1.9、英文 1.8。首页署名保留艺术字变化与乒乓球动画；手机字号为 clamp(2.8rem, 13.8vw, 5.8rem)。手机栏目标题约 30–36px，文章列表约 19–24px，正文至少 16px，日期等辅助信息至少 13px。保留原始长标题，允许自然换行。

## Layout

主站最大宽 76rem；长文为 42rem 正文和 14rem 目录，间距 5rem。首页以署名与近况开篇，接真实笔记（有内容时）、精选文章、项目（有内容时）、封面书架、旅行手记，以及并列的跑步记录和最近观影。Writing 是分类与时间列表，Projects 是实际实践，Life 以摄影开篇，About 是头像与个人背景。Lab 保留当前学习与分阶段计划。

断点为 640、768、900、1024、1280px，具体组件按内容选择。窄屏单列，目录折叠，代码与表格在阅读列内部滚动。装饰层使用绝对或固定定位，不参与排版和命中测试。

## Elevation & Depth

全屏背景固定于视口，颜色由滚动进度插值，140ms 时间常数使滚动停止后自然收住。微光点是 108 个确定位置、分为 9 组的 SVG 光点，缓慢漂移 18–28.4s；手机隐藏部分组并减小位移。无需 Canvas、滤镜模糊或动画依赖。

**The Motion Rule.** 动态服务章节节奏。全屏光点串联阅读；精选文章使用细线随滚动延展，生活部分使用柔和日光漂移，项目与 Lab 使用慢速轨道。正文段落不逐段动画。内容默认可见，JavaScript 失败时仍可阅读。

尊重 prefers-reduced-motion，保留静态渐变和光点。离开视口的章节动画暂停，隐藏标签页暂停光点、星光和章节循环。主题切换在隐藏页面时直接完成；滚动补间只在需要更新时申请帧。打印隐藏全部装饰。

日夜切换为 1.8s：日光 → 浅杏与灰紫余晖 → 炭灰夜色，太阳沿右侧天空落下；切回浅色时反向升起。背景由日间、黄昏、夜间三层透明度组合，太阳独立于低透明度光点层。阅读主题在日落 62% / 日出 38% 时切换，避免一开始就把白字放上白天背景。快速重复点击直接完成最后选择，清理旧计时器和动画；减少动态设置下立即切换。

Karpathy Guidelines 用于代码收尾：减少重复状态和无效观察器，集中主题切换生命周期；标题悬停每帧只读取一次容器几何，不动态更改字体宽度；滚动指示器复用进度函数并合并逐帧更新。

## Shapes

内容色面为直角；控件为 4px 小圆角。摄影为矩形原图。全屏光点由点与径向透明过渡构成；章节细线和轨道为真实矢量几何，不作为内容或数据图表。

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
The mobile footer displays the full directory in two columns after copyright,
with 44px link targets; secondary collections remain reachable without crowding the drawer.

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
