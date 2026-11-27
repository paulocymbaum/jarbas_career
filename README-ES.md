# Portafolio / CV

**Tu Nombre — Portafolio & Sitio Freelance**, en una página estática rápida: tu historia,
tu prueba, tu pitch — hecha para **reclutadores** y **clientes que te contratam**.

## 🤖 Prompt para tu agente de IA (empieza aquí)

Copia el prompt de abajo y pégalo en tu agente de código (Claude Code, Cursor, Copilot, …)
con este proyecto abierto en tu IDE:

```text
Eres un agente de ingeniería de software sénior trabajando dentro de este repositorio de GitHub:
https://github.com/paulocymbaum/jarbas_career

Este proyecto es un
portafolio personal + sitio freelance: una página estática rápida con dos puertas — el CV en `/` (para
reclutadores) y la página freelance en `/freelance` (para clientes). Stack: SQLite (fuente de verdad) →
contenido tipado → sitio estático (Vite) → HTML prerenderizado deployado en Vercel.

Tu misión: ayudarme a convertir esta plantilla en MI portafolio personal.

Reglas inviolables:
1. La base de datos es la única fuente de verdad. Nunca edites a mano los archivos generados
   (src/content/site.ts, recruitment.ts, github-activity.ts, project-readmes.ts).
   Edita db/seed.sql y luego ejecuta `npm run db:reset` y `npm run build:content`.
2. Lee DESIGN.md, ARCHITECTURE.md y BACKEND.md antes de cambiar cualquier cosa.
3. Haz el onboarding por las agentic skills de este proyecto, en este orden: primero
   `harness-quality` (audita el propio harness: skills, rules y hooks), después `interview`
   (entrevista estructurada de historia profesional → plan completo de personalización de las
   páginas), después `deploy-setup` (setup de Vercel / GitHub / env). Después: `job-application`,
   `faq`, `design-taste-frontend`.
4. Hooks de prevención de drift se ejecutan automáticamente — no los contornes; si uno falla,
   corrige el problema de origen. Agent hooks registrados en `.claude/settings.json` (scripts en
   `scripts/harness/hooks/`): `post-tool-check.sh` en PostToolUse, `stop-gate-check.sh` y
   `deploy-env-check.sh` en Stop. Git hooks `pre-commit` y `pre-push` se instalan con
   `npm run prepare` → `scripts/install-git-hooks.mjs`.
5. Valida cada cambio con `npm run audit:content` y `npm run build` antes de terminar.
6. Respeta los design gates (DESIGN.md, skill `design-taste-frontend`) y las reglas de SEO/ATS
   (AGENT-SEO.md, `.claude/rules/seo.mdc`).

Empieza preguntándome qué etapa quiero, o ejecuta `harness-quality` y después la skill
`interview` si estamos empezando de cero.
```

## 📦 Coloca el proyecto en tu IDE — fork o download

Elige una opción:

| Opción | Cómo | Ideal para |
|---|---|---|
| **🍴 Fork** | [Fork en GitHub](https://github.com/paulocymbaum/jarbas_career/fork) y luego `git clone https://github.com/TU-USUARIO/jarbas_career.git` | Mantener tu propio historial en GitHub |
| **⬇️ Download** | [Descargar el ZIP por GitHub](https://github.com/paulocymbaum/jarbas_career/archive/refs/heads/main.zip) o [abrir directo en VS Code](https://vscode.dev/redirect?url=https%3A%2F%2Fgithub.com%2Fpaulocymbaum%2Fjarbas_career) y abrir la carpeta en tu IDE | Inicio rápido, sin fork |

En cualquier caso, el siguiente paso es `npm install` → ve a [Comienza aquí](#comienza-aquí).

## De qué trata este producto?

Es un **portafolio + sitio freelance** para **cualquier profesional** que quiere
una página estática, rápida, que guarde tu historia profesional, tu prueba y tu pitch.

- **Para quién:** el dueño (cualquier profesional) que quiere que reclutadores y
  clientes lean una historia consistente en un solo lugar.
- **Para qué:** cuenta la historia profesional, lista experiencias / skills / proyectos,
  prueba el trabajo (heatmap de GitHub, showcases de proyectos, servicios freelance) y hace el pitch.
- **Cómo funciona:** SQLite (fuente de verdad) → contenido tipado → sitio estático (Vite) → HTML
  renderizado y deployado en Vercel.

Está orientado a contenido: quien sea el dueño completa la historia; el sistema la renderiza.

## Dos puertas a la misma casa:

| Puerta | Ruta | Para quién |
|---|---|---|
| El CV | `/` | Reclutadores — hero, experiencias, skills, proyectos, redacción, certificaciones, educación, heatmap de GitHub, contacto |
| La página freelance | `/freelance` | Clientes que te contratan para cualquier profesional — titular con ganancia, servicios, objeciones, trabajos, proceso, FAQ, pruebas, CTAs |

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

- **CV (`/`)** — hero, perfiles profesionales (Fullstack · Software · Product) con descargas por perfil, experiencias, skills, redacción, certificaciones, educación, proyectos, heatmap de GitHub, contacto + footer.
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
- **`faq`** — responde preguntas de configuración y funcionalidad del producto a partir de los docs del propio repositorio.

Flujo sugerido: `harness-quality` → `interview` → `deploy-setup`.

## Deploy

- `vercel.json`, `.github/workflows/deploy.yml`, `VERCEL.md`, `gh:secrets`.

## Docs

- [DESIGN.md](./DESIGN.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [BACKEND.md](./BACKEND.md), [GITHUB.md](./GITHUB.md), [VERCEL.md](./VERCEL.md), [EXTERNAL.md](./EXTERNAL.md), [AGENT-SEO.md](./AGENT-SEO.md), [ANALYTICS.md](./ANALYTICS.md) (rastreo de eventos de visitantes con Umami), [DATA-EXTRACTION.md](./DATA-EXTRACTION.md) (cómo los agentes de IA extraen datos de la página).

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
