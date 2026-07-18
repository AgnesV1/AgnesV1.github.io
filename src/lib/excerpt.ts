// 列表摘录：从 Markdown 正文取一小段纯文本。
// 截断规则（优先级从高到低）：
//   1) 正文里写了 <!--more--> 标记 → 在标记处截断，作者说了算，长度不限；
//   2) 否则取第一句（中英句号/问叹号结尾）；
//   3) 第一句仍超过 maxLen 时硬截 + 省略号。
// ||星尘遮掩|| 一律替换成 ✦✦✦，摘录里绝不出现明文。
export const excerptOf = (body: string | undefined, maxLen = 20): string => {
	const raw = body || '';
	const hasMore = raw.includes('<!--more-->');
	const text = raw
		.split('<!--more-->')[0]
		.replace(/\|\|.+?\|\|/gs, '✦✦✦')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/[#>*_`]/g, '')
		.split(/\n+/)
		.map((s) => s.trim())
		.filter(Boolean)
		.join(' ')
		.trim();
	if (hasMore) return text;
	const firstSentence = text.match(/^.+?[。！？…]|^.+?[.!?](?=\s|$)/s)?.[0] ?? text;
	const s = firstSentence.trim();
	return s.length > maxLen ? s.slice(0, maxLen) + '…' : s;
};
