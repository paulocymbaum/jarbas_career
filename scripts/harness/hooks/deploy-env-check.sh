#!/usr/bin/env bash
# Advisory Stop hook (deploy env gate): nudge when the deploy pipeline's required
# Vercel/GitHub variables are missing from .env. Points the user to the deploy-setup
# skill, which walks through the Vercel account/project/token and the GitHub account
# setup step.

set -u

root="${CLAUDE_PROJECT_DIR:-$PWD}"

note() { printf 'deploy-setup: %s\n' "$1"; }

if [[ ! -f "$root/.env" ]]; then
  note ".env not found — create it from .env.example and fill the Vercel/GitHub variables required by the deploy pipeline (run the deploy-setup skill)."
  exit 0
fi

content="$(< "$root/.env")"
missing=""
for key in VERCEL_TOKEN VERCEL_ORG_ID VERCEL_PROJECT_ID GITHUB_TOKEN VITE_BASE_PATH VITE_UMAMI_WEBSITE_ID VITE_UMAMI_URL; do
  if [[ ! "$content" =~ (^|[^A-Z0-9_])${key}= ]]; then
    missing="$missing $key"
  fi
done

if [[ -n "$missing" ]]; then
  note ".env is missing required deploy variables:${missing} — generate them via the deploy-setup skill (Vercel account/project/token → .env; GitHub account/auth step)."
fi

exit 0
