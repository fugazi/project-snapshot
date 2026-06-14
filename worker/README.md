# Project Snapshot AI Worker

Cloudflare Worker que actúa como proxy entre la extensión de Ableton y Workers AI.

## Setup

```bash
cd worker
npm install

# Configurar secrets
wrangler secret put CF_ACCOUNT_ID
wrangler secret put CF_API_TOKEN

# Deploy
npm run deploy
```

## Endpoint

```
POST https://project-snapshot-ai.<your-subdomain>.workers.dev/suggestions
```

Body: JSON con los datos del proyecto de Ableton.
Response: `{ "suggestions": [{ "icon": "🎵", "title": "...", "description": "..." }] }`

## Modelo

Usa `@cf/meta/llama-3.3-70b-instruct-fp8-fast` de Cloudflare Workers AI.
Free tier: 10,000 Neurons/día.
