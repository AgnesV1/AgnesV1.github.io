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
- 栏目显示名随语言切换（`.only-zh`/`.only-en`）：中文态是 致云雀 / 夜莺颂 / 镜花水月，英文态是 Notes / Fiction / Photos。`blog` collection 对应致云雀（URL `/` 和 `/blog/…`），`writing` 对应夜莺颂（`/writing/…`），镜花水月是站内页面 `/photos`（时间线：左侧年份、右侧「星球」缩略图墙 + 置顶区 + 灯箱。缩略图是圆形星球风——服务端裁成 200×200 方图（`fit="cover" position="attention"`，sharp 智能选取画面重点区域），六档大小错落、缓慢飘浮动画（周期/相位各不相同，`prefers-reduced-motion` 下关闭）、描边光晕随所在行五色轮换（置顶行是 `--sun` 黄）、`::after` 叠球面光影；点开灯箱看原比例大图，开启时有 0.28s 弹出动效。想调整：圆的六档尺寸在 `.photo:nth-child(6n+…)` 的 `--s`，飘浮快慢在 `animation-duration`，裁剪重心可把 `position` 改回 `"center"`）——改过显示名但路由从未动过。About 页只有一句话（Kino 之旅的 "The world is not beautiful, therefore it is."），独立极简排版。
- 摄影页加照片零配置：照片放 `src/assets/photos/<年份>/`（如 `2026/`），置顶的放 `src/assets/photos/pinned/`；组内按文件名倒序，建议命名 `YYYY-MM-描述.jpg`；文件名去掉日期前缀后即照片说明（连字符变空格，中文文件名可直接用）。放别的目录名会按目录名单独分组。现有的 9 张是渐变占位图（画面角落有 sample 字样），换真照片时直接删掉。
- 双语：全站中英切换按钮在页头（`LangToggle`，写入 `html[data-lang]` + localStorage）；页面元素用 `.only-zh` / `.only-en` 类按语言显隐。文章配对翻译的约定是 `foo.md`（中文）+ `foo.en.md`（英文），URL 为 `/blog/foo/` 与 `/blog/foo/en/`，页面自动互链；双语配对只用于 blog，不用于 writing。
- 文章 frontmatter：`lang: zh | en`（默认 zh）；`tags` 渲染为彩色小标签；可选 `references`（字符串或 `{title, url?, author?}` 数组）会在文末渲染为可折叠的参考文献区块，不写就不显示。
- 文章页三栏（blog 和 writing 都启用）：宽屏 ≥1160px 时左侧是按年份分组的时间轴（`NoteTimeline.astro`，各自栏目只列各自的文章，纯时间轴、无导航），右侧是文内目录（`Toc.astro`，自动取 Markdown h2–h4，滚动高亮当前小节，零配置）；窄屏两栏自动隐藏，改为右下角浮标拉出底部目录抽屉（文中没有小标题就不出现目录和浮标）。数据在 `src/pages/blog/[...slug].astro` 和 `src/pages/writing/[...slug].astro` 里算好传给 `BlogPost.astro` 的 `headings`/`timeline`/`currentId` props。
- 防剧透（星尘遮掩）：正文里写 `||要隐藏的文字||`，构建时由 `scripts/rehype-hidden-text.mjs` 转成 `<hidden-text data-t="base64">`（HTML 源码不出现明文，占位乱码按字宽生成保证行宽一致）；运行时 `HiddenText.astro`（挂在 BlogPost 布局）把隐藏段画成闪烁星尘（夜间白色、日间五彩），点击展开并播放消散动画，点空白或另一段自动收起（互斥），复制/剪切/拖拽只能拿到 █。跨行藏文字用行末双空格硬换行；`||` 只能在同一段落内配对；code/pre 里不生效。示例见 `src/content/writing/night-train.md`。性能：绘制循环在页面上没有任何可见隐藏段时整帧跳过（列表页短札全部收起时零开销），改动 drawDots 时别丢了这个 jobs 空跳逻辑。
- 页头折叠导航：≤640px 时栏目链接和社交图标收进汉堡菜单（`Header.astro`），页头只留 logo + 语言/主题切换 + ☰。
- 列表筛选：首页和 `/writing` 用 `FilterBar.astro`（标签多选 = 命中任一即显示；年份多选、横向可滚；标签组与年份组之间取交集）。纯前端过滤，状态写入 URL `?tag=…&year=…`，刷新/分享保留；列表 `li` 需带 `data-tags="a|b"` 和 `data-year`。标签为空或年份只有一个时对应行自动不渲染。筛选脚本对页面里所有 `.post-list` / `.cards-wall` 容器同时生效（/writing 的长篇列表和短札墙一起过滤）。
- 短札（cards）：`src/content/cards/` 独立 collection，千字以内短文本，**不生成详情页**（`CardNote.astro` 渲染）。frontmatter 与长文同 schema 但 `title` 可选，多一个 `section: notes | fiction` 区分归属：`notes` 混进首页时间流（浅底 + 左边框），`fiction` 铺在 `/writing` 下方便签墙（五色浅底 + 微倾便签，flex 错落布局——收起时每张宽度随文本长短自适应、一行自动挤放、展开的那张独占整行；上方长篇列表包在可折叠 `<details>` 里，默认展开）。**交互**：默认收起成一行（日期 + 标题/正文纯文本预览 + tags，预览会把 `||…||` 换成 ✦✦✦ 防剧透），点卡片原地展开全文、点其他区域或再点收起、同时只展开一张（互斥，同星尘逻辑）；URL 直链 `#c-<文件名>`（点卡片日期即得）自动展开对应卡。中英配对沿用 `foo.md`+`foo.en.md`（`data-base` 带 `card:` 前缀防和长文混组）。短札里可用 `||星尘遮掩||`（首页和 /writing 都挂了 `HiddenText.astro`）。RSS 里短札全文输出（`rss.xml.js` 用 Container API 走站内管线渲染，星尘不泄明文）。现有 4 张 card-demo-* 是功能示例，可删。新建：`npm run new -- --card ["标题"] [slug] [--fiction] [--en] [--bilingual]`。
- tag 颜色全站固定：同一个 tag 在筛选条、列表条目、短札、文章页永远同色，取色逻辑在 `src/lib/tag-color.ts`（按 tag 名哈希映射到 `.c0`–`.c4` 五色；想给某 tag 钦定颜色写进该文件的 `OVERRIDES`）。列表条目/便签本身的底色仍按位置五色轮换，与 tag 色无关。
- 列表日期与摘录：列表里日期一律只显示到月份（`2026.07`），完整日期在文章详情页 / 短札展开后才出现；`/writing` 更进一步——长篇和短札在列表里都不显示日期，长篇条目是「标题 + 正文首句摘录 + tags」。摘录逻辑在 `src/lib/excerpt.ts`：正文里写 `<!--more-->` 就在标记处截断（作者说了算），否则取第一句、过长再按 maxLen 硬截；`||星尘遮掩||` 在摘录里替换成 ✦✦✦ 不泄明文。
- 栏目引言是诗句（hero 里 `.verse`，字形统一在 global.css：斜体小号、比页头字标明显小且淡；着色由 `Verse.astro` 负责——一词一色的克制版：每个单词轮换五色但混向灰调 45%，远看安静灰字、细看词有微色偏。改诗直接改各页 `<Verse lines={[...]}/>`）：致云雀首页是雪莱 "Thou lovest, but ne'er knew love's sad satiety."，夜莺颂是济慈 "Was it a vision, or a waking dream?"，镜花水月是英文两行 "Yes, I would like to be a poet of the five senses…"（该页 h1 栏目名已删，只留诗），About 在 Kino 句下另有一段诗（中英随语言切换：我给你写诗 / I write to you across what separates us）。原「在这里记笔记…」等站点简介文案已删。
- 迷你页头：页头字标滚出视口后，顶端滑入一条毛玻璃细条「SKYLARKING · 荒腔走板」（小号淡色、点击回首页），滚回来自动退场。实现于 `Header.astro` 的 `.mini-bar` + IntersectionObserver 观察 `.logo`。注意浏览器预览面板不派发 IO 回调/scroll 事件，此交互只能在真实浏览器验证。
- 站点图标（2026-07-19 换，用户提供的设计）：迪斯科球月亮 + 星点，深色圆角底（呼应相册页星球风）。一整套在 `public/`：`favicon.svg`（主图标）、`icon-16/32.png`、`apple-touch-icon.png`（180×180）、`icon-192/512.png`（由 `site.webmanifest` 引用），`BaseHead.astro` 里统一挂 link。旧版彩虹拱飞鸟已替换；设计源 zip 留在仓库根目录但被 `.gitignore` 的 `*.zip` 排除，永不发布。
- 版权标注：页脚全站 CC BY-NC-ND 4.0 声明（中英随语言切换）；文章详情页文末有一行转载声明（`BlogPost.astro` 的 `.colophon`）；复制 ≥42 字符时剪贴板自动附「站名 + URL + 协议」（脚本在 `Footer.astro`，选区碰到 `hidden-text` 时自动让位给星尘的复制拦截，两者不冲突）。
- 相册页背景音乐：`MusicDisc.astro`（挂在 /photos 的 hero 里、引言诗下方）。三种音源按 `src/consts.ts` 配置优先级：① `PHOTOS_BGM_BANDCAMP`（当前 `track=1424065590`，Travelers' Encore；也可填 `album=…` 播整张专辑，ID 从 Bandcamp 页面「Share/Embed」嵌入代码的 src 里拿）——42px Bandcamp 小条播放器**常驻**诗句下方，页面一打开就可见、点 ▶ 即播；底色随日夜主题取色（切主题重建播放器，播放中切会从头再来）；Bandcamp 不支持自动播放是平台限制；② `PHOTOS_BGM_YOUTUBE_ID`——右下角悬浮小唱片，点击弹 16:9 迷你播放器（youtube-nocookie 域、单曲循环、autoplay 借点击手势直接出声），再点收起即停；③ 都留空则悬浮唱片 + 探测本地文件 `public/audio/photos.mp3|m4a|wav`（无文件时按钮自动隐藏，进度记在 localStorage）。
- 设计语言是「极简排版 + 柔和多巴胺色」：颜色/字体变量集中在 `src/styles/global.css` 顶部的 `:root` 和 `[data-theme='dark']`，改配色只动那里。
- 站点标题、简介、社交链接在 `src/consts.ts`；`YOUTUBE_URL` / `INSTAGRAM_URL` 填上后页头自动显示对应图标。
- 新文章：`npm run new -- "标题" [slug] [--en] [--bilingual] [--writing] [--video]`；发布：`npm run up`（commit + push，GitHub Actions 自动部署）。
- 公开仓库的提交信息一律用简洁专业的英文（`up.mjs` 不传信息时会自动生成，如 `Add post: slug`）；不要在提交信息里写设计思路或实现细节。
- RSS：`/rss.xml` 合并 blog + writing + cards，跳过 `.en` 配对翻译避免重复条目；短札条目全文输出、链接指向所在列表页的 `#c-…` 锚点，无标题时用「短札 YYYY-MM-DD」当标题。
- 嵌 YouTube 视频的文章用 `.mdx` + `@astro-community/astro-embed-youtube` 的 `<YouTube id="..." />`。
- OG 分享图：`node scripts/gen-og.mjs` 重新生成 `public/og.png`。
- 注意：本机 `~/.npm` 缓存目录含 root 拥有的文件，跑 `npm install` 会 EACCES 报错，需要加 `--cache <其他目录>` 或先 `sudo chown -R $(whoami) ~/.npm` 修复。
