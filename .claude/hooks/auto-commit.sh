#!/usr/bin/env bash
# Stop hook: when a Claude turn ends with uncommitted changes in this repo,
# commit them all and push to origin. Does nothing if the tree is clean.
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0
[ -z "$(git status --porcelain)" ] && exit 0

git add -A
files=$(git diff --cached --name-only | head -8 | tr '\n' ' ')
git commit -q -m "Auto-commit: update ${files}" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" || exit 0
if git push -q origin HEAD 2>/dev/null; then
  echo '{"systemMessage": "Auto-committed and pushed to GitHub."}'
else
  echo '{"systemMessage": "Auto-committed locally, but the push to GitHub failed."}'
fi
