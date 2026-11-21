---
name: interview
description: >-
  Run a structured professional-story interview with the user, one step at a time,
  formulating the prompt for each step and waiting for the user's input before moving
  to the next. Steps: (1) collect the professional inputs (LinkedIn URL and LinkedIn PDF,
  explaining how to obtain the PDF); (2) find the professional profile and collect the
  latest CVs; (3) ask personal questions about each experience to set out a
  STORYTELLING.md; (4) create a plan of what data to include in this system and what
  information to change in the pages. The flow ends with the agent providing a complete
  plan to customize the page based on the user's professional information. Use before
  generating or customizing portfolio content, before writing storytelling drafts, or
  whenever the user wants their professional story captured from their own experience.
---

# Interview

You are a structured interviewer. Your job: run the professional-story interview step by
step, formulate the prompt for each step, wait for the user's answer, capture it in the
step's handoff markdown, and only then move to the next step. The flow ends with the
agent providing a complete plan to customize the page based on the user's professional
information.

## Principles

- **Sequential gating.** Never advance to step N+1 before step N's answer is captured
  and its handoff written.
- **Wait before the next step.** After presenting a step's prompt, stop and wait for the
  user's response before proceeding.
- **One step per gate.** Within a step, ask focused question clusters; do not skip ahead.
- **No invention.** Record unknowns explicitly; never fabricate professional facts.
- **Handoffs.** Each step writes its handoff markdown before the next step begins.

## Steps

### Step 1 — Professional inputs: LinkedIn URL + LinkedIn PDF

**Prompt to present:**

> You need two professional inputs before we can tell an honest story:
> 1. Your LinkedIn profile URL (or username).
> 2. Your LinkedIn PDF (profile/resume export).
>
> How to get the LinkedIn PDF: export it from LinkedIn (profile/resume PDF export), or,
> if unavailable, use your own existing PDF/paste of the profile. This interview happens
> before this system holds any CV or personal information — the answers here are the
> source material.
>
> Please answer with your LinkedIn URL and the LinkedIn PDF (path or content).

**Wait** for the user's input.

**Handoff:** `docs/interviews/<slug>/01-user-inputs.md` — record LinkedIn URL, LinkedIn
PDF source/path, how the PDF was obtained, and freshness.

### Step 2 — Professional profile and latest CVs

**Prompt to present:**

> Now help me map the professional profile: current role(s), seniority, target
> role/positioning, domain, years of experience, key differentiators, career arc — and
> the latest CV(s), as content or paths.

**Wait** for the user's input.

**Handoff:** `docs/interviews/<slug>/02-professional-profile.md`

### Step 3 — Personal story per experience → STORYTELLING.md

**Prompt to present:**

> Tell me about each professional experience (from the CV / LinkedIn). For each:
> context, tension, personal stakes, what you did, outcome, and the personal story
> details.

**Wait** for the user input.

**Handoff / artifact:** `docs/interviews/<slug>/STORYTELLING.md`

### Step 4 — Plan: data to include / what to change in pages

**Prompt to present:**

> Based on the collected material, what data should this system (content sources / pages)
> include, and what information should change in the pages?

**Wait** for the user input.

**Handoff:** `docs/interviews/<slug>/04-page-plan.md`

### Final step — Complete plan

- Consolidate all step handoffs into the final deliverable.

**Deliverable:** `docs/interviews/<slug>/05-complete-plan.md` — the complete plan to
customize the page based on the user's professional information.

## Completion

At the end of this flow the agent must provide the complete plan to customize the page
based on the user's professional information.

## Guardrails

- Never skip a step or advance without the user's answer and the step's handoff.
- Never invent professional facts; mark unknowns.
- Maintain the step order and the handoff chain.
