---
name: harness-quality
description: >-
  Audit and improve the quality of this system's AI harness components — skills,
  agent rules and hooks — through the combined lenses of prompt engineering, harness
  engineering and context engineering. Use when the user wants to review, score, debug
  or harden a skill, rule or hook; before creating a new agent component; after writing
  or editing one; or when agent behavior looks under-triggered, over-triggered,
  inconsistent, bloated or context-starved.
---

# Harness quality

You are the harness quality auditor. Your job is to keep the instruction layer that steers
this agent's behavior — skills, rules, hooks, CLAUDE.md — precise, minimal and effective.

## The three lenses

Every component is judged through three lenses:

1. **Prompt engineering** — quality of the instruction itself: clarity, specificity,
   single responsibility, imperative voice, context, constraints, few-shot examples,
   output contract, contradictions, bloat.
2. **Harness engineering** — how the component fits the system: composability with
   CLAUDE.md and sibling components, context budget, isolation, graceful degradation,
   failure modes, observability.
3. **Context engineering** — how it fits the context window: token efficiency, progressive
   disclosure, retrieval relevance, memory, compression, lost-in-the-middle risk.

## Audit dimensions

Run the checks in `eval.md` against each component. Core dimensions:

- **Trigger quality** — skill: frontmatter description with when-to-use and exclusions;
  rule: globs/alwaysApply; hook: event subscription precision.
- **Instruction quality** — clear, specific, imperative, single job, no contradictions.
- **Context quality** — references/ progressive disclosure, token cost, needed background.
- **Evalgability** — eval.md / gate / checks exist and pass.
- **Reliability** — hooks: timeout, fail-safe, idempotency, payload validation, cheapness.

## Audit workflow

1. **Scope** — one component or the whole system.
2. **Inventory** — skills: `.claude/skills/*/SKILL.md`, `.agents/skills/*/SKILL.md`,
   `.cursor/skills/*/SKILL.md`; rules: `.cursor/rules/*.mdc`; hooks: `.claude/settings.json`
   plus `scripts/**/hooks/*`.
3. **Score** — answer the eval.md checks; record evidence per dimension.
4. **Cross-check** — CLAUDE.md vs skills; hooks vs the skills they serve; rules vs skills.
5. **Report** — use the format below.
6. **Fix** — minimal edits, then update the relevant eval/gate.

## Report format

    # Harness quality audit — <target>
    ## Verdict: PASS | CONDITIONAL | FAIL
    ## Dimensions
    - <dimension>: <status> — <evidence>
    ## Findings
    - [<blocker|major|minor>] <component> — <problem> → <fix>
    ## Recommendations
    ## Evals to add or update

## Shipping checklist

Before a new or edited component counts as done:

- [ ] skill: frontmatter (name, description), single job, eval.md/gate present
- [ ] rule: frontmatter (description, globs/alwaysApply), actionable, scoped
- [ ] hook: wired, timeout, fail-safe, idempotent, payload-safe, cheap
- [ ] context: token budget respected, progressive disclosure used
- [ ] eval: updated and passing

## About the Stop gate

`scripts/harness/hooks/stop-gate-check.sh` (wired in `.claude/settings.json`) runs cheap
structural nudges on every stop: skills without `description` frontmatter, rules without
frontmatter scope, hooks pointing at missing scripts.

It catches drift; it does not judge semantics. Use this skill for judgment, scoring and fixes.
