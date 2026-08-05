import { getCollection } from 'astro:content';

export async function GET() {
  const baseUrl = 'https://juttaiblog.online';
  const posts = (await getCollection('blog'))
    .map((entry) => {
      const slug = entry.data.slug ?? entry.id.replace(/\.md$/, '');
      const pubDate = entry.data.pubDate instanceof Date ? entry.data.pubDate : new Date(entry.data.pubDate);
      return {
        title: entry.data.title,
        description: entry.data.description,
        link: `${baseUrl}/blog/${slug}`,
        pubDate: pubDate.toUTCString()
      };
    })
    .sort((a, b) => new Date(b.pubDate).valueOf() - new Date(a.pubDate).valueOf());

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Jutt AI Blog</title>
    <link>${baseUrl}</link>
    <description>A simple AI blog with clear articles and practical insights.</description>
    ${posts
      .map(
        (post) => `
    <item>
      <title>${post.title}</title>
      <link>${post.link}</link>
      <description>${post.description}</description>
      <pubDate>${post.pubDate}</pubDate>
    </item>`
      )
      .join('')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
}
