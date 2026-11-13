interface BlogSlugEntry {
  id: string;
  data: {
    slug?: string;
  };
}

export function getBlogEntrySlug(entry: BlogSlugEntry): string {
  const slug = entry.data.slug ?? entry.id.replace(/\.md$/, '');
  return slug.replace(/^\/+|\/+$/g, '');
}

export function getBlogPostPath(slug: string): string {
  const encodedSlug = slug.split('/').map(encodeURIComponent).join('/');
  return `/blog/${encodedSlug}`;
}
