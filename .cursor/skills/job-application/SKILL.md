---
name: job-application
description: Tailor a CV and cover letter to a specific job description with a deterministic ATS gate. Use when the user shares a job posting (URL, file, or pasted text) and wants profile matching, an ATS score gate, an iterated tailored CV, and a cover letter delivered as markdown named after ROLE - COMPANY.
---

# Job Application Tailoring

Turn a job description into a gated, tailored CV + cover letter. Deterministic
scripts do extraction/scoring; you do reading, curation, and writing.

## Inputs

Accept any of: a posting URL, a `.txt/.md/.html` file path, or pasted text
(save pasted text to `<applications-root>/<tmp>.txt` and pass the path).
The applications root is `applications/` by default; override with
`--applications-dir <path>` on any command.

## Workflow

### 1. Extract the JD

```bash
npm run jd -- extract "<url-or-file>" [--role "..."] [--company "..."]
```

Creates `applications/<ROLE> - <COMPANY>/jd.md` (cleaned posting text) and
`jd.json` (sections + candidate keywords weighted 3 = title/requirements,
2 = responsibilities, 1 = other).

If extraction fails or the text is suspiciously short (JS-rendered page),
browse the URL yourself, save the visible posting text to a `.txt` file, and
re-run `extract` on that file.

### 2. Curate jd.json

Edit `jd.json` before building the gate:

- Verify `role` and `company` (the folder is named `<role> - <company>`; if you
  fix them, also update `dir` and rename the folder to match).
- Write a 1–3 sentence `summary` of what the job really is.
- Review `keywords` (from the market dataset): delete false positives, keep the rest.
- Add JD-specific vocabulary the dataset lacks to `extraKeywords` (domain
  terms, tools, certifications) with weights (3 must / 2 important / 1 nice).

### 3. Match the best profile

```bash
npm run jd -- match "<dir>"
```

Ranks the profile variants in `scripts/resumes/profile-scopes.mjs`
(`ai-engineer`, `fullstack-engineer`, `product-engineer`) against the JD
keywords → `match-report.md`, prints `BEST_PROFILE: <slug>`.

Read it. Use the recommended profile unless the gap analysis says otherwise.
Note missing weight-3 keywords — that's your honesty checklist for later.

### 4. Build the ATS gate

```bash
npm run jd -- gate "<dir>"
```

Writes `gate.json` (machine gate: keywords+weights, thresholds, qualitative
rubric) and `gate.md` (human-readable spec). Gated checks: **weighted presence
≥ 85%** (JD keyword coverage by weight), **must-have coverage 100%**, headline
echoes ≥ 60% of role terms, all sections present, ≤ 1000 words. Placement
quality (headline ×3, summary/skills ×2, body ×1) is reported with an advisory
target of 60 — it guides iteration but never blocks. The **overall nota**
blends both layers — overall = 70% × quantitative placement + 30% ×
agent-graded qualitative composite (graded as a tech recruitment manager
screening the CV with the trade's frameworks: 6-second screen, knock-outs, ATS
keyword search, STAR/CAR bullets, leveling, red flags), gated at ≥ 70 — and the
truth-lock criterion is a hard gate (below 100 the gate fails). Adjust
`gate.json` thresholds only with a reason.

During curation, move JD keywords the profile genuinely cannot claim (e.g. a
stack the candidate never used) out of `keywords`/`extraKeywords` into the
`gaps` array with a reason — they are job-fit questions for the user, not CV
writing targets. Fabricating them is forbidden (truth lock).

### 5. Generate the tailored CV → `cv.md`

Follow `templates/cv-template.md` exactly (section headings are load-bearing —
the scorer parses them). Source **every fact** from:

- `scripts/resumes/profile-scopes.mjs` — chosen variant's headline/summary/
  keywords/skills/experience bullets/projects
- `src/content/site.ts` (regenerate via `npm run build:content` if missing/stale)
- `content/projects/*.md` — project write-ups
- Contact info from `site_profile` in `db/seed.sql` (name, email, city, links)

Placement strategy (the gate rewards it):

| JD weight | Where it must land |
|-----------|--------------------|
| 3 (must) | Headline and/or Summary/Skills |
| 2 | Skills + experience bullets |
| 1 | Anywhere it's genuinely true |

Use the dataset's canonical terms or close aliases (e.g. JD says "K8s" → write
"Kubernetes (K8s)"; JD says "vector DB" → write "vector search / Pinecone").

### 6. Score against the gate

```bash
npm run jd -- score "<dir>"
```

Writes `gate-report.md` (verdict, per-keyword table, improvement plan); exit
code 1 on FAIL. **On PASS, the approved CV is rendered to `cv.pdf`
automatically** (Playwright, ATS-safe single column, hard-fails above 2 pages).
The **overall ATS score stays pending** until the qualitative layer is graded —
run the next step before treating a PASS as final.

### 7. Grade the qualitative layer → `qualitative.json`

```bash
npm run jd -- qualitative "<dir>"   # scaffold; preserves scores already filled
```

Switch seats: grade `cv.md` as a **tech recruitment manager hiring for this
role** — the hiring-side reviewer who owns the shortlist and rejects most CVs.
Apply the trade's frameworks while scoring each criterion in `qualitative.json`
(0–100 plus evidence: a short quote or specific reason):

- **6-second screen** — headline + summary must yield role, seniority, core
  stack, and a gut fit verdict for this JD before you look away.
- **Knock-out check** — the JD's non-negotiables (seniority, years, core
  stack, eligibility) must be answered; silence reads as rejection.
- **ATS keyword search** — recruiters query their ATS with the JD's terms;
  synonym drift buries a CV in the pile.
- **STAR/CAR bullets** — context → action → measurable result; "responsible
  for" duty lists score low.
- **Leveling read** — scope, ownership, leadership, and impact must match the
  claimed seniority.
- **Red-flag scan** — buzzword soup, template/AI smell, vagueness, or
  overclaiming sends a CV to the reject pile.

Grade the CV as written, not as intended; if a criterion is weak, revise
`cv.md` first, then re-grade. Truth lock scores 100 only when every claim
traces to the allowed sources — anything below fails the gate outright (a
recruiter's trust, once broken, is unrecoverable). Re-run
`npm run jd -- score "<dir>"` after grading; the report shows the overall nota
and per-criterion evidence.

### 8. Iterate

Read `gate-report.md`, apply its improvement plan to `cv.md`, re-score. Max 3
iterations. If a must-have keyword has no truthful support in the profile,
**stop** and tell the user instead of faking it — the gate stays red on that
keyword by design.

### 9. Cover letter → `cover-letter.md`

Follow `templates/cover-letter-template.md`. Mirror the JD's top must-haves
and reference one concrete company/product detail. Same truth lock as the CV.

### 10. Deliver

```bash
npm run jd -- deliver "<dir>"
```

Refuses unless the gate report verdict is PASS **with a complete qualitative
review** and both files exist. Copies:

- `applications/CV/<ROLE - COMPANY>.md` and `.pdf`
- `applications/COVER LETTER/<ROLE - COMPANY>.md`

Regenerate the PDF anytime with `npm run jd -- pdf "<dir>"`.

### Everything here is ephemeral

`applications/` is gitignored and the pre-commit hook **blocks any commit**
touching it — CVs, cover letters, PDFs, and JDs are local-only artifacts.
Copy them out (email, ATS upload, Drive) rather than committing them.

## Guardrails

### Truth lock (non-negotiable)

- Every CV/cover-letter claim must trace to `profile-scopes.mjs`, `site.ts`,
  `content/projects/*.md`, or information the user gave you in this session.
- Never invent employers, titles, dates, degrees, certifications, metrics, or tools.
- A JD keyword the profile lacks is a **flag to the user**, not a fabrication slot.
- Reordering, re-wording, and emphasizing real experience is the job; new facts are not.

### Writing quality

- Cut AI-slop: no "passionate", "results-driven", "dynamic professional",
  "leverage synergies", "excited to announce". No exclamation marks.
- Bullets: verb-first, concrete artifact, measurable outcome when the data exists
  ("Cut lesson generation from hours to seconds with LangGraph pipelines").
- ATS-safe formatting: no tables, columns, images, icons, headers/footers-only
  content, or exotic unicode beyond standard accents/punctuation.
- Match the JD's language for the same concept (their noun, your evidence).

## Deliverable layout

```
applications/
  CV/<ROLE - COMPANY>.md                 final CV
  CV/<ROLE - COMPANY>.pdf                final CV (PDF, rendered from the approved cv.md)
  COVER LETTER/<ROLE - COMPANY>.md       final cover letter
  <ROLE - COMPANY>/                      working folder: jd.md, jd.json,
    match-report.md, gate.json, gate.md, qualitative.json, gate-report.md,
    cv.md, cv.pdf, cover-letter.md
```

`applications/` is gitignored and pre-commit-blocked — nothing here is ever committed.

## Hooks

`.claude/settings.json` wires a Stop hook (`scripts/jd/hooks/stop-gate-check.sh`)
that reminds when the newest application's `cv.md` is unscored or failing its gate.

## Commands quick reference

| Command | Effect |
|---------|--------|
| `npm run jd -- extract <url\|file>` | Scaffold application folder + jd.md + jd.json |
| `npm run jd -- match "<dir>"` | Rank profiles → match-report.md |
| `npm run jd -- gate "<dir>"` | Build gate.json + gate.md |
| `npm run jd -- qualitative "<dir>"` | Scaffold qualitative.json (agent-graded rubric; preserves filled scores) |
| `npm run jd -- score "<dir>"` | Score cv.md + qualitative.json → gate-report.md (exit 1 on FAIL; PASS also renders cv.pdf) |
| `npm run jd -- pdf "<dir>"` | Re-render the approved CV PDF (gate must be PASS) |
| `npm run jd -- html "<dir>" [file.md]` | Render a markdown doc (default profile-questions.md) to styled static HTML |
| `npm run jd -- deliver "<dir>"` | Copy PASSing CV + PDF + cover letter to delivery folders |

