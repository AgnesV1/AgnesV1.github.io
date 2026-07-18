import { getContainerRenderer as getMDXRenderer } from '@astrojs/mdx';
import rss from '@astrojs/rss';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getCollection, render } from 'astro:content';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export async function GET(context) {
	const blog = await getCollection('blog');
	const writing = await getCollection('writing');
	const cards = await getCollection('cards');

	// 短札没有详情页：正文全文直接进 feed。用 Container 走站内完整 Markdown 管线渲染，
	// 这样 ||星尘遮掩|| 的文字在 feed 里也只是乱码占位，不会泄露明文。
	const renderers = await loadRenderers([getMDXRenderer()]);
	const container = await AstroContainer.create({ renderers });

	const cardItems = [];
	// `.en` 结尾的是配对翻译，跳过避免重复条目（与 blog 同规则）
	for (const card of cards.filter((c) => !c.id.endsWith('.en'))) {
		const { Content } = await render(card);
		const html = await container.renderToString(Content);
		const anchor = `c-${card.id.replaceAll('/', '-')}`;
		const page = card.data.section === 'fiction' ? '/writing/' : '/';
		cardItems.push({
			title: card.data.title ?? `短札 ${card.data.pubDate.toISOString().slice(0, 10)}`,
			description: card.data.description,
			pubDate: card.data.pubDate,
			categories: ['card', ...card.data.tags],
			link: `${page}#${anchor}`,
			content: html,
		});
	}

	const items = [
		// `.en` 结尾的是配对翻译，不重复进 feed（订阅者只收到一条）
		...blog
			.filter((post) => !post.id.endsWith('.en'))
			.map((post) => ({
				title: post.data.title,
				description: post.data.description,
				pubDate: post.data.pubDate,
				categories: post.data.tags,
				link: `/blog/${post.id}/`,
			})),
		...writing.map((piece) => ({
			title: piece.data.title,
			description: piece.data.description,
			pubDate: piece.data.pubDate,
			categories: ['writing', ...piece.data.tags],
			link: `/writing/${piece.id}/`,
		})),
		...cardItems,
	].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		xmlns: { sy: 'http://purl.org/rss/1.0/modules/syndication/' },
		// 给阅读器的刷新频率提示（仅是建议，实际抓取节奏由订阅者的阅读器决定）
		customData: [
			'<language>zh-CN</language>',
			'<sy:updatePeriod>daily</sy:updatePeriod>',
			'<sy:updateFrequency>1</sy:updateFrequency>',
		].join(''),
		items,
	});
}
