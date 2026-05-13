import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import { rewriteMdLinks } from './src/lib/rewrite-md-links.ts';

export default defineConfig({
  site: 'https://theufofiles.com',
  integrations: [mdx({ rehypePlugins: [rewriteMdLinks] })],
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
