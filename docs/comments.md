# 评论区维护

文章、随记和票根详情底部使用 Waline 评论，服务地址为 `https://zorancomment.xyz`。首页、栏目列表、相册、足迹、项目与 Web3 Lab 页面不显示评论区。

## 使用与管理

读者滚动到评论区附近时，网站加载评论；也可以点「加载评论」。评论表单只要求昵称，不展示邮箱字段；评论列表保留头像，但匿名或服务端默认头像会从网站本地头像池中按评论 ID 稳定选择一个随机头像，已登录用户的自定义头像不替换。位置、浏览器和系统信息不显示。登录入口保留。文字留言最长 2000 字。表情按钮提供 24 个本地 Twemoji，可用中文或英文关键词搜索；也支持手机自带表情。折叠的「表情与写法」说明 Markdown 用法和预览范围。图片上传、外部 GIF 搜索、文章表态与浏览量统计关闭。

评论保存在你现有的 Waline 服务中，不写入网站 Markdown，也不随网站重新构建而删除。审核、删除留言、注册登录及邮件通知由 Waline 服务端管理，网站仓库只负责显示。服务端仓库为 `zoran-sid/waline`，使用 Neon PostgreSQL。2026-10-28 已经作者授权发布账号点赞插件；邮件通知仍使用服务端已有配置。

如果要同时停止 Waline 服务端对这些信息的解析和保存，需要在 `zorancomment.xyz`
对应的 Waline 服务环境变量中设置：

```text
DISABLE_REGION=true
DISABLE_USERAGENT=true
```

仅修改网站 CSS 只能隐藏已有数据，不能代替服务端隐私配置。

## 页面和语言

评论区提供「订阅本文评论」和「按文章订阅全部评论」两个 RSS 入口。阅读器列表以文章标题显示，每篇文章只有一个条目；打开后可阅读该文的公开评论、回复对象和香港时间。原文链接定位到文章的评论区。

全部评论继续使用 `https://zorancomment.xyz/api/comment/rss`，单篇使用该地址的 `path` 参数。新评论更新同一文章条目，GUID 保持稳定；阅读器如何将更新标为未读由软件决定。旧版按单条评论显示的缓存可能仍留在阅读器中，需要在那里清理或重新添加订阅。

网站静态生成 `comment-pages.json`，只包含已发布、开放评论页面的路径、标题和语言。Waline 的 `article-feed.cjs` 从这个固定地址读取标题与公开页面范围；主域名不可读时使用同一网站的 `zoranzhou-com.pages.dev` 域名。两处均读取失败则暂停输出，避免展示未经公开页面范围筛选的评论。沿用 Waline 的评论审核条件和 Markdown 清理，不会读取邮箱、IP 或认证令牌。数据库没有新增表和写操作；`email` / `user_id` 定向回复订阅保持 Waline 原有规则。

每个页面以去掉末尾斜杠的路径作为评论标识；网址中的查询参数与锚点不会生成新的讨论串。中文与英文使用各自的路径，评论分开。改标题不会改变评论；修改文章或票根的 slug 会改变路径，需保留原标识或另做迁移。

## 本地文件

- `src/components/Comments.astro`：共同的评论区入口。
- `src/lib/comment-config.ts`：服务地址、语言、页面标识和功能配置。
- `src/lib/comments.ts`：进入视口后加载、手动重试和离开页面后的清理。
- `src/lib/comment-emoji.ts` 和 `public/comment-emojis/`：24 个本地表情及双语搜索；图形来源、固定版本和 CC BY 4.0 授权保存在该目录。
- `src/styles/comments.css`：本地样式，使用网站的字体、文字色、线条和背景变量。
- `public/comment-avatars/`：从提供的 Userpics 头像包提取的 100 个圆形 PNG，仅用于匿名/默认评论头像；头像包授权信息见 [Craftwork Design License](https://craftwork.design/license/)。
- `src/layouts/BlogPostLayout.astro` 与票根详情页：决定显示范围。

客户端固定使用 `@waline/client` 3.16.1，由网站本地打包，不使用浮动版本 CDN。暗黑模式跟随 `html.dark`，切换主题时不需要重新加载。网站不保存 Waline 管理员密码、数据库信息或服务端密钥。

登录后的头像和名字横排在输入框上方，手机与电脑保持同一阅读顺序。输入时使用轻边框和主题底色；提交按钮固定为 44px 高，手机端放在工具栏下方右侧。

登录后才能点赞。每个账号对每条评论只能点赞一次，刷新或换设备后从服务端恢复状态，已点赞按钮保持选中。点赞时爱心和数量立即更新，并跳动一次；「减少动态效果」模式关闭跳动。

服务器以评论 ID 和账号 ID 的联合主键保证唯一，通过同一条 SQL 同时记录账号和增加总数。首次认证请求会创建 `<现有表前缀>comment_likes` 表；Neon 连接账号需要建表权限，连接配置沿用 Waline 现有环境变量。旧评论与原有点赞总数保留；旧匿名点赞没有账号信息，不回溯分配。

原故障发生在 Waline 保存点赞后格式化响应：评论文本被内存更新对象覆盖为空值，导致响应报错。插件读取 ThinkJS 解析后的 `ctx.request.body.post`，拦截实际点赞写入并直接返回账号状态和总数，避免进入这段格式化流程。测试包含真实 HTTP 请求解析，防止去重被绕过。若网络丢失保存响应，网站再查询该账号的状态：确认成功则保留，确认未保存才恢复；无法核对时提示刷新确认，不重复增加。前端只接受 `account-likes-v1` 协议，不会退回匿名增减接口。点击前和请求期间发出的旧状态查询会失效，避免它们在保存成功后清掉爱心。

服务端文件为 `account-likes.cjs`，维护说明和本地 PostgreSQL 测试在服务端仓库的 `ACCOUNT-LIKES.md` 与 `test/account-likes.test.cjs`。服务端更新和网站更新分别提交；数据库密码与认证令牌不进入任何仓库。

`scripts/waline-like-plugin.mjs` 在开发和构建时替换客户端 3.16.1 的点赞处理函数，
调用 `src/lib/comment-like.ts`；其余渲染和接口继续由 Waline 管理，不修改
`node_modules`。补丁严格校验版本和原函数，升级 Waline 时需重新核对并运行测试，
不能直接删除校验。`src/lib/comments.ts` 负责按钮忙碌状态、动画和操作提示。

`public/_headers` 的 `Cross-Origin-Opener-Policy` 使用 `same-origin-allow-popups`，允许 Waline 电脑版登录弹窗把登录状态传回本站。手机端采用 Waline 自带的登录跳转；这两种行为由客户端维护。

## 检查

`npm run test:comments` 检查评论路径、配置、本地表情、登录限制、单次点赞、账号切换、丢失响应核对与补丁版本；`npm run test:tickets-build` 用临时内容核对票根、随记的评论入口及列表页排除规则。运行后重新执行 `npm run build` 生成正式网站，再执行 `npm run test:site-build`。

已通过本地 PostgreSQL SQL 测试、前端状态测试与网站构建。发布后只读请求确认匿名访问账号点赞接口返回 401；没有向线上发送测试留言或点赞。真实账号的跨设备操作由作者实际使用时核对。

官方参考：[快速开始](https://waline.js.org/guide/get-started/)、[客户端选项](https://waline.js.org/reference/client/props.html)、[自定义样式](https://waline.js.org/guide/features/style.html)。
