---
name: linkedin-refresh
description: Produce a dated LinkedIn profile change list from this repo's CV database, the deterministic SEO/ATS audit, and the no-ai-slop writing rules. Use when the user wants LinkedIn (linkedin.com/in/your-username) aligned with the latest curriculum, asks what to change on the profile after seed.sql updates, or wants profile copy rewritten without AI slop.
---

# LinkedIn profile refresh

Turn the repo's CV ground truth plus the deterministic SEO/ATS audit into a
concrete, section-by-section change list for the LinkedIn profile. Deterministic
scripts do the scoring; you do the reading, comparing, and writing. The output
is a suggestions document only — you never log into LinkedIn or post anything.

## Sources

| Source | Path / command | Role |
|--------|----------------|------|
| LinkedIn snapshot | `db/linkedin-profile.txt` | Current profile state (manual export by the user) |
| CV ground truth | `data/portfolio.db` via `npm run audit:content` | Same data that renders `public/resumes/*.pdf` |
| Curriculum history | `git log -- db/seed.sql` | What changed in the CV, and when |
| Market keywords | `scripts/lib/scoring/market-insights.ts` | Prevalence per role + `PROFILE_ROLE_TARGETS` |
| Writing rules | `.cursor/skills/no-ai-slop/SKILL.md` + `eval.md` | Apply to every rewritten line |
| Prior decisions | Newest `docs/linkedin-profile-suggestions-*.md` → Decisions log | Durable user decisions; they outrank the CV's framing |

The snapshot is a plain-text export: headline, About, experience entries with
dates, certifications, skills list, activity. LinkedIn blocks anonymous page
fetches (HTTP 999) and the OAuth client in `scripts/integrations/linkedin/`
only reads name/photo/posts, so this file is the only reliable source for the
live profile. Never invent profile text you cannot see in it.

If a previous suggestions document exists, read its Decisions log before
drafting — those entries are durable user decisions (retired tools,
positioning choices) that override the CV's framing.

## Workflow

### 1. Build the ground truth

```bash
test -f data/portfolio.db || npm run db:reset
npm run audit:content -- --json=data/seo-ats-report.json
```

The JSON gives, per profile slug (`ai-engineer`, `fullstack-engineer`,
`product-engineer`): ATS score, coverage, must-have coverage, matched keywords,
and missing keywords with market prevalence. Missing must-haves
(prevalence ≥ 70) are the keywords the LinkedIn profile should carry. For the
qualitative recruitment screen, `npx tsx scripts/dev/cv-report.ts` is optional
extra context.

### 2. Date the snapshot

```bash
git --no-pager log -1 --format='%ad %h' --date=short -- db/linkedin-profile.txt
git --no-pager log --oneline -15 -- db/seed.sql
```

Every seed commit after the snapshot date is a potential profile gap. List them
as "profile doesn't show this yet" findings. If the snapshot is badly stale
(more than ~2 months) or the user says the profile changed recently, ask for a
fresh export before writing — suggestions against a stale snapshot produce
wrong diffs.

### 3. Gap analysis, three lenses

Walk every LinkedIn section (headline, About, each experience entry, skills,
projects, certifications) through all three:

1. **Staleness.** CV facts newer than the snapshot date: new roles, rewritten
   bullets, new skills, new projects, renamed positioning. Check the newest
   experience entries first.
2. **Keywords.** For each missing must-have from the audit, decide whether the
   profile can truthfully claim it (the CV already does) and where it belongs,
   using the ATS placement economics: headline ×3, About/skills ×2, body ×1.
   High-prevalence keywords go in the highest-weight field the truth supports.
3. **Writing.** Run the current copy through no-ai-slop **detect** mode: name
   each pattern (passion puffery, fake-strong verbs, importance puffery,
   superficial `-ing` clauses…) with the quoted line. The old About section is
   typically dense with these — expect a long list, and quote real lines.

### 4. Draft the rewrites

- **Truth lock (non-negotiable).** Every claim traces to `db/seed.sql`,
  `src/content/site.ts`, or something the user said this session. A keyword the
  profile cannot claim is an open question for the user, never a fabrication.
  Re-wording and re-ordering real experience is the job; new facts are not.
- **Field limits.** Headline ≤ 220 chars; About ≤ 2,600; per-position
  description ≤ 2,000; skills ≤ 100. Verify current limits in-app; LinkedIn
  changes them occasionally. Count characters before finalizing.
- **No slop.** Every rewritten line obeys `.cursor/skills/no-ai-slop/SKILL.md`:
  no banned words ("passionate", "leverage", "results-driven"), verb-first
  bullets, concrete numbers where the CV has them, no em-dash clusters, no
  fake-profound kickers, no binary contrasts or throat-clearing.
- **Keep the voice.** Preserve real specifics and the writer's blunt register.
  Kill filler, not character.

### 5. Self-check

Open `.cursor/skills/no-ai-slop/eval.md` and answer every check against each
rewritten block. Fail → fix → re-check. Then verify mechanically:

- Every suggestion cites its source (seed row, audit keyword, snapshot line).
- Keyword placement matches the ×3/×2/×1 weights.
- All field lengths within limits.
- Nothing in the rewrites contradicts the audit numbers.

### 6. Write the document

Write `docs/linkedin-profile-suggestions-YYYY-MM-DD.md` (docs/ is versioned;
follow the layout of `docs/cv-report-*.md`). Structure:

1. **Inputs** — audit scores, snapshot freshness, seed commits since the export.
2. **Priorities** — P1 missing must-have keywords + stale facts; P2 slop
   rewrites; P3 nice-to-haves.
3. **Section-by-section changes** — Current → Suggested → Why (prevalence,
   staleness, named slop pattern). Copy-paste ready.
4. **Skills diff** — add/remove, one line of justification each.
5. **Open questions** — gaps, decisions the user must make.
6. **Decisions log** — dated entries for every durable decision the user made
   this session. This is how session knowledge survives to the next run.

End the run by telling the user which sections changed and what needs their
decision. Refreshing `db/linkedin-profile.txt` after they apply the changes is
what closes the loop next time.

## Commands quick reference

| Command | Effect |
|---------|--------|
| `npm run audit:content -- --json=data/seo-ats-report.json` | Deterministic SEO + ATS report with missing must-haves |
| `npx tsx scripts/dev/cv-report.ts` | Full CV report (quant + qualitative screen) |
| `npm run db:reset` | Recreate `data/portfolio.db` from seed (only when missing) |
| `npm run linkedin:auth` | One-time LinkedIn OAuth — read-only profile/posts; not used by this skill |

## Guardrails

- The repo's resume variants target different roles
  (`PROFILE_ROLE_TARGETS`). Decide with the user which one the LinkedIn profile
  should lead with (the headline decides) — or state the assumption in the doc.
- Metrics from the old profile (e.g. the churn-reduction number) stay only if
  the CV still supports them; otherwise flag, don't delete silently.
- The suggestions document is committed. That's fine — the snapshot it quotes is
  already in the repo. Never add data from outside these sources.
