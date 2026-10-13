// prompt 类文章的纯文本版：/blog/<slug>.txt，方便整页交给 AI（和文章页复制按钮拿到的是同一段）
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { isPrompt, promptText } from '../../lib/prompt';

export const getStaticPaths: GetStaticPaths = async () =>
	(await getCollection('blog'))
		.filter((post) => isPrompt(post.data.tags))
		.map((post) => ({ params: { slug: post.id }, props: { post } }));

export const GET: APIRoute = ({ props, site }) =>
	new Response(promptText(props.post, new URL(`/blog/${props.post.id}/`, site).href), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
