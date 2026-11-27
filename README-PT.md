# Portfólio / CV

**Seu Nome — Portfólio & Site Freelance**, em uma página estática rápida: sua história,
sua prova, seu pitch — feita para **recrutadores** e **clientes que te contratam**.

## 🤖 Prompt para o seu agente de IA (comece aqui)

Copie o prompt abaixo e cole no seu agente de código (Claude Code, Cursor, Copilot, …)
com este projeto aberto na sua IDE:

```text
Você é um agente de engenharia de software sênior trabalhando dentro deste repositório do GitHub:
https://github.com/paulocymbaum/jarbas_career

Este projeto é um
portfólio pessoal + site freelance: uma página estática rápida com duas portas — o CV em `/` (para
recrutadores) e a página freelance em `/freelance` (para clientes). Stack: SQLite (fonte da verdade) →
conteúdo tipado → site estático (Vite) → HTML prerenderizado deployado na Vercel.

Sua missão: me ajudar a transformar este template no MEU portfólio pessoal.

Regras invioláveis:
1. O banco é a única fonte da verdade. Nunca edite à mão os arquivos gerados
   (src/content/site.ts, recruitment.ts, github-activity.ts, project-readmes.ts).
   Edite o db/seed.sql e depois rode `npm run db:reset` e `npm run build:content`.
2. Leia DESIGN.md, ARCHITECTURE.md e BACKEND.md antes de mudar qualquer coisa.
3. Faça o onboarding pelas agentic skills deste projeto, nesta ordem: primeiro `harness-quality`
   (audita o próprio harness: skills, rules e hooks), depois `interview` (entrevista estruturada
   de história profissional → plano completo de customização das páginas), depois `deploy-setup`
   (setup de Vercel / GitHub / env). Depois: `job-application`, `faq`, `design-taste-frontend`.
4. Hooks de drift rodam automaticamente — não os contorne; se um falhar, corrija o problema de
   origem. Agent hooks registrados no `.claude/settings.json` (scripts em
   `scripts/harness/hooks/`): `post-tool-check.sh` no PostToolUse, `stop-gate-check.sh` e
   `deploy-env-check.sh` no Stop. Git hooks `pre-commit` e `pre-push` são instalados pelo
   `npm run prepare` → `scripts/install-git-hooks.mjs`.
5. Valide toda mudança com `npm run audit:content` e `npm run build` antes de terminar.
6. Respeite os design gates (DESIGN.md, skill `design-taste-frontend`) e as regras de SEO/ATS
   (AGENT-SEO.md, `.claude/rules/seo.mdc`).

Comece me perguntando qual etapa eu quero, ou rode `harness-quality` e depois a skill
`interview` se estivermos começando do zero.
```

## 📦 Coloque o projeto na sua IDE — fork ou download

Escolha uma opção:

| Opção | Como | Melhor para |
|---|---|---|
| **🍴 Fork** | [Fork no GitHub](https://github.com/paulocymbaum/jarbas_career/fork) e depois `git clone https://github.com/SEU-USUARIO/jarbas_career.git` | Manter o seu próprio histórico no GitHub |
| **⬇️ Download** | [Baixar o ZIP pelo GitHub](https://github.com/paulocymbaum/jarbas_career/archive/refs/heads/main.zip) ou [abrir direto no VS Code](https://vscode.dev/redirect?url=https%3A%2F%2Fgithub.com%2Fpaulocymbaum%2Fjarbas_career) e abrir a pasta na sua IDE | Começo rápido, sem fork |

Em qualquer caso, o próximo passo é `npm install` → veja [Comece aqui](#comece-aqui).

## O que é este produto?

É um **portfólio + site freelance** pessoal para **qualquer profissional** que quer uma página estática, rápida, que guarde sua história profissional, sua prova e seu pitch.

- **Para quem:** o dono (qualquer profissional) que quer que recrutadores e clientes
  leiam uma história consistente em um só lugar.
- **Para que faz:** conta a história profissional, lista experiências / skills / projetos,
  prova o trabalho (heatmap GitHub, showcases de projetos, serviços freelance) e faz o pitch.
- **Como funciona:** SQLite (fonte da verdade) → conteúdo tipado → site estático (Vite) → HTML
  renderizado e deployado na Vercel.

O design é orientado a conteúdo: quem for o dono preenche a história; o sistema renderiza.

Duas portas para a mesma casa:

| Porta | Caminho | Para quem |
|---|---|---|
| O CV | `/` | Recrutadores — hero, experiências, skills, projetos, escrita, certificações, educação, heatmap do GitHub, contato |
| A página freelance | `/freelance` | Clientes que te contratam para qualquer profissional — headline com ganância, serviços, objeções, trabalhos, processo, FAQ, provas, CTAs |

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

- **CV (`/`)** — hero, perfis profissionais (Fullstack · Software · Product) com downloads por perfil, experiências, skills, escrita, certificações, educação, projetos, heatmap GitHub, contato.
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
- **`faq`** — responde perguntas de configuração e funcionalidade do produto a partir dos docs do próprio repositório.

Fluxo sugerido: `harness-quality` → `interview` → `deploy-setup`.

## Deploy

- `vercel.json`, `.github/workflows/deploy.yml`, `VERCEL.md`, `gh:secrets`.

## Docs

- [DESIGN.md](./DESIGN.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [BACKEND.md](./BACKEND.md), [GITHUB.md](./GITHUB.md), [VERCEL.md](./VERCEL.md), [EXTERNAL.md](./EXTERNAL.md), [AGENT-SEO.md](./AGENT-SEO.md), [ANALYTICS.md](./ANALYTICS.md) (rastreamento de eventos dos visitantes com Umami), [DATA-EXTRACTION.md](./DATA-EXTRACTION.md) (como agentes de IA extraem dados da página).

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
