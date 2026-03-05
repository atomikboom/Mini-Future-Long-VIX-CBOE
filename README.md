# VIX Dashboard

Dashboard React/Vite per simulazioni DCA e scenari di uscita su Mini Future Long VIX.

## Miglioramenti implementati

- Architettura: refactor da file unico a componenti + tab lazy-loaded.
- Styling: design tokens CSS (`src/styles/tokens.css`) e stile centralizzato (`src/styles/dashboard.css`).
- Accessibilita: `aria-label`, focus visibile, semantica tablist.
- Robustezza live data: hook dedicato + cache `localStorage` TTL 5 minuti.
- Config esterna: dati strumento in `src/config/instrument.json`.
- Error handling: `ErrorBoundary` con fallback UI.
- Performance: split chunk (`react`, `recharts`) + lazy tabs.
- Qualita: test unitari (`vitest`) su calcoli finanziari.
- CI: workflow GitHub Actions (`lint`, `test`, `build`).
- Deploy-ready SPA: `public/_redirects`.
- Proxy serverless opzionale per feed VIX: `functions/vix-proxy.ts` (Cloudflare Pages Functions).

## Requisiti

- Node.js >= `20.19.0`

## Script

- `npm run dev`
- `npm run lint`
- `npm run test`
- `npm run typecheck`
- `npm run build`
- `npm run preview`

## Proxy live VIX (consigliato)

Per evitare dipendenza da proxy pubblici, usa un endpoint tuo:

- Cloudflare Pages Function: `functions/vix-proxy.ts`
- Variabile frontend:

```bash
VITE_VIX_PROXY_URL=/api/vix-proxy
VITE_BNP_PROXY_URL=/api/vix-proxy
```

L'app chiamera automaticamente:
- `VITE_VIX_PROXY_URL?url=<yahoo-url>`
- `VITE_BNP_PROXY_URL?url=<bnp-product-url>`

## Deploy gratuito

### Cloudflare Pages (consigliato)

1. Push su GitHub.
2. Cloudflare Pages -> Connect to Git.
3. Build command: `npm run build`
4. Output directory: `dist`
5. (Opzionale) abilita anche Functions per usare `functions/vix-proxy.ts`.

### Alternative

- Vercel (Hobby)
- Netlify (Free)
- GitHub Pages (solo statico, nessuna function server-side)
