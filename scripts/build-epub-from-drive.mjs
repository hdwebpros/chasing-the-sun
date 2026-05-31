#!/usr/bin/env node
// Build the served EPUB directly from the Google Doc — Drive is canonical.
//
//   node scripts/build-epub-from-drive.mjs            # → scratch output
//   node scripts/build-epub-from-drive.mjs --promote  # → served epub
//
// Pipeline:
//   1. Export the Doc as a native EPUB (bin/export-epub.mjs, read-only).
//   2. Unzip; read the monolithic GoogleDoc/<book>.xhtml.
//   3. Split the body on the Doc's explicit page-break markers → one file/chapter.
//   4. Map Google's own nav labels onto those sections by ordered text match
//      (no font-size / class-number guessing — robust across re-exports).
//   5. Regenerate nav.xhtml (Google labels + PART nesting) and package.opf.
//   6. Inject the cover; optimize images with sharp.
//   7. Repack (mimetype stored, rest deflated).
//
// Output defaults to a scratch file so it never clobbers the served epub while
// other work is in flight. Pass --promote to write the real one.
import { execFileSync } from 'node:child_process';
import {
  readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, readdirSync,
} from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const EXPORT_HELPER = join(ROOT, '.claude', 'skills', 'book-edit', 'bin', 'export-epub.mjs');
const COVER_SRC = join(ROOT, 'public', 'cover.png'); // the designed cover the site uses

const PROMOTE = process.argv.includes('--promote');
const OUT_EPUB = PROMOTE
  ? join(ROOT, 'public', 'chasing-the-sun-draft.epub')
  // Scratch build, loadable in the dev app via /read?epub=from-drive
  : join(ROOT, 'public', 'chasing-the-sun-from-drive.epub');

// Stable identifier so reader libraries treat rebuilds as the same book.
const BOOK_UID = '1735777a-0e2b-407e-9f13-19c2131f13ec';
// Max image dimension / JPEG quality for optimization.
const MAX_DIM = 1600;
const JPEG_Q = 82;

const log = (...a) => console.log(...a);

// ---------- 1. export from Drive ----------
const work = join(os.tmpdir(), `cts-from-drive-${process.pid}`);
rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });
const exportedEpub = join(work, 'native.epub');
execFileSync('node', [EXPORT_HELPER, exportedEpub], { stdio: ['ignore', 'ignore', 'inherit'] });

// ---------- 2. unzip ----------
const src = join(work, 'src');
mkdirSync(src, { recursive: true });
execFileSync('unzip', ['-q', exportedEpub, '-d', src]);

const contentDir = join(src, 'GoogleDoc');
const bookFile = readdirSync(contentDir).find(
  (f) => f.endsWith('.xhtml') && f !== 'nav.xhtml' && !/^section-/.test(f),
);
if (!bookFile) throw new Error('Could not find the monolithic book xhtml in the export.');
const monolith = readFileSync(join(contentDir, bookFile), 'utf8');
log(`Source: ${bookFile}`);

// ---------- 3. extract head/body ----------
const head = monolith.match(/<head>[\s\S]*?<\/head>/)[0];
const bodyAttrs = (monolith.match(/<body([^>]*)>/) || ['', ''])[1];
const body = monolith.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

// ---------- 4. parse Google's nav (authoritative chapter list + nesting) ----------
const navSrc = readFileSync(join(contentDir, 'nav.xhtml'), 'utf8');
const navEntries = [];
{
  const aRe = /<a\b[^>]*>([\s\S]*?)<\/a>/g;
  let m;
  while ((m = aRe.exec(navSrc)) !== null) {
    const label = stripTags(m[1]).replace(/\s+/g, ' ').trim();
    if (!label || label === basename(bookFile, '.xhtml')) continue; // auto "front" entry
    navEntries.push({ label, matchKey: matchKeyFor(label) });
  }
}
log(`Nav lists ${navEntries.length} chapter/part entries.`);

// ---------- 4b. locate each heading in the body, split there ----------
// Each nav label sits at the start of its own <h*> block. Find that block, in
// document order, and cut the body there. (Headings must be real Heading-1/2
// paragraph styles in the Doc for Google to list them — that's enforced at the
// source, not worked around here.)
const cuts = [];
let from = 0;
for (const e of navEntries) {
  const start = findHeadingStart(body, e.matchKey, from);
  if (start === -1) { e.unmapped = true; continue; }
  cuts.push({ label: e.label, start });
  from = start + e.matchKey.length;
}

const sections = [];
if (!cuts.length) {
  sections.push({ label: null, html: body });
} else {
  if (cuts[0].start > 0) sections.push({ label: null, html: body.slice(0, cuts[0].start) });
  for (let i = 0; i < cuts.length; i++) {
    const end = i + 1 < cuts.length ? cuts[i + 1].start : body.length;
    sections.push({ label: cuts[i].label, html: body.slice(cuts[i].start, end) });
  }
}
const unmapped = navEntries.filter((e) => e.unmapped);

// ---------- 5. write section files ----------
const wrap = (frag) =>
  `<?xml version="1.0" encoding="UTF-8"?><html xmlns="http://www.w3.org/1999/xhtml">
  ${head}
  <body${bodyAttrs}>
    ${frag}
  </body>
</html>`;

const chapters = [];
for (let i = 0; i < sections.length; i++) {
  const filename = `section-${String(i).padStart(2, '0')}.xhtml`;
  const id = `section-${String(i).padStart(2, '0')}`;
  writeFileSync(join(contentDir, filename), wrap(sections[i].html.trim()));
  chapters.push({ filename, id, label: sections[i].label });
}
// Drop the original monolith.
rmSync(join(contentDir, bookFile), { force: true });

// Report the mapping so it can be eyeballed.
log(`\nSplit into ${chapters.length} section files:`);
for (const ch of chapters) {
  log(`  ${ch.filename}  ${ch.label ?? '(front matter)'}`);
}
if (unmapped.length) {
  log(`\n⚠  ${unmapped.length} nav label(s) not found in the body:`);
  for (const u of unmapped) log(`     - ${u.label}`);
  log('   (Heading wording differs from the nav, or the chapter is absent.)');
}

// ---------- 5b. regenerate nav.xhtml (reuse Google labels + nesting) ----------
const navOl = buildNavOl(chapters);
const navXhtml = `<?xml version="1.0" encoding="UTF-8"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en">
  <head>
    <meta charset="utf-8"/>
  </head>
  <body>
    <nav epub:type="toc" id="toc">
      <ol>
${navOl}
      </ol>
    </nav>
  </body>
</html>`;
writeFileSync(join(contentDir, 'nav.xhtml'), navXhtml);

// ---------- 6. cover ----------
const imagesDir = join(contentDir, 'images');
mkdirSync(imagesDir, { recursive: true });
if (!existsSync(COVER_SRC)) throw new Error(`Cover image not found at ${COVER_SRC}`);
await sharp(COVER_SRC)
  .resize({ width: 1200, height: 1800, fit: 'inside', withoutEnlargement: true })
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(join(imagesDir, 'cover.jpg'));
const coverXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>Cover</title>
    <style type="text/css">
      body { margin: 0; padding: 0; text-align: center; }
      div.cover { width: 100%; height: 100%; text-align: center; }
      img { max-width: 100%; max-height: 100%; }
    </style>
  </head>
  <body>
    <div class="cover">
      <img src="images/cover.jpg" alt="Chasing the Sun by Ryan Boog"/>
    </div>
  </body>
</html>`;
writeFileSync(join(contentDir, 'cover.xhtml'), coverXhtml);

// ---------- 6b. optimize images ----------
let saved = 0;
for (const img of readdirSync(imagesDir)) {
  if (img === 'cover.jpg') continue;
  const p = join(imagesDir, img);
  const before = readFileSync(p).length;
  const out = await sharp(p)
    .rotate()
    .resize({ width: MAX_DIM, height: MAX_DIM, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: JPEG_Q, mozjpeg: true })
    .toBuffer();
  // Always emit .jpg (covers PNG → JPEG conversion); rename in xhtml refs below.
  const jpgName = img.replace(/\.[a-z0-9]+$/i, '.jpg');
  if (jpgName !== img) rmSync(p, { force: true });
  writeFileSync(join(imagesDir, jpgName), out);
  saved += before - out.length;
  if (jpgName !== img) {
    // Update references in the section files (e.g. image10.png → image10.jpg).
    for (const ch of chapters) {
      const fp = join(contentDir, ch.filename);
      const c = readFileSync(fp, 'utf8');
      if (c.includes(img)) writeFileSync(fp, c.split(img).join(jpgName));
    }
  }
}
log(`\nImage optimization saved ${(saved / 1024 / 1024).toFixed(2)} MB.`);

// ---------- 7. package.opf ----------
const imageFiles = readdirSync(imagesDir);
const manifest = [
  '    <item href="cover.xhtml" id="cover" media-type="application/xhtml+xml"/>',
  '    <item href="nav.xhtml" id="toc" media-type="application/xhtml+xml" properties="nav"/>',
];
const spine = ['    <itemref idref="cover" linear="yes"/>'];
for (const ch of chapters) {
  manifest.push(`    <item href="${ch.filename}" id="${ch.id}" media-type="application/xhtml+xml"/>`);
  spine.push(`    <itemref idref="${ch.id}"/>`);
}
for (const img of imageFiles) {
  const ext = img.split('.').pop().toLowerCase();
  const mt = ext === 'png' ? 'image/png' : 'image/jpeg';
  const props = img === 'cover.jpg' ? ' properties="cover-image"' : '';
  manifest.push(`    <item href="images/${img}" id="${img}" media-type="${mt}"${props}/>`);
}
const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">${BOOK_UID}</dc:identifier>
    <dc:language>en</dc:language>
    <dc:title>Chasing the Sun</dc:title>
    <dc:creator>Ryan Boog</dc:creator>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</meta>
    <meta name="cover" content="cover-image"/>
  </metadata>
  <manifest>
${manifest.join('\n')}
  </manifest>
  <spine>
${spine.join('\n')}
  </spine>
</package>`;
writeFileSync(join(contentDir, 'package.opf'), opf);

// ---------- 7b. repack ----------
mkdirSync(dirname(OUT_EPUB), { recursive: true });
rmSync(OUT_EPUB, { force: true });
execFileSync('zip', ['-X0', OUT_EPUB, 'mimetype'], { cwd: src, stdio: 'ignore' });
execFileSync('zip', ['-Xr9', OUT_EPUB, 'META-INF', 'GoogleDoc', '-x', 'mimetype'], {
  cwd: src, stdio: 'ignore',
});

const finalSize = readFileSync(OUT_EPUB).length;
log(`\n✔ ${PROMOTE ? 'PROMOTED' : 'Scratch build'}: ${OUT_EPUB}`);
log(`  ${chapters.length} sections, ${imageFiles.length} images, ${(finalSize / 1024 / 1024).toFixed(2)} MB`);
if (!PROMOTE) log('  (run with --promote to overwrite the served epub)');

rmSync(work, { recursive: true, force: true });

// ===========================================================================

function stripTags(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ');
}

// The portion of a nav label that should appear verbatim at the start of the
// chapter's text. "Chapter Seven The Corner…" → "Chapter Seven"; "PART ONE" →
// "PART ONE"; "PROLOGUE" → "PROLOGUE".
function matchKeyFor(label) {
  const toks = label.split(/\s+/);
  if (/^(Chapter|PART)$/i.test(toks[0]) && toks.length >= 2) {
    return `${toks[0]} ${toks[1]}`;
  }
  return label;
}

// Offset where the block element (<p>/<h1..6>) containing `key` begins, but only
// if `key` is the first text in that block (i.e. a heading line, not a prose
// mention). Scans occurrences in order from `from`. Returns -1 if none qualify.
function findHeadingStart(body, key, from) {
  let idx = from;
  for (;;) {
    const hit = body.indexOf(key, idx);
    if (hit === -1) return -1;
    const blockStart = enclosingBlockStart(body, hit);
    if (blockStart !== -1 && stripTags(body.slice(blockStart, hit)).trim() === '') {
      return blockStart;
    }
    idx = hit + key.length;
  }
}

function enclosingBlockStart(body, pos) {
  const re = /<(?:p|h[1-6])\b/gi;
  let last = -1;
  let m;
  while ((m = re.exec(body)) !== null) {
    if (m.index >= pos) break;
    last = m.index;
  }
  return last;
}

function buildNavOl(chapters) {
  const lines = [];
  let inPart = false;
  for (const ch of chapters) {
    if (!ch.label) continue; // continuation / front matter: not its own nav entry
    const title = ch.label;
    const isPart = /^PART\s/i.test(title);
    const isTop = /^(PROLOGUE|EPILOGUE|CHASING THE SUN)$/i.test(title);
    if (isPart) {
      if (inPart) { lines.push('          </ol>'); lines.push('        </li>'); }
      lines.push('        <li>');
      lines.push(`          <a href="${ch.filename}">${esc(title)}</a>`);
      lines.push('          <ol>');
      inPart = true;
    } else if (isTop) {
      if (inPart) { lines.push('          </ol>'); lines.push('        </li>'); inPart = false; }
      lines.push('        <li>');
      lines.push(`          <a href="${ch.filename}">${esc(title)}</a>`);
      lines.push('        </li>');
    } else if (inPart) {
      lines.push('            <li>');
      lines.push(`              <a href="${ch.filename}">${esc(title)}</a>`);
      lines.push('            </li>');
    } else {
      lines.push('        <li>');
      lines.push(`          <a href="${ch.filename}">${esc(title)}</a>`);
      lines.push('        </li>');
    }
  }
  if (inPart) { lines.push('          </ol>'); lines.push('        </li>'); }
  return lines.join('\n');
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
