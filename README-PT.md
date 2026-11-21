# Portfólio / CV

**Seu Nome — AI Engineer & Full-Stack Developer**, em uma página estática rápida: sua história,
sua prova, seu pitch — feita para **recrutadores** e **clientes que te contratam**.

Duas portas para a mesma casa:

| Porta | Caminho | Para quem |
|---|---|---|
| O CV | `/` | Recrutadores — hero, experiências, skills, projetos, escrita, certificações, educação, heatmap do GitHub, contato |
| A página freelance | `/freelance` | Clientes que te contratam para AI / full-stack — headline com ganância, serviços, objeções, trabalhos, processo, FAQ, provas, CTAs |

Ambas são alimentadas por uma única fonte de verdade (SQLite) e renderizadas em uma site estático
no build.

## Comece aqui

```bash
npm install
npm run db:reset      # cria o banco
npm run build:content # transforma o banco em conteúdo tipado
npm run build:resumes # renderiza os PDFs ATS (precisa Chromium)
npm run build         # build de produção
npm run dev           # servidor local
```

## O que tem aqui

- **CV (`/`)** — hero, perfis profissionais (Fullstack · AI · Product) com downloads por perfil, experiências, skills, escrita, certificações, educação, projetos, heatmap GitHub, contato.
- **Página freelance (`/freelance`)** — headline com ganância, serviços, objeções, trabalhos, processo, FAQ, provas, CTAs.

## Onde seu conteúdo mora

- **Banco (fonte da verdade):** `db/schema.sql`, `db/migrations/`, `db/seed.sql`.
- **Gerado:** `src/content/site.ts`, `recruitment.ts`, `github-activity.ts`, `project-readmes.ts`.
- **Manutenido à mão:** `src/content/freelance.ts`, `src/content/types.ts`.

Edite o seed → reset → rebuild. Não edite arquivos gerados.

## Quality gates

- Auditoria SEO/ATS: `npm run audit:content`.
- CLI de adaptação para vagas: `npm run jd -- …`.
- Design gate (design-taste-frontend skill).
- Hooks de drift do harness (stop-gate, post-tool, deploy-env).

## Agentic skills — como seu assistente de IA te ajuda

- **`harness-quality`** — audita o próprio harness.
- **`interview`** — entrevista estruturada de história profissional → plano completo de customização.
- **`deploy-setup`** — setup de Vercel / GitHub / env.
- **`job-application`** — vagas → CV + carta adaptados com ATS.

Fluxo sugerido: `harness-quality` → `interview` → `deploy-setup`.

## Deploy

- `vercel.json`, `.github/workflows/deploy.yml`, `VERCEL.md`, `gh:secrets`.

## Docs

- [DESIGN.md](./DESIGN.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [BACKEND.md](./BACKEND.md), [GITHUB.md](./GITHUB.md), [VERCEL.md](./VERCEL.md), [EXTERNAL.md](./EXTERNAL.md), [AGENT-SEO.md](./AGENT-SEO.md).

## Estrutura do projeto

```
db/                     schema, migrations, seed SQL
data/                   portfolio.db (gerado, gitignored), github-activity.json
scripts/                db-reset, build-content, build-resumes, prerender, audit, jd, lib/, …
public/resumes/         PDFs ATS gerados (gitignored)
src/content/            types.ts (manual), site.ts + recruitment.ts + github-activity.ts + project-readmes.ts (gerados), freelance.ts (manual)
src/                    React app (index.html = CV principal, freelance.html = /freelance)
static-html/            mirror estático local (gitignored)
```

## Harnesses & automation

- **Git hooks** — `npm run prepare`.
- **CI** — `.github/workflows/build.yml`.
- **Deploy** — `.github/workflows/deploy.yml`.
- **Agent harnesses / skills** — `.claude/`, `.cursor/`, `.agents/` (+ `.cursor/rules/seo.mdc`).
- **RTK** — proxy CLI otimizado em tokens.

## Prompts canônicos das agentic skills (resumo)

- Harness quality: *"Audite a qualidade dos componentes de harness (skills, rules e hooks) deste sistema, usando as práticas de prompt engineering, harness engineering e context engineering."*
- Interview: *"Rode a entrevista profissional estruturada, passo a passo, aguardando a resposta de cada etapa antes de avançar."*
- Deploy setup: *"Me guie na criação da conta e projeto Vercel, gere as variáveis de deploy, adicione ao .env e configure o GitHub auth."*
