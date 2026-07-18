# MyImmersiveExperience

An accessible, room-based portfolio for Nicolò Pedrani. Four original 16-bit Canvas dioramas present reviewed work,
research, publications and interests. The adjacent HTML station navigator exposes every interaction without requiring
spatial Canvas navigation.

The conversational avatar combines deterministic retrieval with optional, grounded generation from Qwen3 0.6B. On a
compatible WebGPU device Qwen generates the answer from reviewed context; curated answers remain the resilient fallback.
No backend or remote inference API is used.

Live site: <https://nicolopedrani.github.io/MyImmersiveExperience/>

## Run locally

Requirements: Node.js 22.12 or newer and npm.

```bash
npm ci
npm run dev
```

Vite serves the project at <http://localhost:5173/MyImmersiveExperience/>. `npm ci` currently reports the documented
`boolean@3.2.0` deprecation inherited from the Node branch of Transformers.js; it is not bundled into the browser app.

## Quality commands

```bash
npm run typecheck
npm run lint
npm run test
npm run test:coverage
npm run test:e2e
npm run benchmark:qwen
npm run build
npm run verify:dist
npm run check
```

Install Playwright browsers once before the end-to-end suite:

```bash
npx playwright install chromium firefox webkit
```

The Qwen benchmark requires a running local dev server, Google Chrome with compatible WebGPU hardware, and the explicit
579 MB download. It stores the browser cache under `/tmp`, outside the repository.

## Architecture at a glance

- `src/content/portfolio.ts` is the single typed source for public facts, evidence, links and chat aliases.
- `src/game/` contains data-driven dioramas, shared prop/collision geometry and the Canvas renderer.
- `src/chat/retrieval.ts` selects grounding context and a safe fallback.
- `src/chat/model.worker.ts` loads Qwen only after consent and generates from structured context and recent history.
- `src/main.ts` connects deep links, room station controls, the guided tour, input and Canvas.

The private `references/` directory is ignored and never imported. Only the intentionally published CV is copied to
`public/CV_Pedrani.pdf`; papers and MAIR use canonical public links.

## Documentation

- [Architecture](docs/architecture.md)
- [Content and source policy](docs/content-and-sources.md)
- [Chat and browser support](docs/chat-and-browser-support.md)
- [Content audit](docs/content-audit.md)
- [Main-site synchronisation checklist](docs/main-site-sync.md)
- [Third-party notices](THIRD_PARTY_NOTICES.md)

## Deployment

GitHub Actions installs from the lockfile, runs static checks, unit tests, the production build and the Playwright
browser matrix before deploying `dist/` to GitHub Pages. Optional Qwen assets are never part of the initial request.

## License

Application source is available under the [MIT License](LICENSE). The CV, personal content and name remain copyright
Nicolò Pedrani. Model and dependency licenses are listed separately.
