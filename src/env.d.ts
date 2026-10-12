/// <reference types="@cloudflare/workers-types" />

interface Env {
  LEADS_DB: D1Database;
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
}
