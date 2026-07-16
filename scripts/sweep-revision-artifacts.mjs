#!/usr/bin/env node
/**
 * Mechanical sweep for revision artifacts in the manuscript.
 *
 * Source (first match wins):
 *   --from-drive     Google Doc plain text via book-edit auth
 *   --from-epub PATH  epub (default: public/chasing-the-sun-draft.epub)
 *   --from-text PATH  plain text, one paragraph per line
 *   stdin             if piped
 *
 * Usage:
 *   node scripts/sweep-revision-artifacts.mjs
 *   node scripts/sweep-revision-artifacts.mjs --from-drive
 *   node scripts/sweep-revision-artifacts.mjs --json > hits.json
 *   node scripts/sweep-revision-artifacts.mjs --category dup-adjacent
 *
 * Output: hit list with line numbers and ~10 words of context. No edits.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stdin as input, stdout, stderr } from 'node:process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const args = process.argv.slice(2);
const wantJson = args.includes('--json');
const categoryFilter = (() => {
  const i = args.indexOf('--category');
  return i >= 0 ? args[i + 1] : null;
})();
const outPath = (() => {
  const i = args.indexOf('--out');
  return i >= 0 ? args[i + 1] : null;
})();

// ── load lines ──────────────────────────────────────────────────────────────

async function loadLines() {
  if (args.includes('--from-drive')) {
    stderr.write('Loading plain text from Drive…\n');
    const text = execFileSync(
      'node',
      [join(ROOT, '.claude/skills/book-edit/bin/read-doc.mjs')],
      { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
    );
    return text.replace(/\n+$/, '').split('\n');
  }

  const fromTextIdx = args.indexOf('--from-text');
  if (fromTextIdx >= 0) {
    const p = args[fromTextIdx + 1];
    return readFileSync(p, 'utf8').replace(/\n+$/, '').split('\n');
  }

  // stdin if piped
  if (!process.stdin.isTTY) {
    const chunks = [];
    for await (const chunk of input) chunks.push(chunk);
    const text = Buffer.concat(chunks).toString('utf8');
    if (text.trim()) return text.replace(/\n+$/, '').split('\n');
  }

  const fromEpubIdx = args.indexOf('--from-epub');
  const epubPath =
    fromEpubIdx >= 0
      ? args[fromEpubIdx + 1]
      : join(ROOT, 'public/chasing-the-sun-draft.epub');

  if (!existsSync(epubPath)) {
    stderr.write(`No source found (missing ${epubPath}). Use --from-drive or --from-text.\n`);
    process.exit(1);
  }
  stderr.write(`Extracting text from ${epubPath}…\n`);
  return extractEpubParagraphs(epubPath);
}

function extractEpubParagraphs(epubPath) {
  const dir = join(tmpdir(), `cts-sweep-${process.pid}`);
  mkdirSync(dir, { recursive: true });
  execFileSync('unzip', ['-qq', '-o', epubPath, '-d', dir]);
  // sections in order
  const sectionFiles = execFileSync(
    'bash',
    ['-lc', `ls ${dir}/GoogleDoc/section-*.xhtml 2>/dev/null | sort -V`],
    { encoding: 'utf8' },
  )
    .trim()
    .split('\n')
    .filter(Boolean);

  const lines = [];
  for (const file of sectionFiles) {
    const html = readFileSync(file, 'utf8');
    // pull body text from <p>…</p> and headings; drop tags
    const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html;
    const blocks = body.match(/<(?:p|h[1-6])\b[^>]*>[\s\S]*?<\/(?:p|h[1-6])>/gi) || [];
    for (const block of blocks) {
      let t = block
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
        .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
        .replace(/\s+/g, ' ')
        .trim();
      if (t) lines.push(t);
    }
  }
  return lines;
}

// ── helpers ─────────────────────────────────────────────────────────────────

const WORD = /[A-Za-z0-9''']+/g;

function wordsAround(text, index, matchLen, n = 10) {
  // ~n words before + match + ~n words after (character-window based on word count)
  const before = text.slice(0, index);
  const after = text.slice(index + matchLen);
  const beforeWords = before.trimEnd().split(/\s+/).filter(Boolean);
  const afterWords = after.trimStart().split(/\s+/).filter(Boolean);
  const pre = beforeWords.slice(-n).join(' ');
  const mid = text.slice(index, index + matchLen);
  const post = afterWords.slice(0, n).join(' ');
  return { pre, mid, post, context: `${pre ? pre + ' ' : ''}«${mid}»${post ? ' ' + post : ''}` };
}

function pushHit(hits, { line, lineNo, category, rule, match, index, note }) {
  const { context, pre, mid, post } = wordsAround(line, index, match.length, 10);
  hits.push({
    line: lineNo,
    category,
    rule,
    match,
    context,
    pre,
    mid,
    post,
    note: note || undefined,
    // full line kept only in --json for triage; keep short for human list
    linePreview: line.length > 160 ? line.slice(0, 157) + '…' : line,
  });
}

// Idiomatic A X A patterns to suppress (day to day, etc.)
const ABA_OK_MIDDLE = new Set(
  'to for by and after after from in on of or with without upon into over under between among against before during through per a an the'.split(
    ' ',
  ),
);
// A X A where X is a known idiom middle AND A is a common pair word — skip
const ABA_IDIOMS = new Set([
  'day to day',
  'hand in hand',
  'side by side',
  'face to face',
  'eye to eye',
  'heart to heart',
  'man to man',
  'back to back',
  'head to head',
  'one by one',
  'bit by bit',
  'step by step',
  'time after time',
  'year after year',
  'day after day',
  'night after night',
  'again and again',
  'over and over',
  'neck and neck',
  'word for word',
  'all in all',
  'end to end',
  'door to door',
  'wall to wall',
  'hand to hand',
  'mouth to mouth',
  'arm in arm',
  'little by little',
  'side to side',
  'up and up',
  'on and on',
  'out and out',
  'so and so',
  'such and such',
  'more and more',
  'less and less',
  'her and her', // rare dialogue
  'him and him',
  'them and them',
]);

// Words that legitimately double in English prose / dialogue
const DUP_OK = new Set([
  'had', // had had
  'that', // that that
  'do', // do do (rare dialogue)
  'her', // her her? usually error — leave flagged
  'is', // is is error
  'was', // was was error
]);
// Only suppress known grammatical doubles
const DUP_SUPPRESS = new Set(['had had', 'that that']);

// ── detectors ───────────────────────────────────────────────────────────────

function detectDupAdjacent(line, lineNo, hits) {
  // exact adjacent duplicate tokens (case-insensitive), alphanumeric words
  const re = /\b([A-Za-z][A-Za-z''']*)\s+\1\b/gi;
  let m;
  while ((m = re.exec(line)) !== null) {
    const pair = `${m[1]} ${m[1]}`.toLowerCase();
    if (DUP_SUPPRESS.has(pair)) continue;
    // "ha ha", "no no", "yes yes", "well well" — common speech; still flag as probable later
    pushHit(hits, {
      line,
      lineNo,
      category: 'dup-adjacent',
      rule: 'adjacent-duplicate-word',
      match: m[0],
      index: m.index,
      note: /^([A-Za-z]+)\s+\1$/i.test(m[0]) ? undefined : undefined,
    });
  }
}

function detectAbaEcho(line, lineNo, hits) {
  // word X word  (same content word with one token between) — partial-edit residue
  const re = /\b([A-Za-z]{3,}[A-Za-z''']*)\s+([A-Za-z''']+)\s+\1\b/gi;
  let m;
  while ((m = re.exec(line)) !== null) {
    const phrase = m[0].toLowerCase().replace(/\s+/g, ' ');
    if (ABA_IDIOMS.has(phrase)) continue;
    const middle = m[2].toLowerCase();
    // "man to man" style with OK middle still often legitimate — only skip if in idiom list
    // Flag A X A where A is a content word; skip pure function words as A
    const a = m[1].toLowerCase();
    if (['the', 'and', 'for', 'but', 'not', 'you', 'she', 'his', 'her', 'him', 'they', 'them', 'was', 'were', 'are', 'has', 'have', 'had', 'did', 'does', 'will', 'would', 'could', 'should', 'been', 'being', 'this', 'that', 'with', 'from', 'into', 'onto', 'than', 'then', 'when', 'what', 'which', 'who', 'whom', 'how', 'why', 'all', 'any', 'can', 'may', 'might', 'must', 'shall', 'our', 'out', 'own', 'too', 'very', 'just', 'also', 'only', 'even', 'back', 'down', 'over', 'such', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'than', 'too', 'very'].includes(a) && ABA_OK_MIDDLE.has(middle)) {
      continue;
    }
    // skip "said he said" dialogue tags? still interesting
    pushHit(hits, {
      line,
      lineNo,
      category: 'dup-echo',
      rule: 'word-X-word-echo',
      match: m[0],
      index: m.index,
      note: ABA_OK_MIDDLE.has(middle) ? 'middle is common connector — may be idiom' : undefined,
    });
  }
}

function detectPunctuationGlitches(line, lineNo, hits) {
  const patterns = [
    [/,(\s*,)+/g, 'double-comma'],
    [/\.\s*\./g, 'double-period'],
    [/!\s*!/g, 'double-bang'],
    [/\?\s*\?/g, 'double-question'],
    [/\s+([,.!?;:])/g, 'space-before-punct'],
    [/([({[])\s+/g, 'space-after-open-bracket'],
    // missing space after sentence punct before capital (not initials like U.S.)
    [/([a-z])([.!?])([A-Z])/g, 'missing-space-after-sentence'],
    [/\s{2,}/g, 'multi-space'],
    [/\b(the|a|an|and|or|of|to|for|with|in|on|at|by)\s*[.!?]/gi, 'orphan-function-word-before-end'],
    [/\b(the the|a a|an an|and and|or or|of of|to to|for for|with with|in in|on on|at at|by by)\b/gi, 'function-word-double'],
    [/\b(a the|the a|an the|the an)\b/gi, 'article-clash'],
    [/,\s*\./g, 'comma-period'],
    [/\.\s*,/g, 'period-comma'],
    [/;\s*;/g, 'double-semicolon'],
    [/:\s*:/g, 'double-colon'],
    [/\b(he he|she she|it it|we we|they they|i i)\b/gi, 'pronoun-double'],
  ];
  for (const [re, rule] of patterns) {
    re.lastIndex = 0;
    let m;
    const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    while ((m = r.exec(line)) !== null) {
      // multi-space: skip pure indent-like if whole line is short title? still flag
      if (rule === 'space-before-punct' && m[1] === '.' && /\d\s+\.$/.test(line.slice(Math.max(0, m.index - 2), m.index + 2))) {
        continue; // "3 ." rare
      }
      pushHit(hits, {
        line,
        lineNo,
        category: 'broken-grammar',
        rule,
        match: m[0],
        index: m.index,
      });
    }
  }
}

function detectOrphanFragments(line, lineNo, hits) {
  const t = line.trim();
  // skip known structural headings
  if (/^(PROLOGUE|EPILOGUE|AFTERWORD|INTERLUDE|PART\s+[A-Z0-9]+|Chapter\s+[A-Za-z0-9-]+|Contents|Dedication|Acknowledgments?)$/i.test(t)) {
    return;
  }
  // very short non-dialogue, non-heading line that looks like leftover
  const words = t.match(WORD) || [];
  if (words.length > 0 && words.length <= 3 && !/[.!?…"'’”]$/.test(t) && !/^["'“‘]/.test(t)) {
    // allow names, single-word scene beats that are intentional (rare)
    if (!/^[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)?$/.test(t)) {
      pushHit(hits, {
        line,
        lineNo,
        category: 'orphan-fragment',
        rule: 'short-unterminated-line',
        match: t,
        index: line.indexOf(t),
        note: `${words.length} word(s), no terminal punct`,
      });
    }
  }
  // sentence-internal orphan: ". And then." is fine; " . And" already caught.
  // Line that is only a dangling clause starting with lowercase mid-thought
  if (/^[a-z]/.test(t) && words.length >= 2 && words.length <= 12) {
    pushHit(hits, {
      line,
      lineNo,
      category: 'orphan-fragment',
      rule: 'lowercase-start',
      match: t.slice(0, Math.min(40, t.length)),
      index: 0,
      note: 'paragraph starts lowercase',
    });
  }
  // hanging edit: ends with connector
  if (/\b(and|or|but|the|a|an|to|of|with|for|that|which|who)\s*$/i.test(t) && words.length >= 4) {
    pushHit(hits, {
      line,
      lineNo,
      category: 'orphan-fragment',
      rule: 'ends-with-connector',
      match: t.slice(-30),
      index: Math.max(0, line.length - 30),
      note: 'line ends on function word',
    });
  }
}

function detectMetaPaste(line, lineNo, hits) {
  const patterns = [
    [/\b(TODO|FIXME|XXX|TBD|PLACEHOLDER|INSERT HERE|lorem ipsum)\b/i, 'todo-marker'],
    [/\b(IMAGE\s*PROMPT|PROMPT\s*:|CAPTION\s*:|ALT\s*TEXT\s*:|SCENE\s*NOTE\s*:|AUTHOR\s*NOTE\s*:|ED\.?\s*NOTE\s*:)\b/i, 'meta-label'],
    [/\b(wide shot|close-?up|medium shot|establishing shot|camera pans|cut to:|fade in:|fade out:)\b/i, 'screenplay-direction'],
    [/\[\[.+?\]\]|\{\{.+?\}\}/g, 'template-brackets'],
    [/^#+\s+\w/m, 'markdown-heading'],
    [/`{3,}/g, 'code-fence'],
    [/<\/?[a-z][a-z0-9]*\b[^>]*>/i, 'html-tag'],
    [/\b(generate an image|in the style of|as an AI|chatgpt|claude|gpt-4)\b/i, 'ai-prompt-residue'],
    [/\b(chapter summary|beat sheet|outline:|revision note)\b/i, 'outline-residue'],
    [/\[[A-Z][A-Z0-9_ -]{2,}\]/g, 'bracket-allcaps-tag'], // [NOTE], [CUT]
  ];
  for (const [re, rule] of patterns) {
    const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    let m;
    while ((m = r.exec(line)) !== null) {
      pushHit(hits, {
        line,
        lineNo,
        category: 'meta-paste',
        rule,
        match: m[0],
        index: m.index,
      });
    }
  }
}

function detectQuoteDashInconsistency(line, lineNo, hits) {
  // Straight apostrophe/quote chars (ASCII) vs curly
  const straightDouble = [...line].filter((c) => c === '"').length;
  const curlyDouble = [...line].filter((c) => c === '“' || c === '”').length;
  const straightSingle = [...line].filter((c) => c === "'").length;
  const curlySingle = [...line].filter((c) => c === '‘' || c === '’').length;

  if (straightDouble > 0) {
    const idx = line.indexOf('"');
    pushHit(hits, {
      line,
      lineNo,
      category: 'typography',
      rule: 'straight-double-quote',
      match: '"',
      index: idx,
      note: curlyDouble > 0 ? 'mixed with curly doubles in same line' : `${straightDouble} straight double(s)`,
    });
  }
  if (straightSingle > 0) {
    const idx = line.indexOf("'");
    pushHit(hits, {
      line,
      lineNo,
      category: 'typography',
      rule: 'straight-single-quote',
      match: "'",
      index: idx,
      note: curlySingle > 0
        ? `mixed; ${straightSingle} straight, ${curlySingle} curly`
        : `${straightSingle} straight single(s)/apostrophe(s)`,
    });
  }

  // Dash variants
  if (line.includes('--')) {
    const idx = line.indexOf('--');
    pushHit(hits, {
      line,
      lineNo,
      category: 'typography',
      rule: 'double-hyphen-dash',
      match: '--',
      index: idx,
      note: 'ASCII -- instead of em dash',
    });
  }
  // spaced hyphen as em-dash surrogate: " word - word "
  const spacedHyphen = /[A-Za-z0-9”’"']\s+-\s+[A-Za-z0-9“‘"']/g;
  let m;
  while ((m = spacedHyphen.exec(line)) !== null) {
    pushHit(hits, {
      line,
      lineNo,
      category: 'typography',
      rule: 'spaced-hyphen-as-dash',
      match: m[0],
      index: m.index,
      note: 'space-hyphen-space (often should be em dash)',
    });
  }
  // mixed dash types in one line
  const hasEm = line.includes('—');
  const hasEn = line.includes('–');
  const hasSpacedHyphen = /\s-\s/.test(line);
  if ([hasEm, hasEn, hasSpacedHyphen, line.includes('--')].filter(Boolean).length >= 2) {
    const idx = Math.max(line.indexOf('—'), line.indexOf('–'), line.indexOf('--'), line.search(/\s-\s/));
    pushHit(hits, {
      line,
      lineNo,
      category: 'typography',
      rule: 'mixed-dash-styles',
      match: line.slice(Math.max(0, idx), Math.max(0, idx) + 3),
      index: Math.max(0, idx),
      note: `em=${hasEm} en=${hasEn} spacedHyphen=${hasSpacedHyphen} ascii--=${line.includes('--')}`,
    });
  }
}

function detectTenseMix(line, lineNo, hits) {
  // Mechanical: dense mix of past-narrative auxiliaries and present-narrative auxiliaries
  // in the same paragraph, excluding dialogue-heavy lines (high quote density).
  const quoteChars = (line.match(/[“”"‘’']/g) || []).length;
  if (quoteChars >= 4) return; // likely dialogue; skip

  // Strip quoted spans roughly
  const narrative = line
    .replace(/[“"][^”"]*[”"]/g, ' ')
    .replace(/[‘'][^’']*[’']/g, ' ');

  const past = (narrative.match(/\b(was|were|had|did|would|could|might|said|asked|looked|turned|walked|went|came|took|felt|knew|thought|saw|heard|seemed|began|started|stopped|moved|stood|sat|ran|left|kept|made|gave|got|found|told|tried|wanted|needed|watched|opened|closed|smiled|nodded|shook|reached|pulled|pushed|held|followed|waited|stared|glanced|whispered|muttered|answered|replied)\b/gi) || []).length;
  // past-tense -ed verbs (rough): 4+ letter words ending in ed, not adjectives list
  const pastEd = (narrative.match(/\b[A-Za-z]{3,}ed\b/g) || []).length;
  const pastTotal = past + Math.min(pastEd, 8);

  const present = (narrative.match(/\b(is|are|am|has|does|says|asks|looks|turns|walks|goes|comes|takes|feels|knows|thinks|sees|hears|seems|begins|starts|stops|moves|stands|sits|runs|leaves|keeps|makes|gives|gets|finds|tells|tries|wants|needs|watches|opens|closes|smiles|nods|shakes|reaches|pulls|pushes|holds|follows|waits|stares|glances|whispers|mutters|answers|replies)\b/gi) || []).length;
  // present 3sg -s is too noisy; skip

  if (pastTotal >= 3 && present >= 3) {
    // find first present marker for context anchor
    const m = narrative.match(/\b(is|are|am|has|does|says|looks|turns|walks|goes|comes|takes|feels|knows|thinks|sees|hears|seems)\b/i);
    const idx = m ? line.toLowerCase().indexOf(m[0].toLowerCase()) : 0;
    pushHit(hits, {
      line,
      lineNo,
      category: 'tense-mix',
      rule: 'past-present-density',
      match: m ? m[0] : 'tense-mix',
      index: Math.max(0, idx),
      note: `past≈${pastTotal}, present≈${present} (narrative strip; dialogue-heavy skipped)`,
    });
  }
}

function detectBrokenPhrases(line, lineNo, hits) {
  // Partial-edit / stitch patterns
  const patterns = [
    [/\b(\w+)\s+\1\s+\1\b/gi, 'triple-word'],
    [/\bwas\s+\w+\s+was\b/gi, 'was-X-was'],
    [/\bis\s+\w+\s+is\b/gi, 'is-X-is'],
    [/\bwere\s+\w+\s+were\b/gi, 'were-X-were'],
    [/\bhad\s+\w+\s+had\b/gi, 'had-X-had'], // may FP "had never had"
    [/\bthe\s+\w+\s+the\s+\1\b/gi, 'the-X-the-X'], // unlikely
    [/\b(he|she|they|I|we)\s+(he|she|they|I|we)\b/g, 'stacked-pronoun-subject'],
    // dangling quote
    [/(?:^|[\s])["“][^"”]*$/g, 'unclosed-double-quote'],
    // word cut off with hyphen at end of line (not em)
    [/[A-Za-z]-\s*$/g, 'hyphen-line-break-residue'],
  ];
  for (const [re, rule] of patterns) {
    const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    let m;
    while ((m = r.exec(line)) !== null) {
      if (rule === 'had-X-had') {
        const mid = m[0].split(/\s+/)[1]?.toLowerCase();
        if (['never', 'not', 'always', 'already', 'just', 'even', 'still', 'once', 'also', 'really', 'only'].includes(mid)) continue;
      }
      if (rule === 'unclosed-double-quote') {
        // count balance of doubles
        const opens = (line.match(/[“"]/g) || []).length;
        const closes = (line.match(/[”"]/g) || []).length;
        // for curly, open and close differ; for straight, even count is balanced
        if (line.includes('“') || line.includes('”')) {
          if ((line.match(/“/g) || []).length === (line.match(/”/g) || []).length) continue;
        } else if (opens % 2 === 0) continue;
      }
      pushHit(hits, {
        line,
        lineNo,
        category: rule.startsWith('was') || rule.startsWith('is') || rule.startsWith('were') || rule.startsWith('had') || rule === 'triple-word' || rule === 'stacked-pronoun-subject'
          ? 'dup-echo'
          : 'broken-grammar',
        rule,
        match: m[0],
        index: m.index,
      });
    }
  }
}

// ── main ────────────────────────────────────────────────────────────────────

const lines = await loadLines();
stderr.write(`Scanning ${lines.length} paragraphs…\n`);

const hits = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const lineNo = i + 1;
  detectDupAdjacent(line, lineNo, hits);
  detectAbaEcho(line, lineNo, hits);
  detectBrokenPhrases(line, lineNo, hits);
  detectPunctuationGlitches(line, lineNo, hits);
  detectOrphanFragments(line, lineNo, hits);
  detectMetaPaste(line, lineNo, hits);
  detectQuoteDashInconsistency(line, lineNo, hits);
  detectTenseMix(line, lineNo, hits);
}

// Deduplicate identical line+rule+match+index
const seen = new Set();
const deduped = [];
for (const h of hits) {
  const k = `${h.line}|${h.rule}|${h.match}|${h.index ?? h.context}`;
  if (seen.has(k)) continue;
  seen.add(k);
  deduped.push(h);
}
deduped.sort((a, b) => a.line - b.line || a.category.localeCompare(b.category) || a.rule.localeCompare(b.rule));

const filtered = categoryFilter
  ? deduped.filter((h) => h.category === categoryFilter || h.rule === categoryFilter)
  : deduped;

// Summary counts
const byCat = {};
const byRule = {};
for (const h of filtered) {
  byCat[h.category] = (byCat[h.category] || 0) + 1;
  byRule[h.rule] = (byRule[h.rule] || 0) + 1;
}

const report = {
  source: args.includes('--from-drive') ? 'drive' : 'epub-or-text',
  paragraphs: lines.length,
  hitCount: filtered.length,
  byCategory: byCat,
  byRule,
  hits: filtered,
};

const defaultOut = join(ROOT, 'tmp/revision-artifact-hits.json');
const dest = outPath || defaultOut;
mkdirSync(dirname(dest), { recursive: true });
writeFileSync(dest, JSON.stringify(report, null, 2));
stderr.write(`Wrote ${filtered.length} hits → ${dest}\n`);

// Human-readable list to stdout (compact; no full manuscript)
if (wantJson) {
  stdout.write(JSON.stringify(report, null, 2) + '\n');
} else {
  stdout.write(`# Revision artifact hit list\n`);
  stdout.write(`# paragraphs=${lines.length}  hits=${filtered.length}\n`);
  stdout.write(`# by category: ${JSON.stringify(byCat)}\n\n`);
  let lastCat = '';
  for (const h of filtered) {
    if (h.category !== lastCat) {
      stdout.write(`\n## ${h.category}\n`);
      lastCat = h.category;
    }
    const note = h.note ? `  (${h.note})` : '';
    stdout.write(`L${h.line}\t[${h.rule}]\t${h.context}${note}\n`);
  }
  // also write compact text next to json
  const txtDest = dest.replace(/\.json$/, '.txt');
  let body = `# Revision artifact hit list\n# paragraphs=${lines.length}  hits=${filtered.length}\n# by category: ${JSON.stringify(byCat)}\n`;
  lastCat = '';
  for (const h of filtered) {
    if (h.category !== lastCat) {
      body += `\n## ${h.category}\n`;
      lastCat = h.category;
    }
    const note = h.note ? `  (${h.note})` : '';
    body += `L${h.line}\t[${h.rule}]\t${h.context}${note}\n`;
  }
  writeFileSync(txtDest, body);
  stderr.write(`Also wrote ${txtDest}\n`);
}
