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

	// 所有条目全文进 feed。用 Container 走站内完整 Markdown 管线渲染，
	// 这样 ||星尘遮掩|| 的文字在 feed 里也只是乱码占位，不会泄露明文。
	const renderers = await loadRenderers([getMDXRenderer()]);
	const container = await AstroContainer.create({ renderers });

	// 阅读器不解析相对路径：正文里的站内图片/链接补成绝对地址
	const site = String(context.site).replace(/\/$/, '');
	const fullText = async (entry) => {
		const { Content } = await render(entry);
		const html = await container.renderToString(Content);
		return html.replaceAll('src="/', `src="${site}/`).replaceAll('href="/', `href="${site}/`);
	};

	const items = [];

	// `.en` 结尾的是配对翻译，跳过避免重复条目
	for (const post of blog.filter((p) => !p.id.endsWith('.en'))) {
		items.push({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			categories: post.data.tags,
			link: `/blog/${post.id}/`,
			content: await fullText(post),
		});
	}

	for (const piece of writing) {
		items.push({
			title: piece.data.title,
			description: piece.data.description,
			pubDate: piece.data.pubDate,
			categories: ['writing', ...piece.data.tags],
			link: `/writing/${piece.id}/`,
			content: await fullText(piece),
		});
	}

	// 短札没有详情页，链接指向列表页锚点。锚点链接必须拼成完整 URL 原样输出：
	// 交给 @astrojs/rss 规范化会在 #fragment 后面追加尾斜杠，锚点就对不上卡片 id 了
	for (const card of cards.filter((c) => !c.id.endsWith('.en'))) {
		const anchor = `c-${card.id.replaceAll('/', '-')}`;
		const page = card.data.section === 'fiction' ? '/writing/' : '/';
		items.push({
			title: card.data.title ?? `短札 ${card.data.pubDate.toISOString().slice(0, 10)}`,
			description: card.data.description,
			pubDate: card.data.pubDate,
			categories: ['card', ...card.data.tags],
			link: new URL(`${page}#${anchor}`, context.site).href,
			content: await fullText(card),
		});
	}

	items.sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		xmlns: {
			sy: 'http://purl.org/rss/1.0/modules/syndication/',
			atom: 'http://www.w3.org/2005/Atom',
		},
		customData: [
			'<language>zh-CN</language>',
			// feed 自述地址：RSS 校验器与部分阅读器要求
			`<atom:link href="${site}/rss.xml" rel="self" type="application/rss+xml"/>`,
			// 给阅读器的刷新频率提示（仅是建议，实际抓取节奏由订阅者的阅读器决定）
			'<sy:updatePeriod>daily</sy:updatePeriod>',
			'<sy:updateFrequency>1</sy:updateFrequency>',
		].join(''),
		items,
	});
}
