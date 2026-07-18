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

// 短札：千字以内的短文本，与长文平行存在。不生成详情页，正文直接在列表里展开。
const cards = defineCollection({
	loader: glob({ base: './src/content/cards', pattern: '**/*.{md,mdx}', generateId }),
	schema: (ctx) =>
		postSchema(ctx).extend({
			// 短札可以没有标题：列表里用日期锚点当标识
			title: z.string().optional(),
			// 归属栏目：notes → 首页混排时间流；fiction → /writing 便签墙
			section: z.enum(['notes', 'fiction']).default('notes'),
		}),
});

export const collections = { blog, writing, cards };
