#!/usr/bin/env node
// 新建一篇文章：npm run new -- "文章标题" [slug] [--en] [--bilingual] [--writing] [--video]
//   slug         可选，决定文章 URL；不填则自动生成
//   --en         英文文章（默认中文）
//   --bilingual  同时生成中文版 slug.md 和英文版 slug.en.md（双语配对，仅限笔记）
//   --writing    放进写作栏目（/writing/，虚构写作）
//   --video      生成 .mdx 并带上 YouTube 嵌入示例

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith('--'));
const positional = args.filter((a) => !a.startsWith('--'));

const title = positional[0];
if (!title) {
	console.log('用法: npm run new -- "文章标题" [slug] [--en] [--bilingual] [--writing] [--video]');
	console.log('例如: npm run new -- "我的新文章" my-new-post');
	console.log('      npm run new -- "双语笔记" my-note --bilingual');
	console.log('      npm run new -- "一个短篇" a-story --writing');
	process.exit(1);
}

const isEn = flags.includes('--en');
const isBilingual = flags.includes('--bilingual');
const isWriting = flags.includes('--writing');
const isVideo = flags.includes('--video');

if (isBilingual && isWriting) {
	console.error('✗ 双语配对目前只用于笔记（blog），--bilingual 和 --writing 不能同时用');
	process.exit(1);
}

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
const dir = path.join('src', 'content', isWriting ? 'writing' : 'blog');

const frontmatter = (lang, t) => `---
title: '${t.replace(/'/g, "''")}'
description: ''
pubDate: ${dateStr}
lang: ${lang}
tags: []
---
`;

const videoBody = `
import { YouTube } from '@astro-community/astro-embed-youtube';

正文从这里开始……

<YouTube id="视频ID" />
`;

const body = isVideo ? videoBody : '\n正文从这里开始……\n';

const targets = isBilingual
	? [
			{ file: path.join(dir, `${slug}.${ext}`), lang: 'zh', body },
			{ file: path.join(dir, `${slug}.en.${ext}`), lang: 'en', body: '\nWrite the English version here…\n' },
		]
	: [{ file: path.join(dir, `${slug}.${ext}`), lang: isEn ? 'en' : 'zh', body }];

for (const t of targets) {
	if (fs.existsSync(t.file)) {
		console.error(`✗ 文件已存在：${t.file}，换一个 slug 吧`);
		process.exit(1);
	}
}

for (const t of targets) {
	fs.writeFileSync(t.file, frontmatter(t.lang, title) + t.body);
	console.log(`✓ 已创建 ${t.file}`);
}

if (isBilingual) {
	console.log('  两个文件是同一篇的中/英版本，页面上会自动出现语言切换。');
}
console.log('  1. 用编辑器打开，写正文（记得补一句 description）');
console.log('  2. 写完运行 npm run up 发布上线');
