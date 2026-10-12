import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({ prerenderEnvironment: 'node' }),
  site: 'https://juttaiblog.online',
  integrations: [sitemap()],
});