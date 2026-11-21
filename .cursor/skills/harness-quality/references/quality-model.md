# Harness quality model

Deeper rubric behind the eval checks. Use it when scoring a component and deciding severity.

## Prompt engineering anchors

- **Clarity**: a reviewer should be able to tell what the instruction means without guessing.
- **Specificity**: behaviors, formats, examples, boundaries are stated concretely.
- **Single responsibility**: one component, one job; split when the job multiplies.
- **Constraints**: what the agent must or must not do, plus length/format expectations.
- **Few-shot**: examples beat abstract rules when behavior is nuanced.

## Harness engineering anchors

- **Composability**: instructions do not fight CLAUDE.md or sibling components; conflicts
  are resolved explicitly.
- **Context budget**: components earn their context; duplication across skills is a smell.
- **Graceful degradation**: missing references or config degrade safely, do not hard-fail.
- **Observability**: drift is detectable via evals and gates — the Stop gate is the cheap
  structural version of this.

## Context engineering anchors

- **Token efficiency**: smallest sufficient instruction set.
- **Progressive disclosure**: detail lives in `references/`, not the top-level file.
- **Relevance**: context is applied only when needed.
- **Window fit**: no component should blow the context or bury critical info
  (lost-in-the-middle risk).

## Severity

- **Blocker**: component cannot trigger / will misfire / will corrupt context.
- **Major**: unreliable or unclear in common cases.
- **Minor**: polish, wording, ordering.
