import { getCollection } from 'astro:content';
import { posts } from '../data/posts';

export async function GET() {
  const baseUrl = 'https://juttaiblog.online';
  const pages = ['/', '/blog', '/about', '/contact', '/privacy'];
  const postUrls = posts.map((post) => `/blog/${post.slug}`);
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
