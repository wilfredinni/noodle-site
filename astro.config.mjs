// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://noodlerest.dev",
  image: {
    domains: ["github.com", "avatars.githubusercontent.com"],
  },
  integrations: [
    starlight({
      title: "Noodle",
      description:
        "Terminal REST client — inspect, send, and iterate on HTTP requests from YAML files on disk.",
      logo: {
        src: "./src/assets/logo.png",
        alt: "Noodle",
      },
      expressiveCode: {
        defaultProps: {
          frame: "none",
        },
      },
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
            { label: "Collections", slug: "docs/guides/collections" },
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
          label: "Import",
          items: [
            { label: "OpenAPI", slug: "docs/import/openapi" },
            { label: "Postman", slug: "docs/import/postman" },
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
