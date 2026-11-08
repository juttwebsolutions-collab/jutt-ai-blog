import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { tools } from '../../data/tools';

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

interface RuntimeEnv {
  runtime?: {
    env?: {
      GEMINI_API_KEY?: string;
    };
  };
}

const jsonResponse = (body: Record<string, string>, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });

export const POST: APIRoute = async ({ request, locals }) => {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Request body must be valid JSON.' }, 400);
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return jsonResponse({ error: 'Request body must be a JSON object.' }, 400);
  }

  const { toolId, input } = body as { toolId?: unknown; input?: unknown };
  if (typeof toolId !== 'string' || typeof input !== 'string') {
    return jsonResponse({ error: 'A tool ID and text input are required.' }, 400);
  }

  const tool = tools.find(({ id }) => id === toolId);
  if (!tool) {
    return jsonResponse({ error: 'The selected tool was not found.' }, 404);
  }
  if (tool.type !== 'ai') {
    return jsonResponse({ error: 'This tool runs locally and does not use the AI generation endpoint.' }, 400);
  }
  if (!tool.systemPrompt?.trim()) {
    console.error(`AI tool "${tool.id}" is missing its system prompt.`);
    return jsonResponse({ error: 'This AI tool is not configured correctly.' }, 500);
  }

  const trimmedInput = input.trim();
  if (!trimmedInput) {
    return jsonResponse({ error: 'Enter some text before generating.' }, 400);
  }
  if (trimmedInput.length > 10_000) {
    return jsonResponse({ error: 'Input must be 10,000 characters or fewer.' }, 413);
  }

  const runtimeKey = (locals as RuntimeEnv)?.runtime?.env?.GEMINI_API_KEY;
  const apiKey = runtimeKey || env.GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured for the AI generation endpoint.');
    return jsonResponse({ error: 'AI generation is not configured yet. Please try again later.' }, 503);
  }

  try {
    const upstream = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: tool.systemPrompt.replace('{input}', trimmedInput) }],
            },
          ],
        }),
      },
    );

    if (!upstream.ok) {
      console.error(`Gemini generation request failed with status ${upstream.status}.`);
      return jsonResponse(
        {
          error:
            upstream.status === 429
              ? 'The AI service is busy. Please wait a moment and try again.'
              : 'The AI service could not complete your request. Please try again later.',
        },
        upstream.status === 429 ? 429 : 502,
      );
    }

    const result = (await upstream.json()) as GeminiResponse;
    const text = result.candidates
      ?.flatMap((candidate) => candidate.content?.parts ?? [])
      .map((part) => part.text ?? '')
      .join('')
      .trim();

    if (!text) {
      console.error('Gemini returned a successful response without generated text.');
      return jsonResponse({ error: 'The AI service returned an empty response. Please try again.' }, 502);
    }

    return jsonResponse({ text });
  } catch (error) {
    console.error('Gemini generation request encountered a network or parsing error.', error);
    return jsonResponse({ error: 'Unable to reach the AI service. Please try again later.' }, 502);
  }
};
