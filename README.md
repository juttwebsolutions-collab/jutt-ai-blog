# Jutt AI Tools

Jutt AI Tools is a dedicated online utilities hub with tool pages generated from the registry at `/tools/<tool-id>`. It uses Tailwind CSS, Astro server output, and the Cloudflare adapter.

## Local development

```sh
npm install
npm run dev
```

For local AI generation, create a root `.dev.vars` file (it is git-ignored) and add your Google AI Studio key. Cloudflare injects this binding through its runtime; the API also retains a legacy runtime-local and `import.meta.env` fallback:

```dotenv
GEMINI_API_KEY=your-key
```

Never commit API keys. For Cloudflare Pages, add `GEMINI_API_KEY` as an encrypted secret in the Pages project’s **Settings → Variables and Secrets**, then deploy.

## Adding a tool

Append a `Tool` object to [`src/data/tools.ts`](./src/data/tools.ts) with a unique `id`, title, description, category, and `type`.

- For Gemini-powered tools, set `type: 'ai'` and provide `systemPrompt`.
- For browser-only tools, set `type: 'client'` and select a supported `clientAction`. These tools run locally without API requests. Add a new `ClientAction` and handler in the tool page to support a new kind of utility.

The homepage search and category tabs, sitemap, and `/tools/<id>` route all use this registry. The API only accepts configured AI tool IDs.

AI tool usage has a client-side limit of 10 generations per device per UTC day. This is a convenience limit stored in browser local storage, not a server-enforced quota. The AdSense spaces are placeholders; connect them to your approved publisher and ad-unit IDs before serving ads.

## Build and deploy

```sh
npm run build
npm run deploy
```

Configure Cloudflare Pages to use the project’s supported Astro build output and retain the Cloudflare adapter-generated worker files when deploying.
