// 荧光笔语法：Markdown 里用 ==要划重点的文字== 标记，构建时转成 <mark>（样子在 global.css「荧光笔」一段）。
// 规则照 Obsidian / markdown-it-mark：开头的 == 后面紧跟非空白、结尾的 == 前面紧跟非空白，
// 所以 `a == b` 这种写法不会被当成荧光笔；=== 三个等号也不算。
// 只在同一段落（同一个父元素的直接子节点）里配对，中间可以夹 **粗体**、链接这类行内元素。
// 和 rehype-hidden-text（||星尘||）互不干扰：那个插件先跑，它生成的 <hidden-text> 这里整段跳过，
// 写在荧光笔里的 ||星尘|| 会被整个包进 <mark>。code / pre 里不生效。

const SKIP = new Set(['code', 'pre', 'script', 'style', 'svg', 'hidden-text', 'mark']);
const MARKER = /(?<!=)==(?!=)/g;
const HOLE = Symbol('opener');

const text = (value) => ({ type: 'text', value });

// 一个片段的开头 / 结尾是不是「实心」的（非空白文字或行内元素）
const startsSolid = (t) => t && t !== HOLE && !t.marker && (t.type !== 'text' || /^\S/.test(t.value));
const endsSolid = (t) => t && t !== HOLE && !t.marker && (t.type !== 'text' || /\S$/.test(t.value));

function mergeText(nodes) {
	const out = [];
	for (const n of nodes) {
		const prev = out[out.length - 1];
		if (n.type === 'text' && prev?.type === 'text') prev.value += n.value;
		else if (n.type !== 'text' || n.value) out.push(n);
	}
	return out;
}

function markChildren(children) {
	// 先把文字节点按 == 切开，标记本身单独成一个 token
	const toks = [];
	for (const node of children) {
		if (node.type !== 'text') {
			toks.push(node);
			continue;
		}
		let last = 0;
		for (const m of node.value.matchAll(MARKER)) {
			if (m.index > last) toks.push(text(node.value.slice(last, m.index)));
			toks.push({ marker: true });
			last = m.index + 2;
		}
		if (last < node.value.length) toks.push(text(node.value.slice(last)));
	}

	// 再从左到右配对：能收尾就收尾，否则看能不能开头，两样都不行就原样留下 ==
	const out = [];
	let open = -1;
	toks.forEach((t, i) => {
		if (!t.marker) return out.push(t);
		if (open >= 0 && endsSolid(toks[i - 1]) && out.length > open + 1) {
			const inner = out.splice(open).slice(1);
			out.push({ type: 'element', tagName: 'mark', properties: {}, children: mergeText(inner) });
			open = -1;
		} else if (startsSolid(toks[i + 1])) {
			if (open >= 0) out[open] = text('==');
			open = out.length;
			out.push(HOLE);
		} else {
			out.push(text('=='));
		}
	});
	if (open >= 0) out[open] = text('==');
	return mergeText(out);
}

export default function rehypeMark() {
	return (tree) => {
		const walk = (node) => {
			if (node.type === 'element' && SKIP.has(node.tagName)) return;
			if (!node.children) return;
			if (node.children.some((ch) => ch.type === 'text' && ch.value.includes('=='))) {
				node.children = markChildren(node.children);
			}
			node.children.forEach(walk);
		};
		walk(tree);
	};
}
