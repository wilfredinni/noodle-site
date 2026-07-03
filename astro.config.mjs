// @ts-check
import { defineConfig } from "astro/config"
import starlight from "@astrojs/starlight"

export default defineConfig({
  site: "https://noodle.dev",
  integrations: [
    starlight({
      title: "Noodle Docs",
      description: "Terminal REST client — inspect, send, and iterate on HTTP requests from YAML files on disk.",
      favicon: "/favicon.ico",
      head: [
        {
          tag: "link",
          attrs: {
            rel: "apple-touch-icon",
            sizes: "180x180",
            href: "/apple-touch-icon.png",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "icon",
            type: "image/png",
            sizes: "32x32",
            href: "/favicon-32x32.png",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "icon",
            type: "image/png",
            sizes: "16x16",
            href: "/favicon-16x16.png",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "manifest",
            href: "/site.webmanifest",
          },
        },
      ],
      customCss: ["./src/styles/catppuccin.css"],
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/wilfredinni/noodle" },
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Installation", slug: "docs/getting-started/installation" },
            { label: "Quick Start", slug: "docs/getting-started/quick-start" },
            { label: "CLI Commands", slug: "docs/getting-started/cli" },
          ],
        },
        {
          label: "Guides",
          items: [
            { label: "Collection Format", slug: "docs/guides/collections" },
            { label: "Requests", slug: "docs/guides/requests" },
            { label: "Environments", slug: "docs/guides/environments" },
            { label: "Authentication", slug: "docs/guides/authentication" },
            { label: "Response Handling", slug: "docs/guides/responses" },
          ],
        },
        {
          label: "UI Reference",
          items: [
            { label: "Keybindings", slug: "docs/reference/keybindings" },
            { label: "Theming", slug: "docs/reference/theming" },
            { label: "Layout", slug: "docs/reference/layout" },
          ],
        },
        {
          label: "Import",
          items: [
            { label: "OpenAPI", slug: "docs/import/openapi" },
            { label: "Postman", slug: "docs/import/postman" },
          ],
        },
      ],
    }),
  ],
})
