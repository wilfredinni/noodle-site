import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
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
			description: z.string(),
			date: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			author: z.object({
				name: z.string(),
				title: z.string().optional(),
				url: z.string().optional(),
				picture: z.string().optional(),
			}),
			tags: z.array(z.string()).default([]),
		}),
	}),
};
