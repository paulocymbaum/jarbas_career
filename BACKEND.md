# Portfolio / CV — Backend (camada de dados SQLite)

Documento de implementação da camada de backend do portfolio. Não há servidor HTTP em produção: o “backend” é o **pipeline de dados** que mantém o SQLite, gera o módulo tipado consumido pelo React e alimenta o build estático.

Para o modelo relacional, diagramas e definição das tabelas, consulte [ARCHITECTURE.md](./ARCHITECTURE.md). Para requisitos de UI e conteúdo, consulte [DESIGN.md](./DESIGN.md).

---

## 1. Papel da camada

| Responsabilidade | Onde vive | Quando roda |
|------------------|-----------|-------------|
| Persistência do conteúdo | `data/portfolio.db` | Edição local / CI |
| Schema e evolução | `db/schema.sql`, `db/migrations/` | `db:reset`, CI |
| Seed e dados iniciais | `db/seed.sql` | Primeiro setup, testes |
| Leitura e transformação | `scripts/build-content.ts` | Antes de `vite build` |
| Contrato tipado para o frontend | `src/content/site.ts` | Importado pelos componentes |

### O que **não** é backend neste projeto (v1)

- API REST ou GraphQL em runtime
- Conexão com banco no deploy (Netlify, Vercel, GitHub Pages, etc.)
- Autenticação, painel admin ou multi-tenant
- ORM pesado — SQL explícito + mapeadores finos

O site publicado em `dist/` é **100% estático**, como descrito em ARCHITECTURE.md §2.

---

## 2. Fluxo de dados

```
┌─────────────────────────────────────────────────────────────────┐
│                        DESENVOLVIMENTO                          │
├─────────────────────────────────────────────────────────────────┤
│  Editar conteúdo                                                │
│    · db/seed.sql                                                │
│    · GUI (DB Browser, TablePlus, DBeaver)                       │
│    · CLI opcional (portfolio add-experience …)                  │
│                          │                                      │
│                          ▼                                      │
│              data/portfolio.db  (gitignored)                    │
│                          │                                      │
│              npm run build:content                              │
│                          │                                      │
│                          ▼                                      │
│              src/content/site.ts  (gerado ou sobrescrito)       │
│                          │                                      │
│              npm run dev  /  npm run build                      │
│                          │                                      │
│                          ▼                                      │
│                    dist/  (HTML + JS estático)                  │
└─────────────────────────────────────────────────────────────────┘
```

Em **CI**, o banco é recriado a partir de `schema.sql` + `seed.sql`; o artefato deployado nunca inclui `portfolio.db`.

---

## 3. Stack e dependências

| Peça | Escolha | Motivo |
|------|---------|--------|
| Banco | SQLite 3.38+ | Arquivo único, zero servidor, `json_group_array` nativo |
| Driver Node | `better-sqlite3` | Síncrono, rápido, adequado a script de build |
| Runtime do script | `tsx` | Executar TypeScript sem compilar manualmente |
| Validação (opcional) | `zod` | Validar payload antes de gravar `site.ts` |
| CLI SQLite (sistema) | `sqlite3` CLI | Reset manual, debug, migrações ad hoc |

### Dependências sugeridas (`package.json`)

```json
{
  "devDependencies": {
    "better-sqlite3": "^11.x",
    "@types/better-sqlite3": "^7.x",
    "tsx": "^4.x",
    "zod": "^3.x"
  }
}
```

`better-sqlite3` exige toolchain nativa (Python + build tools) no ambiente de desenvolvimento e no CI.

---

## 4. Layout de diretórios

```
portfolio-cv/
├── BACKEND.md                 ← este documento
├── ARCHITECTURE.md            ← schema e queries de referência
├── data/
│   └── portfolio.db           ← gerado; não versionar
├── db/
│   ├── schema.sql             ← estado atual consolidado (CREATE TABLE)
│   ├── migrations/
│   │   ├── 001_initial.sql
│   │   ├── 002_profile_cv.sql
│   │   ├── 003_articles.sql
│   │   ├── 004_site_profile_location.sql
│   │   ├── 005_archived.sql
│   │   ├── 006_profile_cv_projects.sql
│   │   └── 007_site_profile_website.sql
│   └── seed.sql               ← conteúdo inicial versionado
└── scripts/
    ├── build-content.ts       ← DB → src/content/site.ts
    ├── db-reset.ts            ← recria portfolio.db
    ├── lib/
    │   ├── db.ts              ← abre conexão, caminho do arquivo
    │   ├── queries.ts         ← SQL parametrizado
    │   ├── mappers.ts         ← linhas SQL → tipos SiteContent
    │   └── validate.ts        ← schema Zod (opcional)
    └── jd/                    ← job-application tailoring CLI (scripts/jd/)
        └── cli.ts
```

**Estado atual:** o pipeline SQLite está implementado e em produção de conteúdo local: o frontend consome os módulos gerados por `scripts/build-content.ts` (`src/content/site.ts`, `src/content/recruitment.ts`, `src/content/github-activity.ts`, `src/content/project-readmes.ts`). A pasta `db/` e a maioria dos scripts descritos abaixo já existem — este documento reflete o estado atual.

---

## 5. Ciclo de vida do banco

### 5.1 Criar / resetar (`db:reset`)

Ordem de execução:

1. Remover `data/portfolio.db` se existir
2. Criar diretório `data/` se necessário
3. Aplicar `db/schema.sql`
4. Aplicar todas as migrações em `db/migrations/` (ordenadas por nome)
5. Aplicar `db/seed.sql`
6. (Opcional) Rodar `PRAGMA integrity_check`

```bash
# Implementação alvo
npm run db:reset
```

Equivalente manual:

```bash
rm -f data/portfolio.db
mkdir -p data
sqlite3 data/portfolio.db < db/schema.sql
for f in db/migrations/*.sql; do sqlite3 data/portfolio.db < "$f"; done
sqlite3 data/portfolio.db < db/seed.sql
```

### 5.2 Migrações

- Cada arquivo: `NNN_descricao.sql` (prefixo numérico de três dígitos).
- Migrações são **idempotentes quando possível** (`IF NOT EXISTS`, checagens).
- `schema.sql` reflete sempre o **estado final** após todas as migrações (útil para novos clones).
- Nunca editar migrações já aplicadas em produção de conteúdo; adicionar nova migração.

Tabela de controle (recomendada a partir da migração `002`):

```sql
CREATE TABLE IF NOT EXISTS schema_migration (
  version     TEXT PRIMARY KEY,
  applied_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

O script `db-reset.ts` registra cada migração aplicada; em ambientes que preservam o `.db`, um runner separado aplica apenas pendentes.

### 5.3 Seed

- `db/seed.sql` contém `INSERT` representativos — um registro mínimo por seção para smoke test.
- Conteúdo “real” do portfolio pode migrar do `site.ts` atual para o seed em um único PR.
- Datas no formato `YYYY-MM`; `end_date` / `expiry_date` `NULL` = “Present” / sem expiração.

### 5.4 Git

```gitignore
# .gitignore
data/portfolio.db
data/*.db-journal
data/*.db-wal
data/*.db-shm
```

Versionar: `db/schema.sql`, `db/migrations/*`, `db/seed.sql`, `scripts/*`.

---

## 6. Scripts npm

| Script | Comando | Descrição |
|--------|---------|-----------|
| `db:reset` | `tsx scripts/db-reset.ts` | Recria banco (schema + migrações + seed) |
| `db:dump-seed` | `tsx scripts/dump-db-seed.ts` | Exporta o banco atual → `db/seed.sql` |
| `db:sync-seed` | `npm run db:dump-seed && npm run build:content` | Banco → `db/seed.sql` → módulos de conteúdo gerados |
| `build:content` | `tsx scripts/build-content.ts` | Lê DB e gera os módulos de conteúdo (`src/content/site.ts`, `recruitment.ts`, `github-activity.ts`, `project-readmes.ts`) |
| `generate:resume-variants` | `node scripts/generate-resume-variants.mjs` | Regenera variantes ATS em `db/seed.sql` |
| `build:resumes` | `tsx scripts/build-resumes.ts` | HTML → PDF (Playwright) em `public/resumes/` |
| `build` | `npm run build:content && npm run build:resumes && tsc -b && vite build && npm run prerender` | Pipeline completo (content → PDFs → TS check → Vite → prerender) |
| `prerender` | `tsx scripts/prerender.ts` | Renderiza `dist/index.html` + `dist/freelance.html` com DOM completo (crawlers de IA / no-JS) |
| `dev` | `vite` | Dev server; usa os módulos gerados existentes (rodar `build:content` após editar o DB) |
| `preview` | `vite preview` | Preview do build estático em `dist/` |

Exemplo de `package.json`:

```json
{
  "scripts": {
    "db:reset": "tsx scripts/db-reset.ts",
    "db:dump-seed": "tsx scripts/dump-db-seed.ts",
    "build:content": "tsx scripts/build-content.ts",
    "generate:resume-variants": "node scripts/generate-resume-variants.mjs",
    "build:resumes": "tsx scripts/build-resumes.ts",
    "build": "npm run build:content && npm run build:resumes && tsc -b && vite build && npm run prerender",
    "dev": "vite",
    "preview": "vite preview",
    "lint": "eslint ."
  }
}
```

---

## 7. Build script (`scripts/build-content.ts`)

### 7.1 Responsabilidades

1. Abrir `data/portfolio.db` (falhar com mensagem clara se ausente → sugerir `npm run db:reset`)
2. Executar queries (ver ARCHITECTURE.md §6)
3. Mapear linhas para o tipo `SiteContent` de `src/content/site.ts`
4. Validar payload (Zod ou asserts)
5. Escrever arquivo TypeScript com:
   - Tipos exportados (ou import de `src/content/types.ts` se extraídos)
   - `export const siteContent: SiteContent = { … }`
   - `export const navItems = [ … ]` (pode permanecer estático no gerador)

### 7.2 Abertura da conexão (`scripts/lib/db.ts`)

```typescript
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const dbPath = path.join(root, "data", "portfolio.db");

export function openDatabase(): Database.Database {
  try {
    return new Database(dbPath, { readonly: true, fileMustExist: true });
  } catch {
    throw new Error(
      `Banco não encontrado em ${dbPath}. Execute: npm run db:reset`
    );
  }
}
```

Modo `readonly` evita locks acidentais durante o build.

### 7.3 Estratégia de queries

**Opção A — JSON no SQL** (recomendada, SQLite 3.38+):

Subconsultas com `json_group_array` / `json_object` (exemplos em ARCHITECTURE.md §6). O script faz `JSON.parse` uma vez por linha.

**Opção B — Queries separadas**:

Uma query por entidade pai e uma por filhos; join em memória no `mappers.ts`. Mais verboso, porém mais fácil de depurar.

Para `professional_profile_chip`, agrupar por `kind IN ('stack', 'skill')` no mapper.

### 7.4 Mapeamento SQL → TypeScript

| Tabela / coluna (SQL) | Campo TS (`SiteContent`) | Transformação |
|-----------------------|--------------------------|---------------|
| `site_profile.name` | `name` | direto |
| `site_profile.title` | `title` | direto |
| `site_profile.pitch` | `pitch` | direto |
| `site_profile.about_paragraphs` | `aboutParagraphs` | `JSON.parse` → `string[]` |
| `site_profile.email` | `email` | direto |
| `site_profile.github_url` | `links.github` | omitir se `NULL` |
| `site_profile.linkedin_url` | `links.linkedin` | omitir se `NULL` |
| `site_profile.footer_note` | `footerNote` | opcional |
| `professional_profile.*` | `professionalProfiles[]` | ver chips abaixo |
| `professional_profile_chip` (`kind=stack`) | `stack: string[]` | ordenar por `sort_order` |
| `professional_profile_chip` (`kind=skill`) | `skills: string[]` | ordenar por `sort_order` |
| `professional_profile.accent` | `accent` | direto |
| `professional_profile.resume_url` | `resumeUrl` | direto |
| `experience.start_date` | `start` | direto (`YYYY-MM`) |
| `experience.end_date` | `end` | `null` se ausente |
| `experience_highlight.body` | `highlights[]` | ordenar por `sort_order` |
| `experience_tech.label` | `tech[]` | ordenar por `sort_order` |
| `project.featured` | `featured` | `Boolean(row.featured)` |
| `project_link` | `links[]` | `{ kind, url, label? }` |
| `project_tech.label` | `tech[]` | ordenar |
| `project` (sem coluna no schema) | `gradient` | **ver §7.5** |
| `education.start_date` | `start` | direto; aceitar `YYYY` no UI |
| `education.end_date` | `end` | opcional / `null` |
| `certification.issued_date` | `issuedDate` | camelCase no TS |
| `certification.expiry_date` | `expiryDate` | camelCase |
| `certification.verify_url` | `verifyUrl` | camelCase |
| `skill_category` + `skill_item` | `skills[]` | `{ name, items }` |

Convenção de nomes: **snake_case no SQLite**, **camelCase no TypeScript** gerado.

Formatação de datas para exibição (`Jan 2022 – Present`) permanece no frontend em `src/lib/format.ts` — o backend entrega apenas strings ISO.

### 7.5 Lacuna de schema: `project.gradient`

O `site.ts` atual inclui `gradient` nos projetos e `db/schema.sql` já o define na tabela `project` (coluna `gradient TEXT NOT NULL`). Não há lacuna aberta: a coluna existe no schema consolidado, e a discussão de migração da fase anterior está superada.

### 7.6 Saída gerada

Cabeçalho fixo no arquivo gerado:

```typescript
// AUTO-GENERATED by scripts/build-content.ts — do not edit by hand.
// Source: data/portfolio.db
// Regenerate: npm run build:content

import type { SiteContent } from "./types"; // se tipos forem extraídos

export const siteContent: SiteContent = { /* … */ };
```

Separar tipos em `src/content/types.ts` evita que o gerador sobrescreva definições manuais.

---

## 8. Validação

Antes de escrever o arquivo, validar o objeto montado:

| Regra | Onde validar |
|-------|----------------|
| Exatamente 1 linha em `site_profile` (`id = 1`) | Query + assert |
| `about_paragraphs` é JSON array de strings | `JSON.parse` + Zod |
| `slug` únicos em `professional_profile` e `project` | Constraint DB + Zod |
| URLs não vazias em `project_link` | Zod `.url()` ou regex leve |
| `kind` em enums conhecidos | CHECK no DB + Zod |
| Pelo menos um perfil profissional com `resume_url` | Zod `.min(1)` |

Falha de validação → exit code `1` e mensagem no stderr; o build não deve prosseguir com conteúdo inconsistente.

---

## 9. Integração com CI

Dois workflows existem em `.github/workflows/`:

- **`build.yml`** — triggers: `pull_request` para `main`/`master` + `workflow_dispatch`. Passos: checkout → setup-node (22) → `npm ci` → Playwright Chromium → `db:reset` → `build` → upload artifact `dist`.
- **`deploy.yml`** — triggers: push to `main`/`master`, daily cron (`0 7 * * *` UTC = 04:00 Your City), `workflow_dispatch`. Passos: sync GitHub activity → commit snapshot (se houver diff) → `db:reset` → `build:content` → `build:resumes` → build site (`tsc -b && vite build`) → `prerender` → package `dist/` → `vercel deploy --prebuilt --prod`.

O CI **não** persiste `portfolio.db`; recria a cada run a partir de arquivos versionados.

---

## 10. Edição de conteúdo

| Método | Fluxo | Versionado no Git |
|--------|-------|-------------------|
| Editar `db/seed.sql` | `db:reset` → `build:content` | Sim |
| GUI no `portfolio.db` | Salvar → `build:content` | Não (exportar SQL se quiser versionar) |
| CLI fina | Comando → INSERT → `build:content` | Depende (pode gerar SQL) |

### Fluxo recomendado para o autor

1. `npm run db:reset` (primeira vez)
2. Editar conteúdo via GUI ou SQL
3. `npm run build:content`
4. `npm run dev` — conferir UI
5. Se mudanças devem ser compartilhadas: exportar para `seed.sql` ou commitar migração/dados

### Exportar DB → seed (opcional)

```bash
sqlite3 data/portfolio.db .dump > db/seed-dump.sql
```

Revisar o dump manualmente — remover metadados SQLite e dados de teste antes de commitar.

---

## 11. CLI (job application)

A CLI de job applications vive em `scripts/jd/cli.ts` e é exposta como `npm run jd -- <command>`:

```bash
npm run jd -- extract "<url-or-file>"    # scaffold application folder + jd.md/jd.json
npm run jd -- match "<dir>"              # rank profiles → match-report.md
npm run jd -- gate "<dir>"               # build gate.json + gate.md
npm run jd -- qualitative "<dir>"       # scaffold qualitative.json (agent-graded rubric)
npm run jd -- score "<dir>"              # score cv.md + qualitative.json → gate-report.md (exit 1 on FAIL)
npm run jd -- pdf "<dir>"                # re-render approved CV PDF (gate must be PASS)
npm run jd -- html "<dir>" [file.md]    # render markdown doc → styled static HTML
npm run jd -- deliver "<dir>"           # copy PASSing CV + PDF + cover letter to delivery folders
```

Também existe `scripts/dev/cv-report.ts` (relatório de CV para dev). Não há mais CLI genérica de conteúdo (`scripts/cli/portfolio.ts` prevista na fase alvo não foi implementada). Implementação: `better-sqlite3` em modo leitura/escrita + templates de `INSERT` parametrizados.

---

## 12. Tratamento de erros

| Situação | Comportamento |
|----------|---------------|
| `portfolio.db` ausente | Erro com instrução `npm run db:reset` |
| `site_profile` vazio | Exit 1 — conteúdo mínimo obrigatório |
| JSON inválido em `about_paragraphs` | Exit 1 — indicar linha/tabela |
| Violação de FK no seed | Falha no `db:reset` com stderr do SQLite |
| DB locked (GUI aberta) | Mensagem: fechar editor externo |

Logs: usar `console.error` para falhas; `console.info` apenas com flag `--verbose`.

---

## 13. Segurança

- O banco **não** vai para produção — superfície de ataque mínima.
- Não armazenar segredos no SQLite (tokens, senhas).
- URLs em `project_link` e `verify_url` são públicas no site estático.
- Scripts de build rodam apenas em ambiente de desenvolvimento/CI confiável.

---

## 14. Relação entre documentos

```
DESIGN.md          → o quê mostrar (UI, seções, campos visíveis)
ARCHITECTURE.md    → como modelar (tabelas, índices, queries SQL)
BACKEND.md         → como implementar (scripts, npm, mapeamento, CI)
src/content/site.ts → contrato consumido pelo React
```

---

## 15. Checklist de implementação

- [x] Criar `db/schema.sql` (copiar de ARCHITECTURE.md §4)
- [x] Criar `db/migrations/001_initial.sql`
- [x] Adicionar coluna `gradient` em `project` (incluída no schema inicial; §7.5)
- [x] Criar `db/seed.sql` a partir do conteúdo atual de `site.ts`
- [x] Implementar `scripts/lib/{db,queries,mappers,validate}.ts`
- [x] Implementar `scripts/db-reset.ts`
- [x] Implementar `scripts/build-content.ts`
- [x] Extrair tipos para `src/content/types.ts`
- [x] Adicionar dependências (`better-sqlite3`, `tsx`, `zod`)
- [x] Atualizar scripts npm (`db:reset`, `build:content`, `build`)
- [x] Gitignore `data/portfolio.db`
- [x] Workflow CI: `db:reset` + `build`
- [x] Documentar no README: fluxo de edição de conteúdo

---

## 16. Referência rápida de comandos

```bash
# Setup inicial
npm install
npm run db:reset
npm run build:content
npm run dev

# Após editar o banco
npm run build:content

# Build de produção
npm run build

# Inspecionar dados
sqlite3 data/portfolio.db "SELECT * FROM site_profile;"
sqlite3 data/portfolio.db "SELECT title, slug FROM project ORDER BY featured DESC;"
```

---

## 17. Pipeline de CV ATS (PDF)

Cada perfil profissional (`ai-engineer`, `fullstack-engineer`, `product-engineer`) possui um documento CV dedicado nas tabelas:

- `professional_profile_cv` — headline, summary, keywords, metadados do PDF
- `professional_profile_experience` — seleção e overrides por perfil
- `professional_profile_experience_highlight` — bullets ATS por perfil
- `professional_profile_cv_skill` — grupos de skills para o PDF

### Fluxo

```
scripts/resumes/profile-scopes.mjs   ← conteúdo ATS por perfil (editar aqui)
        ↓
scripts/generate-cv-seed.mjs       ← inclui buildCvSeedSql() no seed
        ↓
npm run db:reset
        ↓
scripts/build-resumes.ts           ← ProfileCvDocument → HTML → Playwright PDF
        ↓
public/resumes/{slug}.pdf          ← gitignored; copiado para dist/ no vite build
```

### Comandos

```bash
npm run generate:resume-variants   # regenera db/seed.sql com variantes ATS
npm run db:reset
npm run build:resumes              # falha se PDF > 2 páginas
npm run build
```

CI instala Chromium (`npx playwright install chromium`) antes do build.

---

*Versão do documento: 1.1 — inclui pipeline ATS de PDF por perfil.*
