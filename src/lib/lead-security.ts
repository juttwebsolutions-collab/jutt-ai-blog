import { env } from 'cloudflare:workers';

const SESSION_COOKIE = 'jutt_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function hmac(value: string) {
  const secret = env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must contain at least 32 characters.');
  }

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)));
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array) {
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return difference === 0;
}

export async function verifyAdminPassword(password: string) {
  if (!env.ADMIN_PASSWORD) return false;
  const [provided, configured] = await Promise.all([
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(password)),
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(env.ADMIN_PASSWORD)),
  ]);
  return constantTimeEqual(new Uint8Array(provided), new Uint8Array(configured));
}

export async function createAdminSession() {
  const issuedAt = Math.floor(Date.now() / 1000);
  const nonce = crypto.getRandomValues(new Uint8Array(16));
  const payload = `${issuedAt}.${bytesToBase64Url(nonce)}`;
  const signature = await hmac(payload);
  return `${payload}.${bytesToBase64Url(signature)}`;
}

export async function hasAdminSession(request: Request) {
  const cookie = request.headers.get('cookie') ?? '';
  const raw = cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);
  if (!raw) return false;

  const [issuedAtText, nonce, signature, ...extra] = raw.split('.');
  if (!issuedAtText || !nonce || !signature || extra.length || !/^\d+$/.test(issuedAtText)) {
    return false;
  }

  const issuedAt = Number(issuedAtText);
  const now = Math.floor(Date.now() / 1000);
  if (issuedAt > now || now - issuedAt > SESSION_TTL_SECONDS) return false;

  try {
    const expected = await hmac(`${issuedAtText}.${nonce}`);
    return constantTimeEqual(expected, base64UrlToBytes(signature));
  } catch {
    return false;
  }
}

export function setAdminSessionCookie(request: Request, token: string) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}${secure}`;
}

export function clearAdminSessionCookie(request: Request) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${secure}`;
}

export function hasSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  return origin !== null && origin === new URL(request.url).origin;
}

export async function allowRequest(request: Request, scope: string, limit: number, windowSeconds: number) {
  const ip = request.headers.get('cf-connecting-ip') ?? 'local';
  const key = bytesToBase64Url(await hmac(`${scope}:${ip}`));
  const result = await env.LEADS_DB.prepare(`
    INSERT INTO rate_limits (key, count, window_started_at)
    VALUES (?, 1, unixepoch())
    ON CONFLICT(key) DO UPDATE SET
      count = CASE
        WHEN rate_limits.window_started_at <= unixepoch() - ? THEN 1
        ELSE rate_limits.count + 1
      END,
      window_started_at = CASE
        WHEN rate_limits.window_started_at <= unixepoch() - ? THEN unixepoch()
        ELSE rate_limits.window_started_at
      END
    RETURNING count
  `)
    .bind(key, windowSeconds, windowSeconds)
    .first<{ count: number }>();

  return (result?.count ?? limit + 1) <= limit;
}
