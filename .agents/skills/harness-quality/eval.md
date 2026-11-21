# Harness quality eval

Run this after an audit, or before shipping a new or edited harness component.

## Audit mode

### Skill
1. Valid frontmatter: `name` and `description` present?
2. Description carries when-to-use and when-not / exclusions?
3. Single job; no overlap or conflict with sibling skills?
4. Instructions clear, specific, imperative, contradiction-free?
5. Context provided / progressive disclosure via `references/`?
6. `eval.md` or equivalent gate exists?

### Rule
1. Frontmatter: `description`, `globs`, `alwaysApply`?
2. Actionable directive language?
3. Scope (`globs`) correct?
4. No contradiction with other rules / skills / CLAUDE.md?

### Hook
1. Correct event + matcher?
2. `timeout` configured?
3. Fail-safe: cleanup, safe exit, non-blocking?
4. Idempotent?
5. Payload validated before use?
6. Cheap: no blocking work in Stop hooks?

## Ship gate

- [ ] All applicable checks pass before the component ships.
- [ ] Evals updated for changed behavior.

## After fixes

Re-run the Stop gate (`scripts/harness/hooks/stop-gate-check.sh`) and re-audit affected components.
