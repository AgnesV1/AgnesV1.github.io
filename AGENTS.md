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

- 栏目结构：`blog`（笔记，含阅读笔记，用 tags 区分）和 `writing`（虚构写作）两个 content collection；「摄影 Photos」是导航外链，在 `src/consts.ts` 填 `PHOTOS_URL` 后自动出现。
- 双语：全站中英切换按钮在页头（`LangToggle`，写入 `html[data-lang]` + localStorage）；页面元素用 `.only-zh` / `.only-en` 类按语言显隐。文章配对翻译的约定是 `foo.md`（中文）+ `foo.en.md`（英文），URL 为 `/blog/foo/` 与 `/blog/foo/en/`，页面自动互链；双语配对只用于 blog，不用于 writing。
- 文章 frontmatter：`lang: zh | en`（默认 zh）；`tags` 渲染为彩色小标签；可选 `references`（字符串或 `{title, url?, author?}` 数组）会在文末渲染为可折叠的参考文献区块，不写就不显示。
- 设计语言是「极简排版 + 柔和多巴胺色」：颜色/字体变量集中在 `src/styles/global.css` 顶部的 `:root` 和 `[data-theme='dark']`，改配色只动那里。
- 站点标题、简介、社交链接在 `src/consts.ts`；`YOUTUBE_URL` / `INSTAGRAM_URL` 填上后页头自动显示对应图标。
- 新文章：`npm run new -- "标题" [slug] [--en] [--bilingual] [--writing] [--video]`；发布：`npm run up`（commit + push，GitHub Actions 自动部署）。
- 公开仓库的提交信息一律用简洁专业的英文（`up.mjs` 不传信息时会自动生成，如 `Add post: slug`）；不要在提交信息里写设计思路或实现细节。
- RSS：`/rss.xml` 合并 blog + writing，跳过 `.en` 配对翻译避免重复条目。
- 嵌 YouTube 视频的文章用 `.mdx` + `@astro-community/astro-embed-youtube` 的 `<YouTube id="..." />`。
- OG 分享图：`node scripts/gen-og.mjs` 重新生成 `public/og.png`。
- 注意：本机 `~/.npm` 缓存目录含 root 拥有的文件，跑 `npm install` 会 EACCES 报错，需要加 `--cache <其他目录>` 或先 `sudo chown -R $(whoami) ~/.npm` 修复。
