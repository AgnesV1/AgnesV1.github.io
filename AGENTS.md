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

- 站名是「s_k_y_l_a_r_k_i_n_g ／ 荒腔走板」（`src/consts.ts` 的 `SITE_TITLE`，用全角 ／ 分隔）；页头 `Header.astro` 会按 ／ 拆开渲染成两行式字标（名字一行、导航一行），斜杠是珊瑚色点缀。首页 hero 大标题和 `SITE_DESCRIPTION` 都是 `s_k_y_l_a_r_k_i_n_g`；站内 UI 不再出现 Agnes（GitHub 账号名除外）。
- 栏目显示名随语言切换（`.only-zh`/`.only-en`）：中文态是 致云雀 / 夜莺颂 / 镜花水月，英文态是 Notes / Fiction / Photos。`blog` collection 对应致云雀（URL `/` 和 `/blog/…`），`writing` 对应夜莺颂（`/writing/…`），镜花水月是站内页面 `/photos`（朋友圈式时间线：左侧年份、右侧瀑布流照片墙 + 置顶区 + 灯箱）——改过显示名但路由从未动过。About 页只有一句话（Kino 之旅的 "The world is not beautiful, therefore it is."），独立极简排版。
- 摄影页加照片零配置：照片放 `src/assets/photos/<年份>/`（如 `2026/`），置顶的放 `src/assets/photos/pinned/`；组内按文件名倒序，建议命名 `YYYY-MM-描述.jpg`；文件名去掉日期前缀后即照片说明（连字符变空格，中文文件名可直接用）。放别的目录名会按目录名单独分组。现有的 9 张是渐变占位图（画面角落有 sample 字样），换真照片时直接删掉。
- 双语：全站中英切换按钮在页头（`LangToggle`，写入 `html[data-lang]` + localStorage）；页面元素用 `.only-zh` / `.only-en` 类按语言显隐。文章配对翻译的约定是 `foo.md`（中文）+ `foo.en.md`（英文），URL 为 `/blog/foo/` 与 `/blog/foo/en/`，页面自动互链；双语配对只用于 blog，不用于 writing。
- 文章 frontmatter：`lang: zh | en`（默认 zh）；`tags` 渲染为彩色小标签；可选 `references`（字符串或 `{title, url?, author?}` 数组）会在文末渲染为可折叠的参考文献区块，不写就不显示。
- 文章页三栏（blog 和 writing 都启用）：宽屏 ≥1160px 时左侧是按年份分组的时间轴（`NoteTimeline.astro`，各自栏目只列各自的文章，纯时间轴、无导航），右侧是文内目录（`Toc.astro`，自动取 Markdown h2–h4，滚动高亮当前小节，零配置）；窄屏两栏自动隐藏，改为右下角浮标拉出底部目录抽屉（文中没有小标题就不出现目录和浮标）。数据在 `src/pages/blog/[...slug].astro` 和 `src/pages/writing/[...slug].astro` 里算好传给 `BlogPost.astro` 的 `headings`/`timeline`/`currentId` props。
- 防剧透（星尘遮掩）：正文里写 `||要隐藏的文字||`，构建时由 `scripts/rehype-hidden-text.mjs` 转成 `<hidden-text data-t="base64">`（HTML 源码不出现明文，占位乱码按字宽生成保证行宽一致）；运行时 `HiddenText.astro`（挂在 BlogPost 布局）把隐藏段画成闪烁星尘（夜间白色、日间五彩），点击展开并播放消散动画，点空白或另一段自动收起（互斥），复制/剪切/拖拽只能拿到 █。跨行藏文字用行末双空格硬换行；`||` 只能在同一段落内配对；code/pre 里不生效。示例见 `src/content/writing/night-train.md`。
- 页头折叠导航：≤640px 时栏目链接和社交图标收进汉堡菜单（`Header.astro`），页头只留 logo + 语言/主题切换 + ☰。
- 列表筛选：首页和 `/writing` 用 `FilterBar.astro`（标签多选 = 命中任一即显示；年份多选、横向可滚；标签组与年份组之间取交集）。纯前端过滤，状态写入 URL `?tag=…&year=…`，刷新/分享保留；列表 `li` 需带 `data-tags="a|b"` 和 `data-year`。标签为空或年份只有一个时对应行自动不渲染。
- 设计语言是「极简排版 + 柔和多巴胺色」：颜色/字体变量集中在 `src/styles/global.css` 顶部的 `:root` 和 `[data-theme='dark']`，改配色只动那里。
- 站点标题、简介、社交链接在 `src/consts.ts`；`YOUTUBE_URL` / `INSTAGRAM_URL` 填上后页头自动显示对应图标。
- 新文章：`npm run new -- "标题" [slug] [--en] [--bilingual] [--writing] [--video]`；发布：`npm run up`（commit + push，GitHub Actions 自动部署）。
- 公开仓库的提交信息一律用简洁专业的英文（`up.mjs` 不传信息时会自动生成，如 `Add post: slug`）；不要在提交信息里写设计思路或实现细节。
- RSS：`/rss.xml` 合并 blog + writing，跳过 `.en` 配对翻译避免重复条目。
- 嵌 YouTube 视频的文章用 `.mdx` + `@astro-community/astro-embed-youtube` 的 `<YouTube id="..." />`。
- OG 分享图：`node scripts/gen-og.mjs` 重新生成 `public/og.png`。
- 注意：本机 `~/.npm` 缓存目录含 root 拥有的文件，跑 `npm install` 会 EACCES 报错，需要加 `--cache <其他目录>` 或先 `sudo chown -R $(whoami) ~/.npm` 修复。
