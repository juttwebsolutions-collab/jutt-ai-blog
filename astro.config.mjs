import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static', // Server ki jagah static kar dein
  site: 'https://juttaiblog.online',
  integrations: [sitemap()],
});