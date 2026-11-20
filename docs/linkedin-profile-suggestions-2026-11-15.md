# LinkedIn profile suggestions — 2026-11-15

**Prepared by:** `linkedin-refresh` skill (`.cursor/skills/linkedin-refresh/SKILL.md`)
**Profile:** linkedin.com/in/your-username · **Snapshot:** `db/linkedin-profile.txt` (export committed 2026-07-27)
**Ground truth:** `db/seed.sql` @ `52c1aa6` (2026-11-15) · **Writing rules:** `.cursor/skills/no-ai-slop`
**Portuguese (BR) mirror:** `docs/linkedin-profile-sugestoes-2026-11-15.md` (localized copy blocks; decisions are logged here first and mirrored there)
**Assumption:** the profile leads **AI Engineer** (your current YourClient title). An alternative headline for the Developer + AI target is in §3.

## 1. Inputs

| Check | Value |
|---|---|
| Site SEO (portfolio) | **75.7/100** — static 45/45, copy 30.7/55 (floor 74.7 ✓) |
| ATS `ai-engineer` → AI Engineer | **58.3/100** · coverage 85.0% · must-have 80.8% |
| ATS `fullstack-engineer` → Developer + AI | **63.6/100** · coverage 92.2% · must-have 100% |
| ATS `product-engineer` → Overall average | **48.9/100** · coverage 80.4% · must-have 100% |
| Missing must-haves (prevalence ≥ 70%) | ai-engineer: **PyTorch (82%)**, **AWS (72%)** — documented accepted gaps ([cv-report §1](./cv-report-2026-11-14.md)); fullstack/product: none |

**Snapshot freshness.** The export predates the autumn CV rewrite. Seed commits after it: stealth-startup experience and projects (`daeb6e6`, `e609e96`), email-automation data skills (`ecbd380`), engineer-teacher pitch reframe (`17c0120`), qualitative gate (`3eb6825`), experience-tech reorder + resume refresh (`52c1aa6`). Everything those commits added is absent from LinkedIn.

**Placement economics.** ATS scoring weights headline ×3, About/skills ×2, experience/projects ×1 (`scripts/lib/scoring/ats.ts`). Claimable must-haves go in the headline first, then About and skills.

## 2. Priorities

| P | Change | Why |
|---|---|---|
| **P1** | Add **Engineering AI Specialist — YourClient (YourClient \| YourClient)**, Sep 2026–present | Current employer missing entirely; strongest AI story you have |
| **P1** | Add **Full-Stack Engineer — Stealth Startup (NDA)**, Jun 2026–present | Second current role missing; carries Vertex AI / GCP / Terraform |
| **P1** | Close the **YourCompany React** role at Sep 2026 (LinkedIn still shows "Present") | Stale fact |
| **P1** | Replace headline and About | Must-have placement (×3/×2) + both blocks are 4 months stale |
| **P2** | Rewrite YourCompany React and YourCompany bullets; clean job titles | Slop patterns + missing concrete artifacts |
| **P2** | Skills diff (§6) | Junk entries, missing high-prevalence keywords |
| **P3** | Featured section, certifications trim, date reconciliations (§8) | Low effort, low risk |

## 3. Headline

**Current** (keyword-stuffed, pre-YourClient, missing FastAPI/PostgreSQL/Docker/LangGraph/SQL):

> AI Engineer \| Full-Stack \| LLMOps, NLP and RAG Architect \| Python, Langchain, Typescript, ReactJS \| Git, CI/CD

**Suggested** — 189/220 chars, carries every claimable ai-engineer must-have at ×3 weight:

```text
Engineering AI Specialist @ YourClient | RAG pipelines, AI agents & LLMOps in production | Python, LangChain, LangGraph, FastAPI, TypeScript, React, Docker, SQL | EdTech co-founder, ex-teacher
```

**Alternative** if you want the profile to target **Developer + AI** instead (the fullstack CV scores higher: 63.6, 100% must-haves):

```text
Full-Stack Engineer | React, TypeScript, Python, FastAPI, PostgreSQL, Docker | LLM APIs in product features | Cursor agent harnesses, test automation | EdTech co-founder
```

Why: "AI Engineer", "RAG", "LangChain", "Python" were already present; "FastAPI", "LangGraph", "Docker", "SQL", "PostgreSQL" were not, and all sit at 65–88% prevalence in `market-insights.ts`. The title now names your real current role instead of a target role — recruiters weight the headline field hardest.

## 4. About

**Problems with the current text** (2,441 chars, no YourClient/stealth startup, written while job-hunting):

| Current line | Pattern |
|---|---|
| "I am **passionate** about **leveraging** AI to solve real-world problems" | Banned words (no-ai-slop) |
| "ensuring efficient data processing and scalable infrastructures" | Fake-purpose clause |
| "making the platform both powerful and user-friendly" | Importance puffery |
| "My ability to bridge the gap between technology and business needs allows me to create scalable AI solutions with real-world impact" | Self-praise abstraction; fails the portability test |
| "I stay updated with advancements in generative AI… continuously improving my skill set" | Filler |
| "I am actively seeking opportunities as an AI Engineer" | Stale — you've been employed since this was written |
| "**cutting-edge** projects", "**robust** AI workflows" | Banned words |
| "Whether it's designing… I thrive on tackling complex challenges" | Rhetorical filler |
| "Let's shape the future of AI together!" | Fake-profound kicker |
| Claims of Langflow, multimodal AI, reinforcement learning | Not in the current CV — see §8 |

**Storytelling review (2026-11-15).** The arc works: engineer → teacher → engineer stays legible in six paragraphs, every number is real, and the strongest line is "I know what software costs the people who use it, because I was the customer." Three fixes applied to the block below:

1. **Chronology bug.** "Between the two" placed the stealth startup between YourCompany and YourClient without saying it is still current — a recruiter would read it as ended. Both current roles now open the bio ("Now:" / "Also now:"); history follows in reverse order.
2. **Keyword wall.** The YourCompany paragraph was one ~60-word inventory sentence in the middle of a story. Keyword coverage kept; rhythm restored by splitting outcome (hours → seconds) from mechanism ("Under the hood: …").
3. **Cold ending.** The bio ended on a keyword list. The closing line now reuses your own site pitch ("My engineering degree taught me deterministic systems; GenAI taught me probabilistic ones.") — it passes the portability test, which the old "Let's shape the future of AI together!" failed.

Deliberately left out: "open to opportunities" boilerplate (you're employed; inbound comes from the headline).

**Suggested replacement** — 1,665/2,600 chars, engineer-teacher arc from the site pitch, every claimable must-have placed at ×2 weight:

```text
I trained as an automation engineer, spent a decade teaching and running schools, and came back to engineering to build the software that world was missing.

Now: Engineering AI Specialist at YourClient for YourClient | YourClient. I lead the AI-as-Infrastructure rollout: developer harnesses wired into CI/CD, executive dashboards, and cross-team governance for 8 engineering and data teams delivering banking services through a core banking system migration.

Also now: full-stack and AI engineering at a stealth startup building a geolocated social platform, with a C#/.NET backend, React frontend, Flutter apps, and Python AI services (LangChain, Vertex AI) on GCP behind Terraform and GitHub Actions.

Before that I co-founded YourCompany, an EdTech SaaS for English teachers. Lesson production took hours; our LangChain and LangGraph pipelines cut it to seconds. Under the hood: RAG retrieval, LLM routing, prompt chains, structured outputs guarded by LangSmith, evaluation harnesses, FastAPI REST APIs on Supabase and PostgreSQL, Docker and GitHub Actions CI/CD, and multi-provider LLM calls (OpenAI, Claude, Gemini, GroqCloud) with fallbacks.

The decade in classrooms still pays the bills. At the school I ran (50+ students), a Python CRM turned CSV financial reports into retention dashboards, converted 60%+ of leads into paying students, and cut churn by half. I know what software costs the people who use it, because I was the customer.

My engineering degree taught me deterministic systems; GenAI taught me probabilistic ones. That mix is how I build.

Stack: Python, TypeScript, React, SQL, Docker, LangChain, LangGraph, FastAPI, PostgreSQL, LangSmith, CrewAI, Kubernetes.
```

Notes: no em dashes, no banned words, numbers come straight from the seed (8 squads, hours→seconds, 50+ students, 60%+ leads, churn halved). PyTorch and AWS are deliberately absent — they are the two documented accepted gaps; GCP/Vertex AI is the honest positioning (§8.2).

## 5. Experience

### 5.1 ADD — Engineering AI Specialist · YourClient (YourClient | YourClient)

Sep 2026 – Present · Your City, Brazil. This is your current title; it exists nowhere on LinkedIn.

```text
Leading the AI-as-Infrastructure rollout for YourClient | YourClient banking services: developer harnesses in CI/CD, technical governance, and cross-team delivery for a core banking system migration.

- Lead the rollout of AI developer harnesses into CI/CD pipelines for 8 engineering and data teams
- Orchestrate cross-team delivery and technical governance across the migration squads
- Built Python and React batch automation that manages Kanban tasks and card metadata for 8 squads
- Built management dashboards tracking team performance and migration milestones for executives
- Authored technical playbooks, troubleshooting guides, and onboarding docs for AI harness adoption
```

Source: seed experience row 11 + highlights 55–59.

### 5.2 ADD — Full-Stack Engineer · Stealth Startup (NDA)

Jun 2026 – Present · Your City, Brazil. Carries the Vertex AI / GCP / Terraform evidence the CV relies on.

```text
Full-stack, AI, data, and DevOps engineering on a geolocated social platform: C#/.NET backend, React frontend, Flutter apps, and Python AI services on GCP.

- Built an agent-and-RAG creator platform on LangGraph and Qdrant
- Ran geolocated 2026 election data pipelines as ETL on Docker and Kubernetes
- Implemented multi-tenant restaurant menu ingestion from HTML, PDF, PNG, and QR codes
- Shipped real-time bus tracking
- Automated all Jira card flows and backlogs through an SDLC harness with AI architecture and quality gates (system design, test coverage, cost, lint, vulnerability scans)
- Managed GCP infrastructure with Terraform and Cloud Run behind GitHub Actions CI/CD, with load balancing and async job workflows
```

Source: seed experience row 12 + highlights 60–66.

### 5.3 UPDATE — Senior Frontend Developer · YourCompany (React) — close and rewrite

Set the end date to **Sep 2026** (currently "Present"). Retitle from "Senior Frontend Engineer ReactJS Typescript Cursor" — keyword-stuffed job titles read as spam; keywords belong in bullets. Two current bullets to delete:

> "Acting as a bridge between product strategy and technical execution, contributing to feature ideation…" — bridge cliché, zero artifacts
> "Enabling the squad through AI adoption initiatives, and knowledge-sharing new practices." — vague, no artifact

**Suggested bullets** (source: highlights 1–5):

```text
- Developed frontend features from design, engineering, and business specifications
- Developed and tested the Cursor agent harness used by the frontend team
- Built agent tooling that cut token use and latency in Cursor flows
- Created a test harness that generates and validates unit and integration tests
- Built dashboards surfacing business insights from product data
```

### 5.4 UPDATE — Senior Frontend Developer · YourCompany (Flutter) — retitle

Retitle from "Senior Frontend Developer Flutter Dart Flutterflow" to "Senior Frontend Developer" (tools go in bullets — and FlutterFlow is retired as a current tool per §11; the CV lists Flutter/Dart for this role). Bullet fixes only where wording is off:

| Current | Suggested |
|---|---|
| "Stack Migration AI-Agent Framework from Flutter to Javascript" | "Migrated the AI-agent framework from Flutter to JavaScript" |
| "Creating Agent-Driven frameworks for documenting frontend and developing new features inside a legacy system." | "Built agent-driven frameworks that document the frontend and guide feature work in the legacy system" |
| "API Integration tests using Postman and DevTools" | "Wrote API integration tests using Postman and DevTools" |
| "Creating data processing DART functions to build charts and dashboards" | "Built Dart functions that turn raw data into charts and dashboards" |
| "Prototyping API Endpoints on Supabase / Postgresql" | "Prototyped API endpoints on Supabase / PostgreSQL" |

Sources: highlights 51–54 + your own snapshot bullets, cleaned.

### 5.5 UPDATE — YourCompany — retitle, re-date, rewrite

- Title: "Founding Engineer - Typescript Flutterflow Python Data Visualization Langchain" → **Co-founder & Lead Developer** (matches the CV; "Founding Engineer" undersells ownership).
- Dates: CV says **Nov 2023 – May 2026**; snapshot says Dec 2023 – Apr 2026. Use the CV dates (§8.4).
- Description intro (seed row 3): "Co-founded an AI-powered EdTech SaaS for English teachers: personalized learning paths and lesson automation that cut content production from hours to seconds."

Slop in the current bullets: "Spearheading the development of…" (fake-strong verb), "Leveraging 8+ years of teaching and educational management experience to inform core functionalities and user experience design" (banned "leveraging" + vague), "loosen my operational bottlenecks with AI prompt chains and COT" (typo, vague), "to ensure market success within the EdTech landscape" (importance puffery).

**Suggested bullets** (source: highlights 45–50):

```text
- Built the AI-powered EdTech SaaS on FlutterFlow, Supabase, TypeScript Edge Functions, Dart, Flutter, and Python
- Built a lean CI/CD pipeline using GitHub Actions and Vercel for multi-environment deployments
- Integrated multi-provider LLM APIs (OpenAI, Claude, Gemini, GroqCloud) with LangChain and LangSmith across prompt chains and chain-of-thought workflows
- Implemented LLM routing for structured data generation, cleaning, validation, and fallback mechanisms
- Led unit tests, SQL schema design, architecture design, database management, and scalable PostgreSQL backend solutions
- Contributed to business strategy, branding, pricing, sales, and financial-modeling dashboards
```

The FlutterFlow mention in the first bullet stays deliberately: it describes how YourCompany was built (seed highlight 45, past tense, role ended May 2026). Per §11 it must never appear in a current-tense field — headline, About, skills, or your active roles.

### 5.6 KEEP

Better Call Your, YourCompany, YourUniversity, YourAdvisor, and YourInstitution bullets are already verb-first and concrete (Python/Streamlit CRM, 60%+ lead conversion, churn −50%, exam task forces). No rewrites; two date mismatches are queued in §8.

## 6. Skills

The current skills list mixes real keywords with auto-added junk ("acquire gim suite", "across", "acting", "click", "clean"). Skills are a ×2-weight field; prune aggressively and add the missing high-prevalence ones.

**Add** (every one traces to the seed):

| Skill | Source |
|---|---|
| FastAPI | site pitch, ai-engineer description |
| LangGraph | ai-engineer chips; stealth highlight 60 |
| LangSmith | chips; YourCompany highlight 47 |
| Vertex AI | stealth experience row |
| Google Cloud Platform (GCP) | stealth experience row |
| Terraform | stealth highlight 65 |
| Kubernetes | chips on all three profiles; stealth highlight 61 |
| Docker | product chips; stealth/YourCompany rows |
| GitHub Actions | YourCompany highlight 46; stealth highlight 65 |
| C#/.NET | stealth experience row |
| Qdrant | stealth highlight 60 |
| LLM Evaluation | ai-engineer description ("evaluation harnesses") |
| Vector Databases | ai-engineer description ("vector search"); Qdrant |

**Keep:** Python, TypeScript, React, RAG, AI Agents, Prompt Engineering, CI/CD, PostgreSQL, Supabase, Flutter, LangChain, CrewAI (all already present, all high-prevalence).

**Remove:** the junk tokens above and near-duplicates (LinkedIn auto-suggestions like "ai agent" vs "ai-agent" vs "ai agents" — keep one form). Drop the FlutterFlow entry — retired per §11 (plain Flutter stays). Pin three at the top matching your target: Python, LangChain, RAG.

## 7. Featured, projects, certifications

- **Featured:** add the portfolio (`https://your-fullstack.vercel.app`, seed `website_url`). One strong link beats four weak ones.
- **GitHub section:** fine as-is; consider dropping repos you no longer maintain ("practice").
- **Certifications (resolved 2026-11-15):** the eight NoCode StartUp certificates (2023–24) predate the engineering pivot and add little next to the YourClient/YourClient story; with FlutterFlow retired (§11) none of them earns its slot — drop all eight. TOEFL shows "Expires: Sep 2015" — either remove it or keep only Cambridge FCE (which never expires).

## 8. Open questions

1. **Lead target.** I assumed AI Engineer (your current title). The fullstack CV scores higher (63.6, 100% must-haves). If you're pushing full-stack roles, swap in the §3 alternative headline and reorder the About stack line.
2. **PyTorch (82%) and AWS (72%)** stay out per the documented accepted-gap decision in the CV report. If the stealth work touched PyTorch or AWS since, say so and I'll add truthful claims.
3. **NDA scope.** §5.2 describes the platform category (geolocated social) and stack without naming it. Confirm your agreement allows this.
4. **YourCompany React start:** LinkedIn says Jan 2026; CV says Dec 2025.
5. **YourCompany dates:** CV Nov 2023 – May 2026 vs LinkedIn Dec 2023 – Apr 2026; the LinkedIn company page ("YourCompany Education", founded 2024) also disagrees with the founding claim. Pick one story.
6. **YourCompany dates:** LinkedIn Jun 2017 – Feb 2020 vs CV Nov 2016 – Jan 2020 (and the CV's ESL row carries the same span as the coordinator row). Confirm before touching YourCompany at all.
7. **Better Call Your start:** LinkedIn Feb 2020 vs CV Jan 2020.
8. **Churn −50%** is claimed for both the private school (About) and YourCompany (bullets). If both are true as stated, fine — but recruiters notice double-claimed metrics, so confirm.
9. **Langflow / multimodal AI / reinforcement learning** were in the old About but not the CV; the rewrite drops them. Say the word if you actively use Langflow and want it back.
10. **FlutterFlow in the CV and resumes** — resolved for LinkedIn (§11), but the seed still carries FlutterFlow as historical tech in the YourCompany/YourCompany rows, chips, resume skill tables, and the product-engineer headline, so the ATS PDFs still mention it. That is true history; if you want it out of the resumes too, that's a `db/seed.sql` edit with score effects — say the word.

## 9. Apply, then close the loop

1. Paste each ```text block into the matching LinkedIn field (headline ≤ 220, About ≤ 2,600, description ≤ 2,000 per position).
2. Apply the skills diff.
3. Re-export the profile (LinkedIn → profile → More → "Save to PDF", or whatever produced `db/linkedin-profile.txt`) and replace that file.
4. Re-run `npm run audit:content -- --json=data/seo-ats-report.json` — nothing there changes (it scores the site/CV, not LinkedIn), but the fresh snapshot makes the next `linkedin-refresh` run diff cleanly.
5. Character counts measured on the blocks in this document are listed in §10.

## 10. Character counts (measured)

| Field | Count | Limit |
|---|---|---|
| Headline (AI Engineer target) | 189 | 220 |
| Headline (Developer + AI alt) | 169 | 220 |
| About rewrite | 1,665 | 2,600 |
| YourClient description (§5.1) | 677 | 2,000 |
| Stealth description (§5.2) | 723 | 2,000 |
| YourCompany React bullets (§5.3) | 372 | 2,000 |
| YourCompany bullets (§5.5) | 684 | 2,000 |
| *Current About (for reference)* | *2,441* | *2,600* |

*(Counted with a Node pass over this document's `text` code blocks, trimmed; refresh after edits.)*

## 11. Decisions log

Durable decisions, oldest first. Future `linkedin-refresh` runs read this section before drafting.

| Date | Decision |
|---|---|
| 2026-11-15 | **FlutterFlow is retired.** You no longer use it; current practice is occasional low-code on the backend for speed. It must not appear in any current-tense LinkedIn field (headline, About, skills, active roles). Historical mentions stay only where they describe past builds (§5.5 YourCompany bullet, and the snapshot's recommendation text, which is someone else's words). The FlutterFlow certification drops with the other NoCode StartUp certificates (§7). Whether the resumes/seed should stop mentioning it too is open question §8.10. |





