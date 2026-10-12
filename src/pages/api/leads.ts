import { env } from 'cloudflare:workers';
import type { APIRoute } from 'astro';
import { allowRequest } from '../../lib/lead-security';

export const prerender = false;

const services = new Set([
  'Website development',
  'Website sales improvement',
  'Website SEO optimization',
  'Social media content for shops',
  'Software development',
  'Shopify store development',
  'Shopify product listing and SEO',
]);

const budgets = new Set([
  'Under $1,000',
  '$1,000 - $3,000',
  '$3,000 - $7,000',
  '$7,000 - $15,000',
  '$15,000+',
  'Prefer not to say',
]);

function field(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function response(message: string, status: number) {
  return Response.json({ ok: status < 400, message }, { status });
}

export const POST: APIRoute = async ({ request }) => {
  if (!request.headers.get('content-type')?.includes('multipart/form-data') &&
      !request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
    return response('Invalid form submission.', 415);
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > 16_384) return response('The form submission is too large.', 413);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return response('Invalid form submission.', 400);
  }
  if (field(form, 'website')) return response('Unable to accept this submission.', 400);

  const name = field(form, 'name');
  const email = field(form, 'email');
  const businessName = field(form, 'brand');
  const service = field(form, 'service');
  const budget = field(form, 'budget');
  const description = field(form, 'message');

  if (
    name.length < 1 ||
    name.length > 120 ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    businessName.length > 160 ||
    !services.has(service) ||
    !budgets.has(budget) ||
    description.length < 1 ||
    description.length > 5_000
  ) {
    return response('Please check the fields and try again.', 400);
  }

  try {
    if (!(await allowRequest(request, 'lead-submit', 8, 60 * 60))) {
      return response('Too many submissions. Please try again later.', 429);
    }

    const result = await env.LEADS_DB.prepare(`
      INSERT INTO leads (id, name, email, business_name, service, budget, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
      .bind(crypto.randomUUID(), name, email, businessName, service, budget, description)
      .run();

    if (!result.success) {
      return response('We could not save your enquiry. Please try again later.', 500);
    }
    return response('Your enquiry has been received.', 201);
  } catch (error) {
    console.error('Lead submission failed:', error);
    return response('We could not save your enquiry. Please try again later.', 500);
  }
};
