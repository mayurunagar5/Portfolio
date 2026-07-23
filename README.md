# Chatbot proxy — setup

The static site (`index.html`, `style.css`, `script.js`, `chatbot.css`, `chatbot.js`)
lives in the project root. This `server/` folder is a small Express app that:

1. Serves those static files
2. Exposes `POST /api/chat`, which the widget calls
3. Holds your NVIDIA API key and forwards requests to `build.nvidia.com`

The key never reaches the browser — this is required, not optional, since
anything shipped to `chatbot.js` is visible to every visitor.

## Run it locally

```bash
cd server
npm install
cp .env.example .env
# edit .env and paste your real NVIDIA_API_KEY
npm start
```

Then open http://localhost:3001 — you'll see the full portfolio with the
floating chat button working in the bottom-right corner.

## Updating what the bot knows

Edit `server/data/resume.json`. It's loaded fresh each time the server starts
and injected into the model's system prompt, so the bot's answers always match
whatever is in that file — no need to touch `server.js`.

## Deploying

Any Node host (Render, Railway, Fly.io, a VPS, etc.) works — just set the
`NVIDIA_API_KEY` environment variable there instead of using a `.env` file,
and run `npm start`. Point your domain at that host; there's no separate
frontend deploy needed since Express serves the static files too.