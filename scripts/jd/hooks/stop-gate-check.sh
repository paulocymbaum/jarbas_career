#!/usr/bin/env bash
# Advisory Stop hook (fork-free): remind when the newest application's cv.md
# is unscored or failing its ATS gate. Wired via .claude/settings.json.
# Idle cost (no applications/ dir): one directory stat, zero subprocesses.
set -u

root="${CLAUDE_PROJECT_DIR:-$PWD}"
apps="$root/applications"

[[ -d "$apps" ]] || exit 0

# Newest applications/*/cv.md via bash -nt comparisons (no ls/sort forks).
newest=""
for cv in "$apps"/*/cv.md; do
  [[ -f "$cv" ]] || continue
  if [[ -z "$newest" || "$cv" -nt "$newest" ]]; then
    newest="$cv"
  fi
done
[[ -n "$newest" ]] || exit 0

dir="${newest%/*}"
name="${dir##*/}"
report="$dir/gate-report.md"

if [[ ! -f "$report" ]]; then
  printf 'job-application: "%s" has cv.md but no gate-report.md — run: npm run jd -- score "%s"\n' "$name" "$name"
  exit 0
fi

if [[ "$newest" -nt "$report" ]]; then
  printf 'job-application: "%s" cv.md changed after the last scoring — re-run: npm run jd -- score "%s"\n' "$name" "$name"
  exit 0
fi

# Read the report via builtin redirect; verdict check via bash regex (no grep fork).
report_text="$(< "$report")"
if [[ "$report_text" =~ Verdict:\*\*[[:space:]]*FAIL ]]; then
  printf 'job-application: "%s" FAILS its ATS gate — follow gate-report.md improvement plan, revise cv.md, re-score.\n' "$name"
  exit 0
fi

if [[ "$report_text" =~ Verdict:\*\*[[:space:]]*PASS ]]; then
  pdf="$dir/cv.pdf"
  if [[ ! -f "$pdf" ]]; then
    printf 'job-application: "%s" passed the gate — cv.pdf missing — run: npm run jd -- pdf "%s"\n' "$name" "$name"
  elif [[ "$newest" -nt "$pdf" ]]; then
    printf 'job-application: "%s" cv.md is newer than cv.pdf — run: npm run jd -- pdf "%s"\n' "$name" "$name"
  fi
  if [[ ! -f "$dir/qualitative.json" ]] || ! [[ "$report_text" =~ Status:\*\*[[:space:]]*complete ]]; then
    printf 'job-application: "%s" passed but the qualitative review is pending — run: npm run jd -- qualitative "%s"\n' "$name" "$name"
  fi
fi

exit 0
