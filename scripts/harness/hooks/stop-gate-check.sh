#!/usr/bin/env bash
# Advisory Stop hook (harness quality gate): nudge when harness components drift
# from required structure. Checks, cheaply and without forks:
#   1. Skills (claude/agents/cursor roots) missing the `description` frontmatter.
#   2. Agent rules (*.mdc) missing description / scope frontmatter.
#   3. Hooks wired in .claude/settings.json referencing scripts that do not exist.
# Advisory only: always exits 0. Semantic judgment lives in the harness-quality skill.
# Wired via .claude/settings.json.

set -u

root="${CLAUDE_PROJECT_DIR:-$PWD}"

note() { printf 'harness-quality: %s\n' "$1"; }

has_field() {
  # has_field <file> <field> -> 0 when a "<field>:"-prefixed line exists in frontmatter
  local file="$1" field="$2" line delim_seen=0
  [[ -f "$file" ]] || return 1
  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" == "---" ]]; then
      delim_seen=$((delim_seen + 1))
      if [[ "$delim_seen" == 1 ]]; then continue; fi
      return 1
    fi
    if [[ "$delim_seen" == 1 ]]; then
      [[ "$line" == "$field:"* ]] && return 0
    fi
  done < "$file"
  return 1
}

for d in "$root/.claude/skills" "$root/.agents/skills" "$root/.cursor/skills"; do
  [[ -d "$d" ]] || continue
  for f in "$d"/*/SKILL.md; do
    [[ -f "$f" ]] || continue
    rel="${f#"$root"/}"
    if ! has_field "$f" description; then
      note "$rel is missing the description frontmatter — add when-to-use triggers or the skill cannot be selected reliably"
    fi
  done
done

for f in "$root"/.cursor/rules/*.mdc; do
  [[ -f "$f" ]] || continue
  rel="${f#"$root"/}"
  if ! has_field "$f" description || { ! has_field "$f" globs && ! has_field "$f" alwaysApply; }; then
    note "$rel is missing required frontmatter (description, plus globs or alwaysApply) — agent rules need an explicit scope"
  fi
done

settings="$root/.claude/settings.json"
[[ -f "$settings" ]] || exit 0
content="$(< "$settings")"
pat='CLAUDE_PROJECT_DIR/[A-Za-z0-9_./-]+'
while [[ "$content" =~ $pat ]]; do
  rel="${BASH_REMATCH[0]#CLAUDE_PROJECT_DIR/}"
  script="$root/$rel"
  if [[ ! -f "$script" ]]; then
    note "a hook wired in .claude/settings.json references missing script: $script"
  fi
  content="${content//$rel/}"
done

exit 0
