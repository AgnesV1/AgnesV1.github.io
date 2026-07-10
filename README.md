# agnesv1.github.io

Agnes 的个人网站：[https://agnesv1.github.io](https://agnesv1.github.io)

Astro 搭建，GitHub Pages 托管。推送到 `main` 分支后，GitHub Actions 会自动构建并部署，约 1-2 分钟生效。

## ✍️ 日常写文章（只需要这三步）

```bash
npm run new -- "文章标题"     # 1. 新建一篇文章
# 2. 用任意编辑器打开生成的 .md 文件写正文
npm run up                    # 3. 发布上线
```

`npm run new` 的更多用法：

```bash
npm run new -- "标题" my-post-slug   # 指定 URL（推荐，中文标题时更好看）
npm run new -- "Title" --en          # 英文文章
npm run new -- "标题" --video        # 要嵌 YouTube 视频的文章（生成 .mdx）
```

## 📄 文章格式

每篇文章是 `src/content/blog/` 里的一个 Markdown 文件，开头的 frontmatter：

```yaml
---
title: '文章标题'
description: '一句话摘要，显示在 RSS 和分享卡片里'
pubDate: 2026-07-10
lang: zh # zh 中文 / en 英文，首页可按语言筛选
tags: ['随笔'] # 任意标签，会显示成彩色小标签
---
```

## 📺 嵌入 YouTube 视频

文件后缀用 `.mdx`，然后：

```mdx
import { YouTube } from '@astro-community/astro-embed-youtube';

<YouTube id="视频ID" />
```

以后有自己的频道了，在 `src/consts.ts` 里填上 `YOUTUBE_URL`，页头会自动出现 YouTube 图标。

## 🎨 想改点什么

| 想改的东西       | 去哪里改                                     |
| ---------------- | -------------------------------------------- |
| 站名、简介、链接 | `src/consts.ts`                              |
| 配色、字体、排版 | `src/styles/global.css`（颜色变量在最上面） |
| 首页的自我介绍   | `src/pages/index.astro`                      |
| 关于页           | `src/pages/about.astro`                      |

## 🖥 本地预览

```bash
npm run dev       # 打开 http://localhost:4321
npm run build     # 构建检查
```
