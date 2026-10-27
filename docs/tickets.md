# 票根：用手机收好生活中的纪念

网站的「生活 → 票根」展示公开精选票根。支持电影、演出、展览、赛事、火车、机票和其他类型，按票面日期从近到远排列。英文入口为 Life → Ticket Box。

## 在手机或电脑发布

1. 打开 [Pages CMS](https://app.pagescms.org/)，选择网站仓库和用于发布的分支。
2. 进入「票根」，新建一条，填写**名称、票面日期、类型**。
3. 在「分类票面信息」中选择与类型对应的模板。电影、演出、赛事、火车、机票、
   展览、消费小票、餐饮小票、发票、旅行和其他类型各自有不同的字段，不需要
   填写其他分类的选项。顶层「类型」仍用于网站筛选，请和模板保持一致。
4. 按需要选照片、写地点或故事。只填三个必填项，也能发布文字票根。
5. 如需关联随记，在「关联随记」中搜索标题并选择；留空即可独立发布。
6. 保存。Pages CMS 会提交到 GitHub，网站构建完成后显示。新增这个栏目不需要另设密钥或后台服务。

照片上传后就会进入公开仓库，保存前请遮住二维码、条码、订单号、证件资料和不想公开的姓名。CMS 直传不保证移除照片的定位信息，上传前使用处理好的图片。私人原件保留在自己的设备。

## 浏览与关联

- 票根墙只显示名称、类型、日期和可选地点，照片放在详情中。筛选项只出现已有内容的类型。
- 详情保留照片完整画面，可以点击查看原图；故事可长可短。多图在手机上依次排列，后续图片延迟加载。
- 一张票根选一条随记；一条随记可以关联多张票根。只在票根中选择一次，随记详情就会自动显示这些票根。
- 关联使用稳定的随记标识，改标题不影响链接。删除随记、清空正文或改成未公开状态后，关联入口不再显示。
- 可以关联另一种语言的随记，链接旁会标出语言。页面界面中英分开，内容不会自动翻译。
- 票根不加入文章 RSS，也不会因新增票根或关联而触发文章订阅邮件。

## 文件与维护

- CMS 配置：`.pages.yml`；原文：`src/content/tickets/ticket-<UUID>.md`；照片：`public/ticket-images/`。
- `date` 是票面日期，使用 `YYYY-MM-DD`；不带时间或时区，和上传日期无关。
- `type`：`movie` / `concert` / `theatre` / `comedy` / `performance` /
  `exhibition` / `sport` / `train` / `flight` / `receipt` / `dining` /
  `invoice` / `travel` / `other`。`performance` 保留给旧票根。
- `details`：Pages CMS 的分类票面模板对象，使用 `variant` 保存模板名称，
  其余字段按模板变化；它是可选的，不影响旧票根。
- `photos` 为图片路径列表；`location` 为可选地点；Markdown 正文为故事；`note` 保存关联随记的 `slug`。
- `lang` 为 `zh-CN` 或 `en`。手工准备译文时，可用相同 `translationKey` 配对不同语言的票根；没有译文时，语言切换返回另一语言的票根列表。
- `publication: approved` 才会公开，`draft: true` 始终隐藏。公开仓库不能作为私人草稿库。

执行 `npm run test:tickets` 检查日期、关联、CMS 配置与草稿资源规则。`npm run test:tickets-build` 会写入临时测试条目、构建并核对详情、双向关联、搜索、RSS 和站内链接，然后清理测试源文件。随后运行 `npm run build` 重新生成正式产物，再执行 `npm run test:site-build`。不要发布含测试条目的中间产物。

CMS 配置依据官方 [Reference 字段](https://pagescms.org/docs/configuration/fields/reference/) 和 [Image 字段](https://pagescms.org/docs/configuration/fields/image/) 文档。原有随记编辑入口和日期格式保持不变。
