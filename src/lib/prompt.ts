// prompt 类的文章：第一读者是 AI——整页复制给自己的助手，让它对照自己的情况挑着用；图是给人看的。
// 文章带 `prompt` 这个 tag 就算。这里把正文源码整理成一段干净的纯文本，给 /blog/<slug>.txt 用。
import type { CollectionEntry } from 'astro:content';

export const PROMPT_TAG = 'prompt';
export const isPrompt = (tags: string[] = []) => tags.includes(PROMPT_TAG);

const svgs = import.meta.glob<string>('../figures/*.svg', { query: '?raw', import: 'default', eager: true });

// 图在纯文本里换成一句话：取 svg 自己的 aria-label
const figureLabel = (name: string) => {
	const label = /aria-label="([^"]*)"/.exec(svgs[`../figures/${name}.svg`] ?? '')?.[1];
	return (label ?? name).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
};

export function promptText(post: CollectionEntry<'blog'>, url: string): string {
	const body = (post.body ?? '')
		.replace(/^import .*$/gm, '')
		.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
		.replace(/<PromptNote\s*\/>/g, '')
		.replace(/<Fig\s+name="([^"]+)"[^>]*\/>/g, (_, name) => `[Figure: ${figureLabel(name)}]`)
		.replace(/<Shot\s+[^>]*?alt="([^"]*)"[^>]*\/>/g, (_, alt) => `[Screenshot: ${alt}]`)
		.replace(/<\/?div[^>]*>/g, '')
		.replace(/!\[([^\]]*)\]\([^)]*\)/g, (_, alt) => (alt ? `[Screenshot: ${alt}]` : ''))
		.replace(/\n{3,}/g, '\n\n')
		.trim();
	const { title, description } = post.data;
	return `# ${title}\n\n${description ? description + '\n\n' : ''}Source: ${url}\n\n${body}\n`;
}
