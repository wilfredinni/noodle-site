import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { glob } from 'astro/loaders';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema(),
	}),
	blog: defineCollection({
		loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
		schema: z.object({
			title: z.string(),
			description: z.string().optional(),
			date: z.coerce.date(),
			author: z.object({
				name: z.string(),
				title: z.string().optional(),
				url: z.string().optional(),
				picture: z.string().optional(),
			}).optional(),
			tags: z.array(z.string()).default([]),
		}),
	}),
};


