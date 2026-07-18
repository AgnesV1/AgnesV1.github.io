// 同一个 tag 在全站永远同一个颜色（筛选条、列表条目、短札、文章页共用）。
// 色序对应 global.css 的 .c0–.c4：0 珊瑚 / 1 薄荷 / 2 薰衣草 / 3 杏黄 / 4 天蓝。
// 默认按 tag 名哈希取色；想给某个 tag 钦定颜色就写进 OVERRIDES。
const OVERRIDES: Record<string, number> = {
	// 例：essay: 0,
};

export const tagColorIndex = (tag: string): number => {
	if (tag in OVERRIDES) return OVERRIDES[tag];
	let hash = 0;
	for (const ch of tag) hash = (hash * 31 + ch.codePointAt(0)!) % 1_000_003;
	return hash % 5;
};
