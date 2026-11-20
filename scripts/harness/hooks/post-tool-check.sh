#!/usr/bin/env bash
# PostToolUse hook (harness quality check): when a harness component file is
# written or edited mid-session, run the cheap structural check and surface any
# finding back to the model as context.

set -u

root="${CLAUDE_PROJECT_DIR:-$PWD}"

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

input="$(cat)"
pat='file_path":"([^"]*)"'
if [[ "$input" =~ $pat ]]; then
  path="${BASH_REMATCH[1]}"
  case "$path" in
    "$root"/.claude/skills/*|"$root"/.agents/skills/*|"$root"/.cursor/skills/*|"$root"/.cursor/rules/*|"$root"/.claude/settings.json)
      if [[ "$path" == *.mdc ]]; then
        if ! has_field "$path" description || { ! has_field "$path" globs && ! has_field "$path" alwaysApply; }; then
          printf 'harness-quality: %s is missing required frontmatter (description, plus globs or alwaysApply) — agent rules need an explicit scope\n' "$path"
        fi
      elif [[ "$path" == */SKILL.md ]]; then
        if ! has_field "$path" description; then
          printf 'harness-quality: %s is missing the description frontmatter — add when-to-use triggers or the skill cannot be selected reliably\n' "$path"
        fi
      fi
      ;;
  esac
fi

exit 0
