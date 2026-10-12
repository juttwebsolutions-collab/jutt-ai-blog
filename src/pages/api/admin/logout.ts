import type { APIRoute } from 'astro';
import { clearAdminSessionCookie, hasAdminSession, hasSameOrigin } from '../../../lib/lead-security';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!hasSameOrigin(request)) return Response.json({ message: 'Invalid request origin.' }, { status: 403 });
  if (!(await hasAdminSession(request))) {
    return Response.json({ message: 'Not authenticated.' }, { status: 401 });
  }

  return Response.json(
    { ok: true },
    { headers: { 'Set-Cookie': clearAdminSessionCookie(request), 'Cache-Control': 'no-store' } },
  );
};
