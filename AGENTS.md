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
- 栏目显示名随语言切换（`.only-zh`/`.only-en`）：中文态是 致云雀 / 夜莺颂 / 镜花水月，英文态是 Notes / Fiction / Photos。`blog` collection 对应致云雀（URL `/` 和 `/blog/…`），`writing` 对应夜莺颂（`/writing/…`），镜花水月是站内页面 `/photos`（时间线：左侧年份、右侧「星球」缩略图墙 + 置顶区 + 灯箱。缩略图是圆形星球风——服务端裁成 200×200 方图（`fit="cover" position="attention"`，sharp 智能选取画面重点区域），六档大小错落、缓慢飘浮动画（周期/相位各不相同，`prefers-reduced-motion` 下关闭）、描边光晕随所在行五色轮换（置顶行是 `--sun` 黄）、`::after` 叠球面光影；点开灯箱看原比例大图，开启时有 0.28s 弹出动效。想调整：圆的六档尺寸在 `.photo:nth-child(6n+…)` 的 `--s`，飘浮快慢在 `animation-duration`，裁剪重心可把 `position` 改回 `"center"`）——改过显示名但路由从未动过。About 页是独立极简排版：一句箴言（Kino 之旅的 "The world is not beautiful, therefore it is."）+ 两段诗，样式都在 `src/pages/about.astro` 自己的 `<style>` 里。
- 摄影页加照片零配置：照片放 `src/assets/photos/<年份>/`（如 `2026/`），置顶的放 `src/assets/photos/pinned/`；组内按文件名倒序，命名 `YYYY-序号.jpg`（如 `2026-01.jpg`，序号两位、组内递增，**不用月份**）；说明文字可选——想写就接在序号后面（`2026-03-初雪.jpg`），不写则该图无说明。放别的目录名会按目录名单独分组。
- 相册照片统一预处理后再入库（脚本 `scripts/watermark.py`，参数都在文件顶部）：转 JPG、长边压到 1600、清空 EXIF（含 GPS）、打 Getty 式水印——画面约 2/3 高度处一块半透明灰底板，右缘贴图片右边、左圆角；板上小号白字左对齐，第一行 `skylarking`（粗）+`images`（常规）拼字标、第二行 `Credit: agnesv1.github.io`，右侧留一截灰尾；灰板宽度按长边取比例固定，故窄图上偏左、宽图上偏右（`min-width:max-content` 兜底不截断），与灯箱软水印 `src/pages/photos/index.astro` 的 `.lb-plate` 同一套样式。依赖 Pillow + pillow-heif（HEIC 必须转，浏览器不认）。原图另存在仓库外，库里只放处理过的。
- 双语：全站中英切换按钮在页头（`LangToggle`，写入 `html[data-lang]` + localStorage）；页面元素用 `.only-zh` / `.only-en` 类按语言显隐。文章配对翻译的约定是 `foo.md`（中文）+ `foo.en.md`（英文），URL 为 `/blog/foo/` 与 `/blog/foo/en/`，页面自动互链；双语配对只用于 blog，不用于 writing。
- 文章 frontmatter：`lang: zh | en`（默认 zh）；`tags` 渲染为彩色小标签；可选 `references`（字符串或 `{title, url?, author?}` 数组）会在文末渲染为可折叠的参考文献区块，不写就不显示。
- 文章页三栏（blog 和 writing 都启用）：宽屏 ≥1160px 时左侧是按年份分组的时间轴（`NoteTimeline.astro`，各自栏目只列各自的文章，纯时间轴、无导航），右侧是文内目录（`Toc.astro`，自动取 Markdown h2–h4，滚动高亮当前小节，零配置）；窄屏两栏自动隐藏，改为右下角浮标拉出底部目录抽屉（文中没有小标题就不出现目录和浮标）。数据在 `src/pages/blog/[...slug].astro` 和 `src/pages/writing/[...slug].astro` 里算好传给 `BlogPost.astro` 的 `headings`/`timeline`/`currentId` props。
- 防剧透（星尘遮掩）：正文里写 `||要隐藏的文字||`，构建时由 `scripts/rehype-hidden-text.mjs` 转成 `<hidden-text data-t="base64">`（HTML 源码不出现明文，占位乱码按字宽生成保证行宽一致）；运行时 `HiddenText.astro`（挂在 BlogPost 布局）把隐藏段画成闪烁星尘（夜间白色、日间五彩），点击展开并播放消散动画，点空白或另一段自动收起（互斥），复制/剪切/拖拽只能拿到 █。跨行藏文字用行末双空格硬换行；`||` 只能在同一段落内配对；code/pre 里不生效。示例见 `src/content/cards/card-demo-fiction.md`。性能：绘制循环在页面上没有任何可见隐藏段时整帧跳过（列表页短札全部收起时零开销），改动 drawDots 时别丢了这个 jobs 空跳逻辑。
- 页头折叠导航：≤640px 时栏目链接和社交图标收进汉堡菜单（`Header.astro`），页头只留 logo + 语言/主题切换 + ☰。
- 列表筛选：首页和 `/writing` 用 `FilterBar.astro`（标签多选 = 命中任一即显示；年份多选、横向可滚；标签组与年份组之间取交集）。纯前端过滤，状态写入 URL `?tag=…&year=…`，刷新/分享保留；列表 `li` 需带 `data-tags="a|b"` 和 `data-year`。标签为空或年份只有一个时对应行自动不渲染。筛选脚本对页面里所有 `.post-list` / `.cards-wall` 容器同时生效（/writing 的长篇列表和短札墙一起过滤）。
- 短札（cards）：`src/content/cards/` 独立 collection，千字以内短文本，**不生成详情页**（`CardNote.astro` 渲染）。frontmatter 与长文同 schema 但 `title` 可选，多一个 `section: notes | fiction` 区分归属：`notes` 混进首页时间流（浅底 + 左边框），`fiction` 铺在 `/writing` 下方便签墙（五色浅底 + 微倾便签，flex 错落布局——收起时每张宽度随文本长短自适应、一行自动挤放、展开的那张独占整行；上方长篇列表包在可折叠 `<details>` 里，默认展开）。**交互**：默认收起成一行（日期 + 标题/正文纯文本预览 + tags，预览会把 `||…||` 换成 ✦✦✦ 防剧透），点卡片原地展开全文、点其他区域或再点收起、同时只展开一张（互斥，同星尘逻辑）；URL 直链 `#c-<文件名>`（点卡片日期即得）自动展开对应卡。中英配对沿用 `foo.md`+`foo.en.md`（`data-base` 带 `card:` 前缀防和长文混组）。短札里可用 `||星尘遮掩||`（首页和 /writing 都挂了 `HiddenText.astro`）。RSS 里短札全文输出（`rss.xml.js` 用 Container API 走站内管线渲染，星尘不泄明文）。现有 3 张 card-demo-* 是功能示例，可删。新建：`npm run new -- --card ["标题"] [slug] [--fiction] [--en] [--bilingual]`。
- tag 颜色全站固定：同一个 tag 在筛选条、列表条目、短札、文章页永远同色，取色逻辑在 `src/lib/tag-color.ts`（按 tag 名哈希映射到 `.c0`–`.c4` 五色；想给某 tag 钦定颜色写进该文件的 `OVERRIDES`）。列表条目/便签本身的底色仍按位置五色轮换，与 tag 色无关。
- 列表日期与摘录：列表里日期一律只显示到月份（`2026.07`），完整日期在文章详情页 / 短札展开后才出现；`/writing` 更进一步——长篇和短札在列表里都不显示日期，长篇条目是「标题 + 正文首句摘录 + tags」。摘录逻辑在 `src/lib/excerpt.ts`：正文里写 `<!--more-->` 就在标记处截断（作者说了算），否则取第一句、过长再按 maxLen 硬截；`||星尘遮掩||` 在摘录里替换成 ✦✦✦ 不泄明文。
- 栏目引言是诗句（hero 里 `.verse`，字形统一在 global.css：斜体小号、比页头字标明显小且淡；着色由 `Verse.astro` 负责——一词一色的克制版：每个单词轮换五色但混向灰调 45%，远看安静灰字、细看词有微色偏。改诗直接改各页 `<Verse lines={[...]}/>`）：致云雀首页是雪莱 "Thou lovest, but ne'er knew love's sad satiety."，夜莺颂是济慈 "Was it a vision, or a waking dream?"，镜花水月是英文两行 "Yes, I would like to be a poet of the five senses…"（该页 h1 栏目名已删，只留诗），About 在 Kino 句下另有两段诗（都是普通 `.verse` 样式、不走 Verse.astro，中英各写一个 `.only-zh`/`.only-en` span 切换）：第一段「我给你写诗 / I write to you across what separates us」，第二段是惠特曼《自我之歌》51 节「我自相矛盾吗 / Do I contradict myself」（`.verse-2`，`::before` 自带一条 `· · ·` 分隔；再加诗就复制这套改成 `.verse-3`）。原「在这里记笔记…」等站点简介文案已删。
- 迷你页头：页头字标滚出视口后，顶端滑入一条毛玻璃细条「SKYLARKING · 荒腔走板」（小号淡色、点击回首页），滚回来自动退场。实现于 `Header.astro` 的 `.mini-bar` + IntersectionObserver 观察 `.logo`。注意浏览器预览面板不派发 IO 回调/scroll 事件，此交互只能在真实浏览器验证。
- 站点图标（2026-07-19 换，用户提供的设计）：迪斯科球月亮 + 星点，深色圆角底（呼应相册页星球风）。一整套在 `public/`：`favicon.svg`（主图标）、`icon-16/32.png`、`apple-touch-icon.png`（180×180）、`icon-192/512.png`（由 `site.webmanifest` 引用），`BaseHead.astro` 里统一挂 link。旧版彩虹拱飞鸟已替换；设计源 zip 留在仓库根目录但被 `.gitignore` 的 `*.zip` 排除，永不发布。
- 版权标注：页脚全站 CC BY-NC-ND 4.0 声明（中英随语言切换）；文章详情页文末有一行转载声明（`BlogPost.astro` 的 `.colophon`）；复制 ≥42 字符时剪贴板自动附「站名 + URL + 协议」（脚本在 `Footer.astro`，选区碰到 `hidden-text` 时自动让位给星尘的复制拦截，两者不冲突）。
- 相册页背景音乐：`MusicDisc.astro`（挂在 /photos 的 hero 里、引言诗下方）。三种音源按 `src/consts.ts` 配置优先级：① `PHOTOS_BGM_BANDCAMP`（当前 `track=1424065590`，Travelers' Encore；也可填 `album=…` 播整张专辑，ID 从 Bandcamp 页面「Share/Embed」嵌入代码的 src 里拿）——42px Bandcamp 小条播放器**常驻**诗句下方，页面一打开就可见、点 ▶ 即播；底色随日夜主题取色（切主题重建播放器，播放中切会从头再来）；Bandcamp 不支持自动播放是平台限制；② `PHOTOS_BGM_YOUTUBE_ID`——右下角悬浮小唱片，点击弹 16:9 迷你播放器（youtube-nocookie 域、单曲循环、autoplay 借点击手势直接出声），再点收起即停；③ 都留空则悬浮唱片 + 探测本地文件 `public/audio/photos.mp3|m4a|wav`（无文件时按钮自动隐藏，进度记在 localStorage）。
- 日夜跟着钟点走：当地时间 6 点到 18 点是日间，其余是夜间（不看系统的深浅色）。点页头那颗日月 = 先照点的来，管到下一个早 6 点 / 晚 6 点，之后又跟钟点；手动的那一下存在 localStorage 的 `theme-hold`（`{ v, until }`），旧的永久键 `theme` 已弃用、加载时删掉。规则写了两份、要一起改：`BaseHead.astro` 开头的内联脚本（样式生效前定 `data-theme`）和 `ThemeToggle.astro` 的脚本（点按钮、页面开着过六点时自己换、回到前台再看一眼；只挂一个定时器）。
- 页头的日月按钮（`ThemeToggle.astro`）：日间是一颗小太阳（黄→橙→粉→紫的渐变圆，下半截三道横纹），夜间是一颗冰蓝的小月亮，上面一层镜面球的细格，约 20px，和苦昼短（TimeBox）左上角那颗是同一个样子。整颗 12 秒转一圈（只是 transform），经线不做扫动——空闲时不留要重画的动画；`prefers-reduced-motion` 下不转。**转的是里面的 svg，外面的 `.ball` 不转**：过场给 `.ball` 起名字（`orb`），它要是带着转，「往下落 / 往上升」就会朝它当时转到的方向走。
- 切换日夜的过场：快慢照日出日落调的，全程约 3 秒——整页约 2.1 秒淡过去，底边泛一阵霞光（3 秒；切到日间是朝霞——杏黄到珊瑚，切到夜间是晚霞——玫瑰到薰衣草，颜色在 `.dusk[data-k]`），页头那颗日月一落一升（旧的 1.2 秒落下去，新的接着 1.8 秒升上来、过头一点再回到位，过渡里的名字是 `orb`）。实现在 `ThemeToggle.astro` 的 `turnTo`（`document.startViewTransition` 包住换主题，临时给 `<html>` 设 `data-vt="theme"`，并挂一个 `.dusk` 元素，播完移除）+ `global.css` 的「切换日夜的过场」一段。只在换的那一下用同文档 View Transition，平时零开销；`prefers-reduced-motion`、页面在后台时直接换。这和 2026-07 为性能删掉的跨页 `@view-transition { navigation: auto }` 不是一回事，那个不要加回来。霞光的动画放在 `.dusk::before` 上（元素本身不带 opacity / transform），改的时候别挪到元素上。
- 底图上偶尔经过的小东西（`Sky.astro`，挂在 `Footer.astro` 里所以全站都有）：三样各排各的间隔——**飞机** 3–5 分钟一趟（日间 = 高空一个小点拖两道长尾迹，夜间 = 红眼航班的一闪一闪的红灯加一颗小白灯；打开后第一趟 20–60 秒就来）；**潮水** 6–10 分钟一次（又宽又矮的一片水贴着底边从右下角斜着滑进来再退回去，一次两道，最高处宽屏约屏高 7%、窄屏约 5.5%；日间是海水色加白浪边，浪边两侧各压一道错开的玫瑰线和蓝线；夜间是荧光海——发光的浪边、水里忽明忽暗的小横杠、退走后留一串荧光点；浪边每一道现算，第一道 1–3 分钟来）；**少见的那样** 10–15 分钟一次（日间按读者当地的月份飘东西：3–4 月嫩叶、5–8 月侧面的小康乃馨、9–11 月枫叶、12–2 月雪花，每次有一两片被风带着绕一个小圈；夜间一阵流星雨，十颗左右、窄屏七颗）。**一次只放一样**：轮到时还有东西没走完，就等它走完再隔一分钟；几样同时到点，先放少见的、再潮水、再飞机。只挂一个 `setTimeout`，没有常驻动画，东西用 `el.animate()` 只动 transform / opacity、放完就拿掉；页面在后台、`prefers-reduced-motion` 时不放；换日夜时正在放的那样直接拿掉。这一层 `#sky-ev` 和底图两层同在 `z-index: -1`，从文字后面过。预览时手动看样子：控制台里 `dispatchEvent(new CustomEvent('sky-show', { detail: 'plane' }))`（`plane` / `redeye` / `meteors` / `fall` / `tide`，后两样可以带参数：`fall:summer`、`tide:night`）。苦昼短（TimeBox）的 `js/sky.js` 是同一套，颜色更艳。
- 设计语言是「极简排版 + 柔和多巴胺色」：颜色/字体变量集中在 `src/styles/global.css` 顶部的 `:root` 和 `[data-theme='dark']`，改配色只动那里。
- 站点标题、简介、社交链接在 `src/consts.ts`；`YOUTUBE_URL` / `INSTAGRAM_URL` 填上后页头自动显示对应图标。
- 新文章：`npm run new -- "标题" [slug] [--en] [--bilingual] [--writing] [--video]`；发布：`npm run up`（commit + push，GitHub Actions 自动部署）。
- 公开仓库的提交信息一律用简洁专业的英文（`up.mjs` 不传信息时会自动生成，如 `Add post: slug`）；不要在提交信息里写设计思路或实现细节。
- RSS：`/rss.xml` 合并 blog + writing + cards，跳过 `.en` 配对翻译避免重复条目；短札条目全文输出、链接指向所在列表页的 `#c-…` 锚点，无标题时用「短札 YYYY-MM-DD」当标题。
- 嵌 YouTube 视频的文章用 `.mdx` + `@astro-community/astro-embed-youtube` 的 `<YouTube id="..." />`。
- OG 分享图：`node scripts/gen-og.mjs` 重新生成 `public/og.png`。
- prompt 类文章：第一读者是 AI——读者把这页的链接交给自己的助手，让它对照自己的情况挑着用；只有图是给人看的。文章带 `prompt` 这个 tag 就算（首页筛选条里自动多出这个 tag，不另开栏目）。正文固定顺序：`## Scope and limits`（适用范围和局限放最前）→ `<PromptNote />`（`src/components/PromptNote.astro`：一行英文说明「先写给 AI 读、AI 起草、逻辑是作者的」+ 纯文本版链接，**没有复制按钮、不出中文**）→ 一句写给对方 AI 的引言 → Brief / Framework / Decisions / Parameters / Adapt it。纯文本版在 `/blog/<slug>.txt`（`src/pages/blog/[...slug].txt.ts` + `src/lib/prompt.ts`：去掉 import、MDX 注释和 `<PromptNote />`，`<Fig />` 换成 `[Figure: 图的 aria-label]`，`<Shot />` 换成 `[Screenshot: alt]`）。新建：`npm run new -- "标题" slug --prompt [--en]`，生成 `.mdx` 和这份骨架。标题末尾带一两个 emoji。
- 文章里的示意图：内容都写在 `scripts/gen-figures.mjs` 里，跑一次生成 `src/figures/*.svg`（画布宽 680，颜色用 global.css 的变量；框里的字放不下时脚本会提醒）。`.mdx` 文章里 `import Fig from '../../components/Fig.astro'` 后写 `<Fig name="tb-system-map" />`，svg 原样内嵌，跟着日夜主题变色。界面截图日夜各一张（`src/figures/<name>-light.png` / `<name>-dark.png`），`.mdx` 里写 `<Shot name="tb-ui-today" alt="说明" />`（`src/components/Shot.astro`），跟着全站主题只显示对应的那张；`phone` 属性给手机截图用，几张并排包一层 `<div class="shot-row">`。`both` 属性把日夜两张并排都显示（讲外观时用），不跟主题切换。苦昼短的示例截图来自 `TimeBox/design/demo.html`（虚构数据），用无头 Chrome 截。
- 注意：本机 `~/.npm` 缓存目录含 root 拥有的文件，跑 `npm install` 会 EACCES 报错，需要加 `--cache <其他目录>` 或先 `sudo chown -R $(whoami) ~/.npm` 修复。
