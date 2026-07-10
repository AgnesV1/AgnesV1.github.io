#!/usr/bin/env node
// 一键发布：npm run up [-- "提交说明"]
// 把所有改动 commit 并 push，GitHub Actions 会自动重新部署网站。

import { execSync } from 'node:child_process';

const run = (cmd) => execSync(cmd, { stdio: 'inherit' });
const out = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim();

const status = out('git status --porcelain');
if (!status) {
	console.log('没有需要发布的改动。');
	process.exit(0);
}

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
const message = process.argv.slice(2).join(' ') || `更新内容 ${stamp}`;

run('git add -A');
run(`git commit -m ${JSON.stringify(message)}`);
run('git push');

console.log('');
console.log('✓ 已推送！GitHub Actions 正在重新部署，约 1-2 分钟后生效：');
console.log('  https://agnesv1.github.io');
