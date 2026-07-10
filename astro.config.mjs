// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://agnesv1.github.io',
	integrations: [mdx(), sitemap()],
	redirects: {
		'/blog': '/',
		// 旧 Hexo 站的文章地址 → 新地址，老链接不失效
		'/2019/07/14/Adorno-On-popular-music': '/blog/adorno-on-popular-music',
		'/2019/06/13/the-late-capitalism-of-K-pop': '/blog/the-late-capitalism-of-k-pop',
		'/2024/03/31/Rian-Doris': '/blog/rian-doris',
	},
	markdown: {
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark' },
			defaultColor: false,
		},
	},
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Space Grotesk',
			cssVariable: '--font-display',
			weights: [400, 500, 700],
			styles: ['normal'],
			subsets: ['latin'],
			fallbacks: ['PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
		},
	],
});
