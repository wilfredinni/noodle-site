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
          label: "Get started",
          items: [
            { label: "Docs overview", slug: "docs" },
            { label: "Installation", slug: "docs/getting-started/installation" },
            { label: "Your first request", slug: "docs/getting-started/quick-start" },
            { label: "Core concepts", slug: "docs/getting-started/concepts" },
            { label: "Layout and navigation", slug: "docs/reference/layout" },
          ],
        },
        {
          label: "Requests and responses",
          items: [
            { label: "Create and send requests", slug: "docs/guides/using-the-request-pane" },
            { label: "Authentication", slug: "docs/guides/authentication" },
            { label: "Inspect and save responses", slug: "docs/guides/using-the-response-pane" },
            { label: "Cookies", slug: "docs/guides/cookies" },
            { label: "Code editor", slug: "docs/guides/code-editor" },
          ],
        },
        {
          label: "Collections and environments",
          items: [
            { label: "Collections", slug: "docs/guides/collections" },
            { label: "Find requests", slug: "docs/guides/using-the-sidebar" },
            { label: "Folders and inheritance", slug: "docs/guides/using-folders" },
            { label: "Environments and secrets", slug: "docs/guides/using-environments" },
            { label: "Import", slug: "docs/import/import" },
            { label: "Export", slug: "docs/import/export" },
          ],
        },
        {
          label: "Testing and automation",
          items: [
            { label: "Collection Runner", slug: "docs/guides/collection-runner" },
            { label: "Capture and reuse values", slug: "docs/guides/captures" },
            { label: "Response assertions", slug: "docs/guides/assertions" },
            { label: "CLI automation and CI", slug: "docs/guides/automation" },
            { label: "AI agent skills", slug: "docs/guides/ai-agent-skills" },
          ],
        },
        {
          label: "Scripting",
          items: [
            { label: "Scripting", slug: "docs/guides/pre-request-scripting" },
            { label: "Scripted tests", slug: "docs/guides/scripted-tests" },
            { label: "Script cookbook", slug: "docs/guides/script-cookbook" },
            { label: "Script API", slug: "docs/reference/script-api" },
          ],
        },
        {
          label: "Settings and help",
          items: [
            { label: "Settings", slug: "docs/guides/settings" },
            { label: "Proxies and TLS", slug: "docs/guides/proxies-and-tls" },
            { label: "Themes", slug: "docs/reference/theming" },
            { label: "Troubleshooting", slug: "docs/guides/troubleshooting" },
          ],
        },
        {
          label: "Reference",
          items: [
            { label: "CLI commands", slug: "docs/getting-started/cli" },
            { label: "Collection YAML", slug: "docs/reference/collection-format" },
            { label: "Environment files", slug: "docs/reference/environment-format" },
            { label: "Global configuration", slug: "docs/reference/configuration" },
            { label: "Keybindings", slug: "docs/reference/keybindings" },
            { label: "Timeline storage", slug: "docs/reference/timeline" },
          ],
        },
      ],
    }),
  ],
});
