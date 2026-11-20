# Job Search Agent (monorepo)

A React + TypeScript app with **Clean Architecture** per module, npm _workspaces_, the web app in `apps/web`, and a BFF _placeholder_ in `apps/bff`.

## Layout

```
.
├── apps/
│   ├── web/                 # Vite + React (frontend)
│   │   ├── src/
│   │   │   ├── modules/     # domain, application, infrastructure, presentation, store
│   │   │   ├── shared/
│   │   │   └── core/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── .env.example.*
│   └── bff/                 # BFF — reserved (see apps/bff/README.md)
├── docs/
│   ├── SUPABASE-BACKEND-CONFIG.md
│   └── ENVIRONMENT-AND-CI-CD.md
├── scripts/                 # validate:architecture, dependencies, endpoints, security
├── ARCHITECTURE.md
└── package.json             # root: workspaces, validate:*, hooks
```

## Quick start

At the **repository root**:

```bash
npm install
npm run dev
```

The _dev_ server (port **7200**) and other _scripts_ delegate to the **job-search-web** package in `apps/web/`.

- **Production / preview (7201):** `npm run build` and `npm run preview`
- **Env copy:** from `apps/web/.env.example.dev` → `apps/web/.env` (Vite loads `.env` next to `apps/web`).

## Quality and checks

```bash
npm run validate:all
npm run lint
npm run typecheck
```

**System map** (monorepo, BFF/gateway, `apps/web` trees): [**`ARCHITECTURE.md`**](./ARCHITECTURE.md). **Coding patterns** (layers, Zustand, fetch dedupe, design system): **`.cursor/rules/frontend-*.mdc`**.

## Documentation

- **Front-end architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md) + `.cursor/rules/frontend-*.mdc`
- **Backend target (Supabase, BFF, MCP):** [docs/SUPABASE-BACKEND-CONFIG.md](./docs/SUPABASE-BACKEND-CONFIG.md)
- **Where to put credentials (local, Vercel, CI/CD):** [docs/ENVIRONMENT-AND-CI-CD.md](./docs/ENVIRONMENT-AND-CI-CD.md)
- **Local AI/investigation Markdown paths:** [`.cursor/rules/implementation-artifacts-naming.mdc`](./.cursor/rules/implementation-artifacts-naming.mdc) — `IMPLEMENTATION/<feature>/<DD-MM-YYYY>/<category>/…` (English names); see also [docs/CONVENTIONS.md](./docs/CONVENTIONS.md).
