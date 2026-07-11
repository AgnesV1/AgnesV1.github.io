import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export async function GET(context) {
	const blog = await getCollection('blog');
	const writing = await getCollection('writing');

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
