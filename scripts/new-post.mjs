#!/usr/bin/env node
// 新建一篇博文：npm run new -- "文章标题" [slug] [--en] [--video]
//   slug     可选，决定文章 URL（/blog/slug/）；不填则自动生成
//   --en     英文文章（默认中文）
//   --video  生成 .mdx 并带上 YouTube 嵌入示例

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith('--'));
const positional = args.filter((a) => !a.startsWith('--'));

const title = positional[0];
if (!title) {
	console.log('用法: npm run new -- "文章标题" [slug] [--en] [--video]');
	console.log('例如: npm run new -- "我的新文章" my-new-post');
	process.exit(1);
}

const isEn = flags.includes('--en');
const isVideo = flags.includes('--video');

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

// slug：优先用第二个参数；否则从标题里提取英文/数字；再不行就用日期
let slug = positional[1];
if (!slug) {
	const derived = title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	slug = derived.length >= 3 ? derived : `post-${dateStr}-${pad(now.getHours())}${pad(now.getMinutes())}`;
}

const ext = isVideo ? 'mdx' : 'md';
const file = path.join('src', 'content', 'blog', `${slug}.${ext}`);

if (fs.existsSync(file)) {
	console.error(`✗ 文件已存在：${file}，换一个 slug 吧`);
	process.exit(1);
}

const frontmatter = `---
title: '${title.replace(/'/g, "''")}'
description: ''
pubDate: ${dateStr}
lang: ${isEn ? 'en' : 'zh'}
tags: []
---
`;

const videoBody = `
import { YouTube } from '@astro-community/astro-embed-youtube';

正文从这里开始……

<YouTube id="视频ID" />
`;

const body = isVideo ? videoBody : '\n正文从这里开始……\n';

fs.writeFileSync(file, frontmatter + body);
console.log(`✓ 已创建 ${file}`);
console.log('  1. 用编辑器打开它，写正文（记得补一句 description）');
console.log('  2. 写完运行 npm run up 发布上线');
