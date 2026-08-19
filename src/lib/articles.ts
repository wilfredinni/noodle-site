import { getCollection } from "astro:content"

export const ARTICLES_PER_PAGE = 10

export async function getArticles(tag?: string) {
  const posts = (await getCollection("blog")).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  )

  return tag ? posts.filter((post) => post.data.tags.includes(tag)) : posts
}
