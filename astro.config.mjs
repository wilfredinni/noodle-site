// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";
import starlightLlmsTxt from "starlight-llms-txt";
import { readdirSync, readFileSync } from "node:fs";
import { basename, extname } from "node:path";

const lastModified = new Map();

for (const file of readdirSync("./src/content/blog")) {
  if (!/\.mdx?$/.test(file)) continue;

  const source = readFileSync(`./src/content/blog/${file}`, "utf8");
  const date = source.match(/^updatedDate:\s*["']?([^"'\n]+)["']?$/m)?.[1]
    ?? source.match(/^date:\s*["']?([^"'\n]+)["']?$/m)?.[1];

  if (date) lastModified.set(`/blog/${basename(file, extname(file))}/`, date.trim());
}

const latestArticleDate = [...lastModified.values()].sort().at(-1);
if (latestArticleDate) {
  for (const path of ["/", "/blog/", "/releases/"]) lastModified.set(path, latestArticleDate);
}
lastModified.set("/compare/", "2026-08-19");

export default defineConfig({
  site: "https://noodlerest.dev",
  image: {
    domains: ["github.com", "avatars.githubusercontent.com"],
  },
  integrations: [
    sitemap({
      filter: (page) => new URL(page).pathname !== "/rss.xml",
      serialize(item) {
        const date = lastModified.get(new URL(item.url).pathname);
        if (date) item.lastmod = new Date(date).toISOString();
        return item;
      },
    }),
    starlight({
      title: "Noodle",
      plugins: [starlightLlmsTxt()],
      description:
        "Terminal REST client for inspecting, sending, and iterating on HTTP requests from YAML files on disk.",
      logo: {
        dark: "./src/assets/noodle/logo-kraken-neutral.svg",
        light: "./src/assets/noodle/logo-kraken-dark.svg",
        alt: "Noodle",
      },
      expressiveCode: {
        defaultProps: {
          frame: "none",
        },
      },
      favicon: "/favicon.ico?v=3",
      head: [
        {
          tag: "link",
          attrs: {
            rel: "apple-touch-icon",
            sizes: "180x180",
            href: "/apple-touch-icon.png?v=3",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "icon",
            type: "image/png",
            sizes: "32x32",
            href: "/favicon-32x32.png?v=3",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "icon",
            type: "image/png",
            sizes: "16x16",
            href: "/favicon-16x16.png?v=3",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "manifest",
            href: "/site.webmanifest?v=3",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "alternate",
            type: "application/rss+xml",
            title: "Noodle Blog",
            href: "/rss.xml",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "sitemap",
            href: "/sitemap-index.xml",
          },
        },
        {
          tag: "meta",
          attrs: {
            name: "robots",
            content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:image",
            content: "https://noodlerest.dev/social/og-default.png",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:image:alt",
            content: "Noodle terminal REST client",
          },
        },
        { tag: "meta", attrs: { property: "og:image:width", content: "1200" } },
        { tag: "meta", attrs: { property: "og:image:height", content: "630" } },
        {
          tag: "meta",
          attrs: {
            name: "twitter:image",
            content: "https://noodlerest.dev/social/og-default.png",
          },
        },
        {
          tag: "meta",
          attrs: {
            name: "twitter:image:alt",
            content: "Noodle terminal REST client",
          },
        },
      ],
      customCss: ["./src/styles/catppuccin.css"],
      components: {
        SiteTitle: "./src/components/SiteTitle.astro",
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/wilfredinni/noodle",
        },
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            {
              label: "Installation",
              slug: "docs/getting-started/installation",
            },
            { label: "Quick Start", slug: "docs/getting-started/quick-start" },
            { label: "Concepts", slug: "docs/getting-started/concepts" },
            { label: "CLI Commands", slug: "docs/getting-started/cli" },
          ],
        },
        {
          label: "AI Agents",
          items: [
            { label: "Agent Skills", slug: "docs/guides/ai-agent-skills" },
          ],
        },
        {
          label: "Guides",
          items: [
            { label: "Layout", slug: "docs/reference/layout" },
            { label: "Settings", slug: "docs/guides/settings" },
            { label: "Collections", slug: "docs/guides/collections" },
            { label: "Automation", slug: "docs/guides/automation" },
            {
              label: "Using the Sidebar",
              slug: "docs/guides/using-the-sidebar",
            },
            {
              label: "Using the Request Pane",
              slug: "docs/guides/using-the-request-pane",
            },
            { label: "Code Editor", slug: "docs/guides/code-editor" },
            {
              label: "Using the Response Pane",
              slug: "docs/guides/using-the-response-pane",
            },
            {
              label: "Using Environments",
              slug: "docs/guides/using-environments",
            },
            { label: "Using Folders", slug: "docs/guides/using-folders" },
            { label: "Authentication", slug: "docs/guides/authentication" },
          ],
        },
        {
          label: "Import & Export",
          items: [
            { label: "Import Collections", slug: "docs/import/import" },
            { label: "Collection Export", slug: "docs/import/export" },
          ],
        },
        {
          label: "Reference",
          items: [
            {
              label: "Collection Format",
              slug: "docs/reference/collection-format",
            },
            {
              label: "Environment Format",
              slug: "docs/reference/environment-format",
            },
            { label: "Timeline", slug: "docs/reference/timeline" },
            { label: "Keybindings", slug: "docs/reference/keybindings" },
            { label: "Themes", slug: "docs/reference/theming" },
            { label: "Configuration", slug: "docs/reference/configuration" },
          ],
        },
      ],
    }),
  ],
});
