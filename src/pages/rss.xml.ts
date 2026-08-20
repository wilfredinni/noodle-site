import type { APIRoute } from "astro"
import { getArticles } from "../lib/articles"

const escapeXml = (value: string) => value.replace(/[<>&"']/g, (character) => ({
  "<": "&lt;",
  ">": "&gt;",
  "&": "&amp;",
  "\"": "&quot;",
  "'": "&apos;",
})[character]!)

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL("https://noodlerest.dev")
  const posts = await getArticles()
  const feedUrl = new URL("/rss.xml", base).href
  const homeUrl = new URL("/blog/", base).href
  const items = posts.map((post) => {
    const url = new URL(`/blog/${post.id}/`, base).href
    return `<item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${post.data.date.toUTCString()}</pubDate>
      <description>${escapeXml(post.data.description)}</description>
      ${post.data.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("\n      ")}
    </item>`
  }).join("\n    ")

  const lastBuildDate = (posts[0]?.data.updatedDate ?? posts[0]?.data.date)?.toUTCString()
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Noodle Blog</title>
    <description>Updates, architecture, and feature deep-dives from the creators of the Noodle terminal REST client.</description>
    <link>${homeUrl}</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <language>en</language>
    ${lastBuildDate ? `<lastBuildDate>${lastBuildDate}</lastBuildDate>` : ""}
    ${items}
  </channel>
</rss>`

  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  })
}
