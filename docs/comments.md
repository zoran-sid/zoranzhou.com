# 评论区维护

文章、随记和票根详情底部使用 Waline 评论，服务地址为 `https://zorancomment.xyz`。首页、栏目列表、相册、足迹、项目与 Web3 Lab 页面不显示评论区。

## 使用与管理

读者滚动到评论区附近时，网站加载评论；也可以点「加载评论」。评论表单只要求昵称，不展示邮箱字段；评论列表保留头像，但匿名或服务端默认头像会从网站本地头像池中按评论 ID 稳定选择一个随机头像，已登录用户的自定义头像不替换。位置、浏览器和系统信息不显示。登录入口保留。文字留言最长 2000 字，图片上传、GIF 搜索、表情选择与浏览量统计关闭。

评论保存在你现有的 Waline 服务中，不写入网站 Markdown，也不随网站重新构建而删除。审核、删除留言、注册登录及邮件通知由 Waline 服务端管理，网站仓库只负责显示。服务端仓库为 `zoran-sid/waline`，本次接入没有修改它的配置。

如果要同时停止 Waline 服务端对这些信息的解析和保存，需要在 `zorancomment.xyz`
对应的 Waline 服务环境变量中设置：

```text
DISABLE_REGION=true
DISABLE_USERAGENT=true
```

仅修改网站 CSS 只能隐藏已有数据，不能代替服务端隐私配置。

## 页面和语言

每个页面以去掉末尾斜杠的路径作为评论标识；网址中的查询参数与锚点不会生成新的讨论串。中文与英文使用各自的路径，评论分开。改标题不会改变评论；修改文章或票根的 slug 会改变路径，需保留原标识或另做迁移。

## 本地文件

- `src/components/Comments.astro`：共同的评论区入口。
- `src/lib/comment-config.ts`：服务地址、语言、页面标识和功能配置。
- `src/lib/comments.ts`：进入视口后加载、手动重试和离开页面后的清理。
- `src/styles/comments.css`：本地样式，使用网站的字体、文字色、线条和背景变量。
- `public/comment-avatars/`：从提供的 Userpics 头像包提取的 100 个圆形 PNG，仅用于匿名/默认评论头像；头像包授权信息见 [Craftwork Design License](https://craftwork.design/license/)。
- `src/layouts/BlogPostLayout.astro` 与票根详情页：决定显示范围。

客户端固定使用 `@waline/client` 3.16.1，由网站本地打包，不使用浮动版本 CDN。暗黑模式跟随 `html.dark`，切换主题时不需要重新加载。网站不保存 Waline 管理员密码、数据库信息或服务端密钥。

`public/_headers` 的 `Cross-Origin-Opener-Policy` 使用 `same-origin-allow-popups`，允许 Waline 电脑版登录弹窗把登录状态传回本站。手机端采用 Waline 自带的登录跳转；这两种行为由客户端维护。

## 检查

`npm run test:comments` 检查评论路径与配置；`npm run test:tickets-build` 用临时内容核对票根、随记的评论入口及列表页排除规则。运行后重新执行 `npm run build` 生成正式网站，再执行 `npm run test:site-build`。

接入时已验证服务的评论读取接口可访问，并允许网站域名的跨域请求。没有向线上发送测试留言；实际提交、登录和通知仍依赖服务端配置。

官方参考：[快速开始](https://waline.js.org/guide/get-started/)、[客户端选项](https://waline.js.org/reference/client/props.html)、[自定义样式](https://waline.js.org/guide/features/style.html)。
