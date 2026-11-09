export type ClientAction =
  | 'word-counter'
  | 'text-case-converter'
  | 'base64'
  | 'json-formatter'
  | 'unit-converter'
  | 'password-pin-generator'
  | 'slug-generator'
  | 'text-hash-generator'
  | 'lorem-ipsum-generator'
  | 'epoch-date-converter';

interface ToolBase {
  id: string;
  title: string;
  category: string;
  description: string;
  icon?: string;
  placeholder?: string;
}

export interface AiTool extends ToolBase {
  type: 'ai';
  systemPrompt?: string;
}

export interface ClientTool extends ToolBase {
  type: 'client';
  clientAction: ClientAction;
  systemPrompt?: string;
}

export type Tool = AiTool | ClientTool;

export const tools: Tool[] = [
  {
    id: 'youtube-script-generator',
    title: 'YouTube Script Generator',
    category: 'AI Generators',
    description: 'Turn a video idea into a structured, engaging YouTube script.',
    type: 'ai',
    icon: '▶',
    placeholder: 'Describe your video topic, audience, and preferred tone...',
    systemPrompt:
      'Write an engaging YouTube video script based on this brief. Include a strong opening hook, clear sections, natural spoken language, and a concise call to action. Do not invent facts. Brief: {input}',
  },
  {
    id: 'short-video-prompt-generator',
    title: 'Short Video Prompt Generator',
    category: 'AI Generators',
    description: 'Create a ready-to-use concept and prompt for a short video.',
    type: 'ai',
    icon: '✦',
    placeholder: 'Share your subject, platform, audience, and visual style...',
    systemPrompt:
      'Create one concise short-form video concept with a hook, a scene-by-scene visual prompt, suggested on-screen text, and a closing beat. Keep it suitable for a 15–30 second vertical video. Brief: {input}',
  },
  {
    id: 'viral-captions',
    title: 'Viral Captions',
    category: 'AI Generators',
    description: 'Draft scroll-stopping social captions with relevant hashtags.',
    type: 'ai',
    icon: '#',
    placeholder: 'What is your post about, and which platform is it for?',
    systemPrompt:
      'Write three distinct, natural social media captions for the following brief. Make each opening line compelling without making misleading claims. Add a small set of relevant hashtags and label each option. Brief: {input}',
  },
  {
    id: 'seo-titles-descriptions',
    title: 'SEO Titles & Descriptions',
    category: 'AI Generators',
    description: 'Generate useful search titles and meta descriptions for a page.',
    type: 'ai',
    icon: '⌕',
    placeholder: 'Describe the page, its audience, and the main search phrase...',
    systemPrompt:
      'Create five clear SEO title tag and meta description pairs for this page brief. Keep each title concise and each description useful and accurate. Do not promise rankings or add unsupported facts. Brief: {input}',
  },
  {
    id: 'urdu-content-rewriter',
    title: 'Urdu / Roman Urdu Content Rewriter',
    category: 'AI Generators',
    description: 'Rewrite text naturally in Urdu or Roman Urdu while preserving its meaning.',
    type: 'ai',
    icon: 'ا',
    placeholder: 'Paste your text and say whether you want Urdu or Roman Urdu...',
    systemPrompt:
      'Rewrite the supplied text in the requested language and script (Urdu script or Roman Urdu). Preserve its meaning and factual details, improve clarity and flow, and return only the rewritten text. Text and request: {input}',
  },
  {
    id: 'word-counter',
    title: 'Word & Character Counter',
    category: 'Converters & Text Tools',
    description: 'Count words, characters, sentences, and estimated reading time instantly.',
    type: 'client',
    clientAction: 'word-counter',
    icon: '123',
    placeholder: 'Paste or type text to analyze...',
  },
  {
    id: 'text-case-converter',
    title: 'Text Case Converter',
    category: 'Converters & Text Tools',
    description: 'Convert text to uppercase, lowercase, title case, or sentence case.',
    type: 'client',
    clientAction: 'text-case-converter',
    icon: 'Aa',
    placeholder: 'Type or paste text to convert...',
  },
  {
    id: 'text-formatter',
    title: 'Text Case & URL Slug Converter',
    category: 'Converters & Text Tools',
    description: 'Count words and characters, change text case, and create an SEO-friendly URL slug.',
    type: 'client',
    clientAction: 'text-case-converter',
    icon: 'Aa',
    placeholder: 'Type or paste text to convert...',
  },
  {
    id: 'base64-encoder-decoder',
    title: 'Base64 Encoder & Decoder',
    category: 'Converters & Text Tools',
    description: 'Encode or decode UTF-8 text to and from Base64 in your browser.',
    type: 'client',
    clientAction: 'base64',
    icon: '⇄',
    placeholder: 'Enter text to encode or Base64 to decode...',
  },
  {
    id: 'json-formatter',
    title: 'Clean JSON Prettifier & Minifier',
    category: 'Converters & Text Tools',
    description: 'Prettify, minify, and validate JSON locally in your browser.',
    type: 'client',
    clientAction: 'json-formatter',
    icon: '{ }',
    placeholder: 'Paste JSON to format...',
  },
  {
    id: 'unit-converter',
    title: 'Length & Temperature Converter',
    category: 'Converters & Text Tools',
    description: 'Convert common length and temperature units instantly.',
    type: 'client',
    clientAction: 'unit-converter',
    icon: '↔',
  },
  {
    id: 'password-pin-generator',
    title: 'Password & PIN Generator',
    category: 'Converters & Text Tools',
    description: 'Generate a random password or numeric PIN with options you control.',
    type: 'client',
    clientAction: 'password-pin-generator',
    icon: '🔐',
  },
  {
    id: 'password-generator',
    title: 'Secure Password & API Key Generator',
    category: 'Converters & Text Tools',
    description: 'Generate cryptographically strong passwords locally with customizable length and character sets.',
    type: 'client',
    clientAction: 'password-pin-generator',
    icon: '🔐',
  },
  {
    id: 'slug-generator',
    title: 'Slug & URL Friendly Text Generator',
    category: 'Converters & Text Tools',
    description: 'Turn titles and phrases into clean, URL-friendly slugs.',
    type: 'client',
    clientAction: 'slug-generator',
    icon: '🔗',
    placeholder: 'Enter a title or phrase to turn into a URL slug...',
  },
  {
    id: 'text-hash-generator',
    title: 'MD5 / Text Hash Generator',
    category: 'Converters & Text Tools',
    description: 'Generate MD5, SHA-1, or SHA-256 text digests in your browser.',
    type: 'client',
    clientAction: 'text-hash-generator',
    icon: '#',
    placeholder: 'Enter text to hash...',
  },
  {
    id: 'lorem-ipsum-generator',
    title: 'Lorem Ipsum Dummy Text Generator',
    category: 'Converters & Text Tools',
    description: 'Generate placeholder words, sentences, or paragraphs for mockups.',
    type: 'client',
    clientAction: 'lorem-ipsum-generator',
    icon: '¶',
  },
  {
    id: 'epoch-date-converter',
    title: 'Epoch Timestamp & Date Converter',
    category: 'Converters & Text Tools',
    description: 'Convert dates and Unix timestamps in seconds or milliseconds.',
    type: 'client',
    clientAction: 'epoch-date-converter',
    icon: '◷',
  },
];
