import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { hasAdminSession, hasSameOrigin } from '../../../../lib/lead-security';

export const prerender = false;

const statuses = new Set(['new', 'contacted', 'completed']);

export const PATCH: APIRoute = async ({ params, request }) => {
  if (!(await hasAdminSession(request))) {
    return Response.json({ message: 'Not authenticated.' }, { status: 401 });
  }
  if (!hasSameOrigin(request)) {
    return Response.json({ message: 'Invalid request origin.' }, { status: 403 });
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ message: 'Invalid status update.' }, { status: 400 });
    }
    if (
      typeof body !== 'object' ||
      body === null ||
      Array.isArray(body) ||
      !('status' in body) ||
      typeof body.status !== 'string' ||
      !statuses.has(body.status)
    ) {
      return Response.json({ message: 'Invalid lead status.' }, { status: 400 });
    }

    const result = await env.LEADS_DB.prepare('UPDATE leads SET status = ? WHERE id = ?')
      .bind(body.status, params.id ?? '')
      .run();
    if (!result.success) {
      return Response.json({ message: 'Could not update the lead.' }, { status: 500 });
    }
    if (!result.meta.changes) {
      return Response.json({ message: 'Lead not found.' }, { status: 404 });
    }
    return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Lead status update failed:', error);
    return Response.json({ message: 'Could not update the lead.' }, { status: 500 });
  }
};
