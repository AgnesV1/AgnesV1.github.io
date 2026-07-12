# 使用手册

日常维护这个博客只需要记住三件事：**新建 → 写 → 发布**。本手册覆盖所有栏目的更新方式和 Markdown 格式约定。

## 0. 日常三步

```bash
npm run new -- "文章标题"     # 1. 新建文章（见下文参数）
# 2. 用任何编辑器写 Markdown
npm run up                    # 3. 发布：自动 commit + push，1-2 分钟后上线
```

- `npm run up` 会自动生成专业的英文提交信息（如 `Add post: my-slug`）；也可以自己指定：`npm run up -- "Fix typo"`。
- 本地预览：`npm run dev`，浏览器开 http://localhost:4321 （改文件即时刷新；`astro dev stop` 停止）。如果报 Node 版本错误，说明终端用了旧版 Node，需要 22 以上。

## 1. 新建文章的所有姿势

```bash
npm run new -- "标题"                    # 致云雀（笔记），中文
npm run new -- "标题" my-slug            # 指定网址用的 slug（不指定则由标题生成）
npm run new -- "标题" --writing          # 夜莺颂（虚构写作）
npm run new -- "Title" --en              # 英文笔记
npm run new -- "标题" --bilingual        # 中英双语一对（仅笔记栏目）
npm run new -- "标题" --video            # 生成 .mdx，用于嵌 YouTube 视频
```

文件位置：笔记在 `src/content/blog/`，写作在 `src/content/writing/`。删除文章 = 删除对应文件。

## 2. 文章开头的 frontmatter

每篇文章顶部两条 `---` 之间的区域，字段如下（`npm run new` 会生成好模板）：

```yaml
---
title: '文章标题'            # 必填，页面大标题就是它
description: '一句话简介'    # 建议填，用于搜索引擎和分享卡片
pubDate: 2026-07-12         # 必填，发布日期（决定列表排序和年份筛选）
updatedDate: 2026-08-01     # 可选，改过文章时加上，会显示"更新于"
lang: zh                    # zh 或 en，默认 zh
tags: ['note', '随笔']       # 可选，彩色小标签，自动进入首页的标签筛选
references:                 # 可选，文末可折叠的参考文献
  - '一句话形式的参考'
  - title: '书名或文章名'
    url: 'https://…'        # 可选
    author: '作者'           # 可选
---
```

## 3. Markdown 格式约定

| 想要什么 | 怎么写 |
|---|---|
| 小节标题（会进右侧目录） | `## 标题`、`### 标题`、`#### 标题` |
| **防剧透星尘** | `\|\|要隐藏的文字\|\|` |
| 引用块 | `> 引用内容`（紫色左边条） |
| 分隔线 | `---`（显示为 `· · ·`） |
| 插图 | `![说明](./图片.jpg)`，图片和文章放同一目录即可 |
| 代码 | 行内用 `` `code` ``，多行用三个反引号 |

**标题的讲究**：
- 不要在正文里用 `#`（一级标题）——文章大标题来自 frontmatter 的 `title`。
- `##` 到 `####` 都会自动进入 PC 端右侧目录和手机端底部抽屉目录，最浅的一级作为目录顶层、更深的缩进一层。滚动时目录自动高亮当前小节，全程零配置。
- 文中没有小标题时，目录栏自动不出现（比如短篇小说），不用管它。

**防剧透（星尘遮掩）的细节**：
- 写法：`这本书最狠的是：||他在第二章就死了||。`——可以嵌在句子中间。
- 隐藏多行：把要藏的几行写在同一段里，每行末尾敲**两个空格**再换行，整段包进 `||…||`。
- 一对 `||` 必须在同一段落内；代码块里不生效。
- 效果：文字变成一条闪烁星尘（夜间白色、日间彩色），行数和长短与原文一致；点击星尘消散显示原文，点空白处恢复；无论是否展开，复制/剪切拿到的都只有 █ 方块；构建后的网页源码里也只有编码，搜不到原文。
- 活例子：`src/content/writing/night-train.md` 文末两句。

## 4. 双语文章（仅笔记栏目）

约定：`foo.md`（中文版）+ `foo.en.md`（英文版），放在 `src/content/blog/`。

- 网址自动变成 `/blog/foo/`（中文）和 `/blog/foo/en/`（英文），两版页面自动互链，页头切换语言时直接跳转对应版本。
- 列表里只显示当前语言那一版，RSS 只收录一条不重复。
- `npm run new -- "标题" --bilingual` 一次生成两个文件。

## 5. 镜花水月（照片）

零配置，不用写任何代码：

- 照片丢进 `src/assets/photos/<年份>/`，比如 `src/assets/photos/2026/`；
- 想置顶的丢进 `src/assets/photos/pinned/`；
- 命名建议 `YYYY-MM-描述.jpg`（如 `2026-07-海边日落.jpg`）——去掉日期后的部分会显示为照片说明，中文没问题；
- 组内按文件名倒序排列，页面自动按年份分组、瀑布流展示、点击开灯箱。
- ⚠️ 现在的 9 张是渐变占位图（角落有 sample 字样），放真照片时把它们删掉。

## 6. 自我介绍（About）

只有一句话，在 `src/pages/about.astro` 里搜 `motto` 附近，直接改引号里的文字即可。

## 7. 站名、简介、社交链接

都在 `src/consts.ts`：

- `SITE_TITLE`：站名，用全角 `／` 分隔英文名和中文名，页头会自动拆成字标；
- `SITE_DESCRIPTION`：站点简介（搜索引擎和 RSS 用）；
- `YOUTUBE_URL` / `INSTAGRAM_URL`：填上链接，页头自动出现对应图标；留空 `''` 则隐藏。

## 8. 偶尔用得上

- **嵌 YouTube 视频**：文件后缀用 `.mdx`（或 `npm run new -- "标题" --video`），文中写 `<YouTube id="视频ID" />`，顶部加 `import { YouTube } from '@astro-community/astro-embed-youtube';`。
- **换配色**：`src/styles/global.css` 顶部 `:root`（日间）和 `[data-theme='dark']`（夜间）里的五个颜色变量。
- **重新生成分享图**：`node scripts/gen-og.mjs`。
- **npm install 报 EACCES**：本机 `~/.npm` 缓存有 root 文件，用 `npm install --cache /tmp/npm-cache` 绕过。
