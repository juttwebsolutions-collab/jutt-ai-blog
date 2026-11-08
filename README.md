# Jutt AI

Jutt AI is a hybrid tools hub and SEO blog. The homepage contains the searchable utility catalog and recent articles, `/blog` lists the full archive, and `/blog/<slug>` serves individual articles. Tool pages are generated from the registry at `/tools/<tool-id>`. The site uses Tailwind CSS, Astro server output, and the Cloudflare adapter.

## Local development

```sh
npm install
npm run dev
```

For local AI generation, create a root `.dev.vars` file (it is git-ignored) and add your Google AI Studio key. Cloudflare injects this binding through its runtime; the API also retains a legacy runtime-local and `import.meta.env` fallback:

```dotenv
GEMINI_API_KEY=your-key
```

Never commit API keys. For Cloudflare Pages, add `GEMINI_API_KEY` as an encrypted secret in the `jutt-ai-blog` Pages project’s **Settings → Variables and Secrets**.

## Adding a tool

Append a `Tool` object to [`src/data/tools.ts`](./src/data/tools.ts) with a unique `id`, title, description, category, and `type`.

- For Gemini-powered tools, set `type: 'ai'` and provide `systemPrompt`.
- For browser-only tools, set `type: 'client'` and select a supported `clientAction`. These tools run locally without API requests. Add a new `ClientAction` and handler in the tool page to support a new kind of utility.

The homepage search and category tabs, sitemap, and `/tools/<id>` route all use this registry. The API only accepts configured AI tool IDs.

## Blog content

Add Markdown articles under `src/content/blog/`. Each post requires `title`, `description`, `pubDate`, `category`, and `author`; `tags`, `featured`, `heroImage`, and `slug` are optional. If `slug` is omitted, the Markdown filename determines the `/blog/<slug>` URL. Blog routes are generated from the collection and included in the sitemap.

AI tool usage has a client-side limit of 10 generations per device per UTC day. This is a convenience limit stored in browser local storage, not a server-enforced quota. The AdSense spaces are placeholders; connect them to your approved publisher and ad-unit IDs before serving ads.

## Build and deploy

```sh
npm run build
npm run deploy
```

The Cloudflare adapter emits the Pages Functions worker (`dist/_worker.js`) and route manifest (`dist/_routes.json`) alongside the static assets. The deploy script publishes that output to the existing `jutt-ai-blog` Cloudflare Pages project; it does not create or deploy a separate Worker.
