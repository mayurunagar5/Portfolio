# Mayur Unagar — Portfolio

Static site with a floating chatbot, answering questions about Mayur using
his resume data via NVIDIA's `meta/llama-3.1-70b-instruct` model.

## Directory structure

```
portfolio/
├── index.html                    Site markup + chatbot widget markup
├── style.css                     Site styles (hero, sections, nav, etc.)
├── script.js                     Site behavior (nav, reveals, theme toggle)
├── chatbot.css                   Floating chat widget styles
├── chatbot.js                    Chat widget frontend — calls "/api/chat" only
│
├── netlify.toml                  Build config + redirect: /api/chat → the function
├── package.json                  Root deps (openai SDK) so Netlify can build the function
│
└── netlify/
    └── functions/
        ├── chat.js               Serverless function: the only place holding NVIDIA_API_KEY
        └── resume.json           Structured resume data, injected into the model's system prompt
```

## Why it's shaped this way

- `chatbot.js` never talks to `build.nvidia.com` directly — the API key would
  be visible to anyone opening dev tools if it did.
- Netlify only runs static files plus optional serverless functions, so the
  proxy has to be a function (`netlify/functions/chat.js`), not a long-running
  Express server.
- `netlify.toml` makes `chatbot.js`'s call to `/api/chat` quietly resolve to
  `/.netlify/functions/chat` — no frontend code needs to know that.

## Deploy setup

1. Push this whole structure to your repo, including `netlify.toml`,
   `package.json`, and everything under `netlify/functions/`.
2. In Netlify → **Site settings → Environment variables**, add:
   `NVIDIA_API_KEY = your_real_key`
3. Trigger a deploy. Netlify installs `openai` from `package.json`
   automatically and deploys `chat.js` as a function.

## Test locally with the function working

```bash
npm install -g netlify-cli
netlify dev
```
This serves the site and runs the function together, so `/api/chat` behaves
exactly like it will on the live site.

## Updating what the bot knows

Edit `netlify/functions/resume.json`. It's loaded fresh on each function call
and fed straight into the model's system prompt — no other file needs to change.