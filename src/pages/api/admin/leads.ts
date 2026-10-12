import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { hasAdminSession } from '../../../lib/lead-security';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  if (!(await hasAdminSession(request))) {
    return Response.json({ message: 'Not authenticated.' }, { status: 401 });
  }

  try {
    const { results } = await env.LEADS_DB.prepare(`
      SELECT id, name, email, business_name, service, budget, description, status, created_at
      FROM leads
      ORDER BY created_at DESC
    `).all();
    return Response.json(results, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Lead list request failed:', error);
    return Response.json({ message: 'Could not load leads.' }, { status: 500 });
  }
};
