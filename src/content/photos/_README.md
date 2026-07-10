# 添加照片

照片页现在直接读取本目录中的 Markdown 文件。以下划线开头的文件不会参与构建，因此这份说明可以安全保留在这里。

每个语言版本使用一个文件：

- 英文：`my-album.md`
- 中文：`my-album.zh-CN.md`

复制下面的内容到新文件，修改信息并在 `gallery` 中添加任意数量的照片即可：

```yaml
---
title: Hangzhou Night Walk
description: A short walk after the rain.
date: 2026-07-10
tags: ["Photography", "Street"]
lang: en
location: Hangzhou
camera: Sony A7C II · 35mm F2.8
gallery:
  - src: https://example.com/photo-01.jpg
    alt: Reflections on a wet street
    caption: After the summer rain.
  - src: https://example.com/photo-02.jpg
    alt: A neon sign at night
---
```

字段说明：

- `title`、`date`、`lang` 是必填项。
- `description`、`location`、`camera`、`caption` 可以省略。
- `gallery` 中的顺序就是照片在图库中的顺序。
- `lang` 只能是 `en` 或 `zh-CN`；两个语言文件可以引用相同图片。
- 文件发布后会自动加入照片平铺页，不需要再修改 TypeScript 数据文件。
