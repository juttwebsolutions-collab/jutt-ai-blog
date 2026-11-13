import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
  const { pathname, search } = new URL(context.request.url);
  if (!pathname.startsWith('/blog/') || !pathname.endsWith('/')) return next();

  const canonicalPath = pathname.replace(/\/+$/, '') || '/';
  return context.redirect(`${canonicalPath}${search}`, 301);
});
