import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { rewriteMdLinks } from './src/lib/rewrite-md-links.ts';

export default defineConfig({
  site: 'https://the-ufo-files-site.netlify.app',
  integrations: [
    mdx({ rehypePlugins: [rewriteMdLinks] }),
    react({ include: ['**/graph/**'] }),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        external: [/^\/pagefind\//],
      },
    },
  },
  markdown: {
    rehypePlugins: [rewriteMdLinks],
    shikiConfig: { theme: 'github-dark-default', wrap: true },
  },
  devToolbar: { enabled: false },
});
