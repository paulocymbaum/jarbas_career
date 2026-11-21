# Portafolio / CV

**Tu Nombre — AI Engineer & Full-Stack Developer**, en una página estática rápida: tu historia,
tu prueba, tu pitch — hecha para **reclutadores** y **clientes que te contratam**.

Dos puertas a la misma casa:

| Puerta | Ruta | Para quién |
|---|---|---|
| El CV | `/` | Reclutadores — hero, experiencias, skills, proyectos, redacción, certificaciones, educación, heatmap de GitHub, contacto |
| La página freelance | `/freelance` | Clientes que te contratan para AI / full-stack — titular con ganancia, servicios, objeciones, trabajos, proceso, FAQ, pruebas, CTAs |

Ambas se alimentan de una sola fuente de verdad (SQLite) y se generan en un sitio estático en el build.

## Comienza aquí

```bash
npm install
npm run db:reset      # crea la base de datos
npm run build:content # transforma la base en contenido tipado
npm run build:resumes # renderiza los PDFs ATS (requiere Chromium)
npm run build         # build de producción
npm run dev           # servidor local
```

## Qué incluye

- **CV (`/`)** — hero, perfiles profesionales (Fullstack · AI · Product) con descargas por perfil, experiencias, skills, redacción, certificaciones, educación, proyectos, heatmap de GitHub, contacto + footer.
- **Página freelance (`/freelance`)** — titular con ganancia, servicios, objeciones, trabajos, proceso, FAQ, pruebas, CTAs.

## Dónde vive tu contenido

- **Base de datos (fuente de verdad):** `db/schema.sql`, `db/migrations/`, `db/seed.sql`.
- **Generado:** `src/content/site.ts`, `recruitment.ts`, `github-activity.ts`, `project-readmes.ts`.
- **Manutenido a mano:** `src/content/freelance.ts`, `src/content/types.ts`.

Edita el seed → reset → rebuild. No edites archivos generados.

## Quality gates

- Auditoría SEO/ATS: `npm run audit:content`.
- CLI de adaptación a ofertas de trabajo: `npm run jd -- …`.
- Design gate (design-taste-frontend skill).
- Hooks de drift del harness (stop-gate, post-tool, deploy-env).

## Agentic skills — cómo tu asistente de IA te ayuda

- **`harness-quality`** — audita el propio harness.
- **`interview`** — entrevista estructurada de historia profesional → plan completo de personalización.
- **`deploy-setup`** — setup de Vercel / GitHub / env.
- **`job-application`** — oferta de trabajo → CV + carta adaptados con ATS.

Flujo sugerido: `harness-quality` → `interview` → `deploy-setup`.

## Deploy

- `vercel.json`, `.github/workflows/deploy.yml`, `VERCEL.md`, `gh:secrets`.

## Docs

- [DESIGN.md](./DESIGN.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [BACKEND.md](./BACKEND.md), [GITHUB.md](./GITHUB.md), [VERCEL.md](./VERCEL.md), [EXTERNAL.md](./EXTERNAL.md), [AGENT-SEO.md](./AGENT-SEO.md).

## Estructura del proyecto

```
db/                     schema, migrations, seed SQL
data/                   portfolio.db (generado, gitignored), github-activity.json
scripts/                db-reset, build-content, build-resumes, prerender, audit, jd, lib/, …
public/resumes/         PDFs ATS generados (gitignored)
src/content/            types.ts (manual), site.ts + recruitment.ts + github-activity.ts + project-readmes.ts (generados), freelance.ts (manual)
src/                    React app (index.html = CV principal, freelance.html = /freelance)
static-html/            mirror estático local (gitignored)
```

## Harnesses & automation

- **Git hooks** — `npm run prepare`.
- **CI** — `.github/workflows/build.yml`.
- **Deploy** — `.github/workflows/deploy.yml`.
- **Agent harnesses / skills** — `.claude/`, `.cursor/`, `.agents/` (+ `.cursor/rules/seo.mdc`).
- **RTK** — proxy CLI optimizado en tokens.

## Prompts canónicos de las agentic skills (resumen)

- Harness quality: *"Audite la calidad de los componentes de harness (skills, rules y hooks) de este sistema, usando las prácticas de prompt engineering, harness engineering y context engineering."*
- Interview: *"Realice la entrevista profesional estructurada, paso a paso, esperando la respuesta de cada etapa antes de avanzar."*
- Deploy setup: *"Guíeme en la creación de la cuenta y el proyecto Vercel, genere las variables de deploy, agregue al .env y configure la autenticación de GitHub."*
