#!/usr/bin/env node
// `npm run photos` —— 一键把相册原图处理进网站。
// 首次运行会自动备好图片处理环境（在 ~/.venv-wm 里装 Pillow + pillow-heif，约 30 秒），
// 之后每次直接跑。默认处理仓库同级的 `../raw photos`，也可传目录：`npm run photos -- <目录>`。
// 处理完照常 `npm run up` 即可上线。
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const venv = join(homedir(), '.venv-wm');
const py = join(venv, 'bin', 'python');

function run(cmd, args, opts = {}) {
	const r = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
	if (r.status !== 0) process.exit(r.status ?? 1);
}

if (!existsSync(py)) {
	// 首次：找一个可用的 python3 建 venv
	const base = ['/opt/homebrew/bin/python3.12', '/usr/local/bin/python3', 'python3'].find(
		(p) => spawnSync(p, ['--version']).status === 0,
	);
	if (!base) {
		console.error('找不到 python3。请先安装（brew install python），再重试 `npm run photos`。');
		process.exit(1);
	}
	console.log('首次运行：正在准备图片处理环境（约 30 秒，只这一次）…');
	run(base, ['-m', 'venv', venv]);
	run(py, ['-m', 'pip', 'install', '-q', 'Pillow', 'pillow-heif']);
}

// 透传可选的自定义原图目录
run(py, ['scripts/import-photos.py', ...process.argv.slice(2)]);
