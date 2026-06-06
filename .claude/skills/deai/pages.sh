#!/usr/bin/env bash
# Paragraph-snapped paginator. manuscript.txt is one paragraph per line.
# Pages are ~400 words but ALWAYS end on a paragraph break, so a page never
# hands the detector half a sentence. Page numbers are stable.
#   ./pages.sh manuscript.txt        -> "N pages of ~400 words"
#   ./pages.sh manuscript.txt 7      -> print page 7 (paragraphs, blank-line separated)
SIZE=400
awk -v size="$SIZE" -v want="${2:-0}" '
  { lines[++L]=$0; nw=split($0,a," "); wc[L]=nw }
  END {
    p=1; buf=""; n=0
    for(i=1;i<=L;i++){
      buf=buf (buf==""?"":"\n") lines[i]; n+=wc[i]
      if(n>=size){ if(want==p){print buf; exit} p++; buf=""; n=0 }
    }
    if(buf!="" && want==p) print buf
    if(want==0) printf "%d pages of ~%d words\n", (buf!=""?p:p-1), size
  }' "$1"
