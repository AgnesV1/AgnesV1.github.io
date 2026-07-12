// 防剧透语法：Markdown 里用 ||被隐藏的文字|| 标记，构建时转成
// <hidden-text data-t="base64(原文)">乱码占位</hidden-text>。
// 原文只以 base64 形式进入 HTML，页面源码里不出现明文；
// 占位乱码按字宽逐字生成（宽字符换随机汉字、其余换随机字母），
// 保证行数和每行长短与原文一致，配合 HiddenText 组件的星尘层与点击展开。
// 跨行隐藏：在 || 里用行末双空格（硬换行 <br>）分行。

const WIDE = (c) => c.charCodeAt(0) >= 0x2e80 || '—…“”‘’'.includes(c);
const rCJK = () => String.fromCharCode(0x4e00 + Math.floor(Math.random() * 20902));
const rABC = () => String.fromCharCode(97 + Math.floor(Math.random() * 26));
const scramble = (s) =>
	[...s].map((c) => (c === '\n' ? '\n' : WIDE(c) ? rCJK() : rABC())).join('');

const SKIP = new Set(['code', 'pre', 'script', 'style', 'hidden-text']);

// 提取一个节点的纯文本（<br> 记为换行）
function textOf(node) {
	if (node.type === 'text') return node.value;
	if (node.type !== 'element') return '';
	if (node.tagName === 'br') return '\n';
	return (node.children || []).map(textOf).join('');
}

function makeHidden(buffer) {
	const b64 = Buffer.from(buffer, 'utf8').toString('base64');
	return {
		type: 'element',
		tagName: 'hidden-text',
		properties: { 'data-t': b64 },
		children: [{ type: 'text', value: scramble(buffer) }],
	};
}

// 处理一个元素的直接子节点序列：识别成对的 || 分隔符（允许中间隔着 <br> 或行内元素）
function processChildren(children) {
	const out = [];
	let open = false;
	let buffer = '';
	// 万一 || 没有配对闭合，把已吞掉的内容原样吐回去
	let pending = [];

	const flushUnclosed = () => {
		out.push({ type: 'text', value: '||' });
		out.push(...pending);
		pending = [];
		buffer = '';
		open = false;
	};

	for (const node of children) {
		if (node.type === 'text') {
			const parts = node.value.split('||');
			if (parts.length === 1) {
				if (open) {
					buffer += node.value;
					pending.push(node);
				} else out.push(node);
				continue;
			}
			for (let i = 0; i < parts.length; i++) {
				if (open) buffer += parts[i];
				else if (parts[i]) out.push({ type: 'text', value: parts[i] });
				if (i < parts.length - 1) {
					if (open) {
						out.push(makeHidden(buffer));
						buffer = '';
						pending = [];
						open = false;
					} else {
						open = true;
					}
				}
			}
			if (open) pending.push({ type: 'text', value: parts[parts.length - 1] });
		} else if (open) {
			buffer += textOf(node);
			pending.push(node);
		} else {
			out.push(node);
		}
	}
	if (open) flushUnclosed();
	return out;
}

export default function rehypeHiddenText() {
	return (tree) => {
		const walk = (node) => {
			if (node.type === 'element' && SKIP.has(node.tagName)) return;
			if (!node.children) return;
			const hasMarker = node.children.some(
				(ch) => ch.type === 'text' && ch.value.includes('||'),
			);
			if (hasMarker) node.children = processChildren(node.children);
			node.children.forEach(walk);
		};
		walk(tree);
	};
}
