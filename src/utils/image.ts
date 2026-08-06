import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('../../', import.meta.url));
const placeholderImage = '/images/blog/placeholder.svg';

export function resolveImagePath(imagePath?: string | null) {
  if (!imagePath) return placeholderImage;

  if (/^https?:\/\//i.test(imagePath) || imagePath.startsWith('//')) {
    return imagePath;
  }

  const normalizedPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  const publicPath = path.join(rootDir, 'public', normalizedPath);

  return existsSync(publicPath) ? `/${normalizedPath}` : placeholderImage;
}

export function getReadingTime(content = '') {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}
