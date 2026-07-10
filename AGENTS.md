## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## 项目约定

- 双语博客：文章 frontmatter 用 `lang: zh | en` 标记语言（默认 zh），首页据此筛选；`tags` 渲染为彩色小标签。
- 设计语言是「极简排版 + 柔和多巴胺色」：颜色/字体变量集中在 `src/styles/global.css` 顶部的 `:root` 和 `[data-theme='dark']`，改配色只动那里。
- 站点标题、简介、社交链接在 `src/consts.ts`；`YOUTUBE_URL` 填上后页头/页脚自动显示 YouTube 入口。
- 新文章：`npm run new -- "标题" [slug] [--en] [--video]`；发布：`npm run up`（commit + push，GitHub Actions 自动部署到 GitHub Pages）。
- 嵌 YouTube 视频的文章用 `.mdx` + `@astro-community/astro-embed-youtube` 的 `<YouTube id="..." />`。
- OG 分享图：`node scripts/gen-og.mjs` 重新生成 `public/og.png`。
- 注意：本机 `~/.npm` 缓存目录含 root 拥有的文件，跑 `npm install` 会 EACCES 报错，需要加 `--cache <其他目录>` 或先 `sudo chown -R $(whoami) ~/.npm` 修复。
