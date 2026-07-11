import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// 文件名不做 slug 化处理，保留 `.en` 后缀：`foo.en.md` 是 `foo.md` 的英文版。
const generateId = ({ entry }: { entry: string }) => entry.replace(/\.(md|mdx)$/, '');

const postSchema = ({ image }: { image: () => z.ZodTypeAny }) =>
	z.object({
		title: z.string(),
		description: z.string().default(''),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.optional(image()),
		// 'zh' 中文文章 / 'en' 英文文章
		lang: z.enum(['zh', 'en']).default('zh'),
		tags: z.array(z.string()).default([]),
		// 可选的文末参考文献：写了才显示，渲染为可折叠区块。
		// 每项可以是一句话字符串，或 { title, url?, author? } 对象。
		references: z
			.array(
				z.union([
					z.string(),
					z.object({
						title: z.string(),
						url: z.string().url().optional(),
						author: z.string().optional(),
					}),
				]),
			)
			.default([]),
	});

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}', generateId }),
	schema: postSchema,
});

// 写作栏目：虚构写作（短篇、片段）。
const writing = defineCollection({
	loader: glob({ base: './src/content/writing', pattern: '**/*.{md,mdx}', generateId }),
	schema: postSchema,
});

export const collections = { blog, writing };
