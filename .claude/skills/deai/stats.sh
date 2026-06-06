#!/usr/bin/env bash
# Usage: ./stats.sh page.txt   (or: cat page.txt | ./stats.sh)
# Cheap statistical tells: sentence-length variation, em-dash density,
# repeated sentence openers, triad-ish comma runs. Lower variation = more AI-like.
awk '
  BEGIN { RS="[.!?]+[ \n]+" }
  { n=split($0,w,/[^A-Za-z'\''’]+/); len=0; for(i in w) if(w[i]!="") len++;
    if(len>0){ c++; sum+=len; sq+=len*len; lens[c]=len;
      split($0,a,/[^A-Za-z'\''’]+/); first=tolower(a[1]); if(a[1]=="") first=tolower(a[2]);
      if(first==prev) run++; else run=1; if(run>maxrun)maxrun=run; prev=first } }
  END {
    if(c<2){print "too short"; exit}
    mean=sum/c; var=sq/c-mean*mean; sd=(var>0)?sqrt(var):0; burst=(mean>0)?sd/mean:0;
    printf "sentences:            %d\n", c;
    printf "mean length:          %.1f words\n", mean;
    printf "burstiness (sd/mean): %.2f   (>=0.45 healthy; lower = more AI-like)\n", burst;
    printf "longest same-opener run: %d  (<=2 healthy)\n", maxrun;
  }' "${1:-/dev/stdin}"
em=$(grep -o '—\|--' "${1:-/dev/stdin}" 2>/dev/null | wc -l | tr -d ' ')
echo "em-dashes:            $em        (watch if dense)"
