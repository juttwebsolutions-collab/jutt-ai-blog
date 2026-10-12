// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  session: false,
  adapter: cloudflare({
    imageService: 'passthrough',
    imagesBindingName: false,
    prerenderEnvironment: 'node',
  }),
  site: 'https://yourdomain.com',
  integrations: [sitemap()],
});
