import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import {
  allowRequest,
  createAdminSession,
  hasSameOrigin,
  setAdminSessionCookie,
  verifyAdminPassword,
} from '../../../lib/lead-security';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!hasSameOrigin(request)) return Response.json({ message: 'Invalid request origin.' }, { status: 403 });
  if (
    !env.ADMIN_PASSWORD ||
    env.ADMIN_PASSWORD.length < 16 ||
    !env.SESSION_SECRET ||
    env.SESSION_SECRET.length < 32
  ) {
    return Response.json({ message: 'Admin authentication is not configured.' }, { status: 503 });
  }

  try {
    if (!(await allowRequest(request, 'admin-login', 5, 15 * 60))) {
      return Response.json({ message: 'Too many login attempts. Try again later.' }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ message: 'Invalid login request.' }, { status: 400 });
    }

    if (typeof body !== 'object' || body === null || Array.isArray(body) ||
        !('password' in body) || typeof body.password !== 'string' || body.password.length > 256) {
      return Response.json({ message: 'Invalid login request.' }, { status: 400 });
    }
    if (!(await verifyAdminPassword(body.password))) {
      return Response.json({ message: 'The password is incorrect.' }, { status: 401 });
    }

    const token = await createAdminSession();
    return Response.json(
      { ok: true },
      { headers: { 'Set-Cookie': setAdminSessionCookie(request, token), 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('Admin login failed:', error);
    return Response.json({ message: 'Could not sign in. Please try again later.' }, { status: 500 });
  }
};
