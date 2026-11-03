# Portfolio — React + TypeScript

Complete Vite + React + TypeScript source code for a personal portfolio.

## Run locally

```bash
npm install
npm run dev
```

## Deploy on Vercel

1. Upload this folder to GitHub.
2. Create a free Vercel account and import the repository.
3. Vercel detects Vite automatically. Click **Deploy**.

The portfolio now includes a location- and weather-aware lunch recipe agent. The frontend reads its 42-recipe library from `public/recipes.json` and works without a model key. Its optional Vercel serverless function at `api/suggest.js` can generate a short AI explanation using the OpenAI Responses API.

To enable hosted AI, add `OPENAI_API_KEY` as a **server-only** Vercel environment variable and set `VITE_HOSTED_AI=true` for the desired deployment environments, then redeploy. Optionally set `OPENAI_MODEL` to a model available to your API account. Never add the API key with a `VITE_` prefix or commit it to source. Without these settings, the site still ranks and presents recipes from the library without AI-generated prose.

The API function has a small per-runtime rate limit; it is not a global quota. Keep the AI setting off until you are ready to monitor API usage. Weather lookup uses Open-Meteo in the browser.
