import { defineConfig } from 'astro/config';
import { readdirSync, readFileSync } from 'node:fs';
import { copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const site = 'https://juttaiblog.online';
const blogDirectory = fileURLToPath(new URL('./src/content/blog/', import.meta.url));

function getBlogPages(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((file) => {
    const filePath = path.join(directory, file.name);
    if (file.isDirectory()) return getBlogPages(filePath);
    if (!file.isFile() || !file.name.endsWith('.md')) return [];

    const content = readFileSync(filePath, 'utf8');
    const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const slugField = frontmatter?.[1].match(/^slug:\s*(?:"([^"]+)"|'([^']+)'|([^#\s]+))\s*$/m);
    const slug = (slugField?.[1] ?? slugField?.[2] ?? slugField?.[3] ??
      path.relative(blogDirectory, filePath).replace(/\\/g, '/').replace(/\.md$/, ''))
      .replace(/^\/+|\/+$/g, '');
    const encodedSlug = slug.split('/').map(encodeURIComponent).join('/');

    return [new URL(`/blog/${encodedSlug}`, site).href];
  });
}

const sitemapAlias = {
  name: 'sitemap-root-alias',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      await copyFile(new URL('sitemap-index.xml', dir), new URL('sitemap.xml', dir));
    },
  },
};

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  site,
  trailingSlash: 'never',
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({ customPages: getBlogPages(blogDirectory) }),
    sitemapAlias,
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});