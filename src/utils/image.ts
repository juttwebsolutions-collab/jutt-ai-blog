const placeholderImage = '/images/blog/placeholder.svg';

export function resolveImagePath(imagePath?: string | null) {
  if (!imagePath) return placeholderImage;

  const value = imagePath.trim();

  if (!value) return placeholderImage;
  if (/^https?:\/\//i.test(value) || value.startsWith('//') || value.startsWith('data:')) {
    return value;
  }

  const cleanedPath = value.replace(/^public\//, '').replace(/^\/+/, '');
  return cleanedPath ? `/${cleanedPath}` : placeholderImage;
}

export function getReadingTime(content = '') {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}
