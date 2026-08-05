import { getCollection } from 'astro:content';

export async function GET() {
  const baseUrl = 'https://juttaiblog.online';
  const entries = await getCollection('blog');
  const postUrls = entries.map((entry) => `/blog/${entry.data.slug ?? entry.id.replace(/\.md$/, '')}`);
  const pages = ['/', '/blog', '/about', '/contact'];
  const urls = [...pages, ...postUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls
    .map((url) => `\n  <url>\n    <loc>${baseUrl}${url}</loc>\n  </url>`)
    .join('')}\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
}
