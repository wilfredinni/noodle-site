import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { glob } from 'astro/loaders';

export const collections = {
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
	changelog: defineCollection({
		loader: glob({ pattern: "**/*.mdx", base: "./src/content/changelog" }),
		schema: z.object({
			title: z.string(),
			tag: z.string(),
			date: z.string(),
			url: z.string(),
		}),
	}),
};
