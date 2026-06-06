#!/usr/bin/env bash
# Export the manuscript from Google Drive (source of truth) into the local cache.
# Drive is exported whole anyway, so we cache once and chunk locally — never
# re-download per page. Re-run this after you edit the Doc.
#   ./sync.sh            -> refresh .deai/manuscript.txt, print page count
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(cd "$here/../../.." && pwd)"
out="$root/.deai/manuscript.txt"
mkdir -p "$root/.deai"
node "$root/.claude/skills/book-edit/bin/read-doc.mjs" > "$out"
words=$(wc -w < "$out" | tr -d ' ')
echo "synced: $out  ($words words)"
"$here/pages.sh" "$out"
