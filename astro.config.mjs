// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://splendorous-biscuit-76f9e8.netlify.app',
  integrations: [sitemap()],
});
