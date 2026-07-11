#!/usr/bin/env node
// 一键发布：npm run up [-- "commit message"]
// 把所有改动 commit 并 push，GitHub Actions 会自动重新部署网站。
// 不传信息时自动生成专业的英文提交说明（公开仓库的提交记录保持英文）。

import { execSync } from 'node:child_process';

const run = (cmd) => execSync(cmd, { stdio: 'inherit' });
const out = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim();

const status = out('git status --porcelain');
if (!status) {
	console.log('没有需要发布的改动。');
	process.exit(0);
}

// 根据改动内容生成英文提交信息：
//   新增文章 → "Add post: slug" / "Add story: slug"
//   只改了内容 → "Update posts"；其他情况 → "Update site"
function defaultMessage() {
	const lines = status.split('\n');
	const added = [];
	let touchedContent = false;
	for (const line of lines) {
		const st = line.slice(0, 2);
		const file = line.slice(3).replace(/^"|"$/g, '');
		const m = file.match(/^src\/content\/(blog|writing)\/(.+)\.(md|mdx)$/);
		if (!m) continue;
		touchedContent = true;
		if (st === '??' || st.includes('A')) {
			const slug = m[2].replace(/\.en$/, '');
			const label = m[1] === 'writing' ? 'story' : 'post';
			added.push({ label, slug });
		}
	}
	if (added.length > 0) {
		const unique = [...new Map(added.map((a) => [`${a.label}:${a.slug}`, a])).values()];
		const label = unique[0].label + (unique.length > 1 ? 's' : '');
		return `Add ${label}: ${unique.map((a) => a.slug).join(', ')}`;
	}
	return touchedContent ? 'Update posts' : 'Update site';
}

const message = process.argv.slice(2).join(' ') || defaultMessage();

run('git add -A');
run(`git commit -m ${JSON.stringify(message)}`);
run('git push');

console.log('');
console.log(`✓ 已推送（${message}）！GitHub Actions 正在重新部署，约 1-2 分钟后生效：`);
console.log('  https://agnesv1.github.io');
