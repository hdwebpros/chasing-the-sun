// Build the production epub from the FINAL .docx via LibreOffice headless.
//
// Pipeline:
//   1. soffice --headless --convert-to epub on the source .docx (unless --skip-convert)
//   2. Read LibreOffice's two monolithic section files
//   3. Strip @font-face junk + concat body content
//   4. Split on chapter / part / interlude / prologue / epilogue boundaries
//   5. Convert heading <span> classes into proper <h1>/<h2> tags
//   6. Rewrite image paths from ../images/ → images/
//   7. Emit GoogleDoc/section-NN.xhtml + nav.xhtml + cover.xhtml + package.opf
//   8. Carry over the existing public/cover.jpg as the cover image
//
// LibreOffice CSS class meanings (verified by reading stylesheet.css):
//   .span0 = 41pt Garamond            → title-page "CHASING THE SUN"
//   .span1 = 14pt Garamond            → "A Novel" / "by Ryan Boog"
//   .span2 = 12pt Garamond            → body
//   .span3 = 18pt bold Garamond       → PART/PROLOGUE/EPILOGUE
//   .span4 = 15pt italic Garamond     → subtitle (under PART/PROLOGUE)
//   .span5 = 12pt #666 Garamond       → date / location secondary line
//   .span6 = 14pt bold Garamond       → Chapter heading
//   .span7 = 16pt italic Garamond     → Chapter italic subtitle
//   .span9 = 16pt bold Garamond       → INTERLUDE (and some Chapter headings in Part 2)

import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync, copyFileSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const DOCX_PATH = process.env.DOCX || '/home/ryan/Downloads/CHASING_THE_SUN_final.docx';
const OUT_EPUB = join(ROOT, 'public', 'chasing-the-sun.epub');
const COVER_JPG = join(ROOT, 'public', 'cover.jpg');

const TMP = join(ROOT, '.epub-build-final');
const SOFFICE_OUT = join(TMP, 'soffice');
const SOFFICE_EPUB = join(SOFFICE_OUT, 'CHASING_THE_SUN_final.epub');
const SOFFICE_EXTRACT = join(TMP, 'soffice-extract');
const ASSEMBLE = join(TMP, 'assemble');
const CONTENT_DIR = join(ASSEMBLE, 'GoogleDoc');

execSync(`rm -rf "${TMP}"`);
mkdirSync(SOFFICE_OUT, { recursive: true });
mkdirSync(SOFFICE_EXTRACT, { recursive: true });
mkdirSync(CONTENT_DIR, { recursive: true });
mkdirSync(join(CONTENT_DIR, 'images'), { recursive: true });

// 1) Convert docx → epub via LibreOffice.
console.log(`Converting: ${DOCX_PATH}`);
execSync(
  `soffice --headless --convert-to epub --outdir "${SOFFICE_OUT}" "${DOCX_PATH}"`,
  { stdio: 'inherit' },
);

// 2) Extract that epub.
execSync(`unzip -o "${SOFFICE_EPUB}" -d "${SOFFICE_EXTRACT}"`, { stdio: 'pipe' });

// 3) Read sections + images.
const srcSectionsDir = join(SOFFICE_EXTRACT, 'OEBPS', 'sections');
const srcImagesDir = join(SOFFICE_EXTRACT, 'OEBPS', 'images');

const allBody = [];
for (const file of ['section0001.xhtml', 'section0002.xhtml']) {
  const html = readFileSync(join(srcSectionsDir, file), 'utf-8');
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/);
  if (!m) throw new Error(`No <body> in ${file}`);
  allBody.push(m[1]);
}
let body = allBody.join('\n');

// 4) Rewrite image paths: ../images/ → images/  (also drop the alt="OEBPS/..." prefix)
body = body.replace(/src="\.\.\/images\//g, 'src="images/');
body = body.replace(/alt="OEBPS\/images\/([^"]+)"/g, 'alt="$1"');

// 5) Copy images into our build.
const imageFiles = execSync(`ls "${srcImagesDir}"`).toString().trim().split('\n').filter(Boolean);
for (const img of imageFiles) {
  cpSync(join(srcImagesDir, img), join(CONTENT_DIR, 'images', img));
}
// Cover from existing public/cover.jpg
if (existsSync(COVER_JPG)) {
  cpSync(COVER_JPG, join(CONTENT_DIR, 'images', 'cover.jpg'));
} else {
  console.warn('WARNING: public/cover.jpg not found — cover will be missing');
}

// 6) Find heading boundaries and split.
//
// Each heading span is wrapped in a paragraph. To split cleanly on the *paragraph*
// boundary we walk forward from each heading-span match and snap to the enclosing <p>.
//
// Heading classification:
//   span3 → PART X / PROLOGUE / EPILOGUE
//   span6 → Chapter X
//   span9 → INTERLUDE (or Chapter X in Part 2 — text decides)

const HEADING_RE = /<span class="(span3|span6|span9)">(PART\s+[A-Z]+|PROLOGUE|EPILOGUE|INTERLUDE|Chapter\s+[A-Za-z-]+)<\/span>/g;

// Find paragraph that contains a given character offset in `body`.
function findEnclosingParagraph(body, pos) {
  // Find the most recent <p ...> open tag at or before pos.
  const before = body.lastIndexOf('<p ', pos);
  if (before === -1) return null;
  // The paragraph must actually contain pos (no </p> between `before` and pos).
  const closeBetween = body.indexOf('</p>', before);
  if (closeBetween === -1 || closeBetween < pos) return null;
  return { start: before, end: closeBetween + '</p>'.length };
}

const cuts = []; // { paraStart, paraEnd, kind, title }
{
  let m;
  HEADING_RE.lastIndex = 0;
  while ((m = HEADING_RE.exec(body)) !== null) {
    const spanClass = m[1];
    const text = m[2];
    const para = findEnclosingParagraph(body, m.index);
    if (!para) continue;

    let kind;
    if (/^PART\s/.test(text)) kind = 'part';
    else if (text === 'PROLOGUE') kind = 'prologue';
    else if (text === 'EPILOGUE') kind = 'epilogue';
    else if (text === 'INTERLUDE') kind = 'interlude';
    else if (/^Chapter\s/.test(text)) kind = 'chapter';
    else continue;

    cuts.push({ paraStart: para.start, paraEnd: para.end, kind, text, spanClass });
  }
}

// Deduplicate cuts that snap to the same paragraph (defensive).
const uniqueCuts = [];
const seen = new Set();
for (const c of cuts) {
  if (seen.has(c.paraStart)) continue;
  seen.add(c.paraStart);
  uniqueCuts.push(c);
}
console.log(`Found ${uniqueCuts.length} heading cuts`);

// 7) Slice the body. Section 0 = title page (everything before first cut).
const sections = [];
const firstCut = uniqueCuts[0];
const titleHtml = body.substring(0, firstCut.paraStart).trim();
if (titleHtml) {
  sections.push({ kind: 'title', text: 'CHASING THE SUN', html: titleHtml });
}

for (let i = 0; i < uniqueCuts.length; i++) {
  const cur = uniqueCuts[i];
  const next = uniqueCuts[i + 1];
  const end = next ? next.paraStart : body.length;
  const html = body.substring(cur.paraStart, end).trim();
  sections.push({ kind: cur.kind, text: cur.text, html });
}

// 8) Normalize headings inside each section: convert the heading paragraph to <h1>/<h2>,
//    promote the immediately-following italic subtitle paragraph to keep the styling clean.
//
// Two source patterns:
//   (a) Heading alone: <p ...><span class="span6">Chapter X</span></p>
//   (b) Heading + subtitle in one <p>, separated by <br/>:
//       <p ...><span class="span6">Chapter X</span><span class="span6"><br/></span>
//          <span class="span11">The subtitle</span><span class="span11"><br/></span></p>
//   The combined form appears for chapters 7 and 10-17.
function normalizeSection(section) {
  let html = section.html;

  // (b) Combined heading+subtitle — split into <h2> + subtitle <p>.
  // Match: opening <p>, heading span, optional <br/> spans, subtitle span (italic), optional trailing junk, </p>.
  html = html.replace(
    /<p class="[^"]*">\s*<span class="(span3|span6|span9)">(PART\s+[A-Z]+|PROLOGUE|EPILOGUE|INTERLUDE|Chapter\s+[A-Za-z-]+)<\/span>(?:\s*<span[^>]*>\s*<br\/>\s*<\/span>)?\s*<span class="(span4|span7|span11|span13)">([^<]+)<\/span>(?:\s*<span[^>]*>\s*<br\/>\s*<\/span>)?\s*<\/p>/,
    (_m, hClass, hText, sClass, sText) => {
      const tag = hClass === 'span3' ? 'h1' : 'h2';
      const cls = hClass === 'span3' ? 'cts-h1' : 'cts-h2';
      return `<${tag} class="${cls}"><span class="${hClass}">${hText}</span></${tag}>\n    <p class="cts-subtitle"><span class="${sClass}">${sText}</span></p>`;
    },
  );

  // (a) Heading alone — straightforward <h1>/<h2> wrap.
  html = html.replace(
    /<p class="[^"]*">\s*<span class="span3">(PART\s+[A-Z]+|PROLOGUE|EPILOGUE)<\/span>\s*<\/p>/,
    '<h1 class="cts-h1"><span class="span3">$1</span></h1>',
  );
  html = html.replace(
    /<p class="[^"]*">\s*<span class="span6">(Chapter\s+[A-Za-z-]+)<\/span>\s*<\/p>/,
    '<h2 class="cts-h2"><span class="span6">$1</span></h2>',
  );
  html = html.replace(
    /<p class="[^"]*">\s*<span class="span9">(Chapter\s+[A-Za-z-]+|INTERLUDE)<\/span>\s*<\/p>/,
    '<h2 class="cts-h2"><span class="span9">$1</span></h2>',
  );

  return html;
}

// Extract subtitle: italic paragraph (span4 / span7 / span11 / span13) right after the heading.
function extractSubtitle(html) {
  const head = html.substring(0, 2500);
  // Prefer the cts-subtitle paragraph we emit when splitting combined heading+subtitle <p>s.
  const m0 = head.match(/<p class="cts-subtitle"><span[^>]*>([^<]+)<\/span><\/p>/);
  if (m0) return m0[1].trim();

  const m = head.match(/<\/h[12]>\s*(?:<p[^>]*>\s*<\/p>\s*)*<p[^>]*><span class="span(?:4|7|11|13)">([^<]+)<\/span>/);
  if (m) return m[1].trim();

  const m2 = head.match(/<span class="span(?:4|7|11|13)">([^<]+)<\/span>/);
  if (m2) return m2[1].trim();
  return null;
}

// Standardize "Chapter Twenty-Three" → "Chapter 23"
const wordToNum = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20, 'twenty-one': 21, 'twenty-two': 22, 'twenty-three': 23,
  'twenty-four': 24, 'twenty-five': 25, 'twenty-six': 26, 'twenty-seven': 27, 'twenty-eight': 28,
  'twenty-nine': 29, thirty: 30, 'thirty-one': 31, 'thirty-two': 32, 'thirty-three': 33,
  'thirty-four': 34, 'thirty-five': 35, 'thirty-six': 36, 'thirty-seven': 37, 'thirty-eight': 38,
  'thirty-nine': 39,
};
function standardizeTitle(title) {
  const m = title.match(/^Chapter\s+(.+)$/i);
  if (m && wordToNum[m[1].toLowerCase()] !== undefined) {
    return `Chapter ${wordToNum[m[1].toLowerCase()]}`;
  }
  return title;
}

// 9) Build the per-section CSS — start from LibreOffice's stylesheet, drop the giant @font-face block,
//    and add a few of our own rules so headings look right.
const srcCss = readFileSync(join(SOFFICE_EXTRACT, 'OEBPS', 'styles', 'stylesheet.css'), 'utf-8');
const cssNoFonts = srcCss.replace(/@font-face\s*\{[^}]*\}\s*/g, '');
const extraCss = `
/* Heading overrides for proper h1/h2 styling */
.cts-h1 { text-align: center; padding-top: 24pt; padding-bottom: 8pt; page-break-before: always; page-break-after: avoid; }
.cts-h2 { text-align: center; padding-top: 18pt; padding-bottom: 6pt; page-break-after: avoid; }
.cts-h1 .span3 { font-family: 'Garamond'; font-size: 18pt; font-weight: 700; }
.cts-h2 .span6, .cts-h2 .span9 { font-family: 'Garamond'; font-weight: 700; }
.cts-h2 .span6 { font-size: 14pt; }
.cts-h2 .span9 { font-size: 16pt; }
img { max-width: 100%; height: auto; }
body { font-family: 'Garamond', Georgia, serif; }
`;
const fullCss = cssNoFonts + '\n' + extraCss;
writeFileSync(join(CONTENT_DIR, 'stylesheet.css'), fullCss);

// 10) Section template
function makeXhtml(innerHtml, title) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8"/>
    <title>${escapeXml(title)}</title>
    <link href="stylesheet.css" rel="stylesheet" type="text/css"/>
  </head>
  <body class="body0">
    ${innerHtml}
  </body>
</html>`;
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// 11) Emit sections.
const chapters = [];
for (let i = 0; i < sections.length; i++) {
  const s = sections[i];
  const filename = `section-${String(i).padStart(2, '0')}.xhtml`;
  const id = `section-${String(i).padStart(2, '0')}`;

  const normalized = normalizeSection(s);
  const subtitle = extractSubtitle(normalized);
  const cleanTitle = standardizeTitle(s.text);
  const isChapter = /^Chapter\s/.test(cleanTitle);
  const navLabel = isChapter && subtitle ? `${cleanTitle}: ${subtitle}` : cleanTitle;

  writeFileSync(join(CONTENT_DIR, filename), makeXhtml(normalized, navLabel));
  chapters.push({ filename, id, title: navLabel, kind: s.kind });
  console.log(`  ${filename}: "${navLabel}"`);
}

// 12) Cover.
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
writeFileSync(join(CONTENT_DIR, 'cover.xhtml'), coverXhtml);

// 13) Nav (PART → nested chapter list).
function buildNavOl() {
  const lines = [];
  let inPart = false;
  for (const ch of chapters) {
    const isPart = ch.kind === 'part';
    const isTopLevel = ch.kind === 'title' || ch.kind === 'prologue' || ch.kind === 'epilogue';

    if (isPart) {
      if (inPart) {
        lines.push('          </ol>');
        lines.push('        </li>');
      }
      lines.push('        <li>');
      lines.push(`          <a href="${ch.filename}">${escapeXml(ch.title)}</a>`);
      lines.push('          <ol>');
      inPart = true;
    } else if (isTopLevel) {
      if (inPart) {
        lines.push('          </ol>');
        lines.push('        </li>');
        inPart = false;
      }
      lines.push('        <li>');
      lines.push(`          <a href="${ch.filename}">${escapeXml(ch.title)}</a>`);
      lines.push('        </li>');
    } else if (inPart) {
      lines.push('            <li>');
      lines.push(`              <a href="${ch.filename}">${escapeXml(ch.title)}</a>`);
      lines.push('            </li>');
    } else {
      lines.push('        <li>');
      lines.push(`          <a href="${ch.filename}">${escapeXml(ch.title)}</a>`);
      lines.push('        </li>');
    }
  }
  if (inPart) {
    lines.push('          </ol>');
    lines.push('        </li>');
  }
  return lines.join('\n');
}
const navXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en">
  <head>
    <meta charset="utf-8"/>
    <title>Table of Contents</title>
  </head>
  <body>
    <nav epub:type="toc" id="toc">
      <h1>Table of Contents</h1>
      <ol>
${buildNavOl()}
      </ol>
    </nav>
  </body>
</html>`;
writeFileSync(join(CONTENT_DIR, 'nav.xhtml'), navXhtml);

// 14) META-INF/container.xml + mimetype
const metaInf = join(ASSEMBLE, 'META-INF');
mkdirSync(metaInf, { recursive: true });
writeFileSync(join(metaInf, 'container.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="GoogleDoc/package.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);
writeFileSync(join(ASSEMBLE, 'mimetype'), 'application/epub+zip');

// 15) Manifest + spine.
const manifestItems = [
  '    <item href="cover.xhtml" id="cover" media-type="application/xhtml+xml"/>',
  '    <item href="nav.xhtml" id="toc" media-type="application/xhtml+xml" properties="nav"/>',
  '    <item href="stylesheet.css" id="stylesheet" media-type="text/css"/>',
];
const spineItems = ['    <itemref idref="cover" linear="yes"/>'];
for (const ch of chapters) {
  manifestItems.push(`    <item href="${ch.filename}" id="${ch.id}" media-type="application/xhtml+xml"/>`);
  spineItems.push(`    <itemref idref="${ch.id}"/>`);
}
const builtImages = execSync(`ls "${join(CONTENT_DIR, 'images')}"`).toString().trim().split('\n').filter(Boolean);
for (const img of builtImages) {
  const ext = img.split('.').pop().toLowerCase();
  const mediaType = ext === 'png' ? 'image/png' : 'image/jpeg';
  const props = img === 'cover.jpg' ? ' properties="cover-image"' : '';
  manifestItems.push(`    <item href="images/${img}" id="img-${img.replace(/\./g, '-')}" media-type="${mediaType}"${props}/>`);
}

const packageOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">1735777a-0e2b-407e-9f13-19c2131f13ec</dc:identifier>
    <dc:language>en</dc:language>
    <dc:title>Chasing the Sun</dc:title>
    <dc:creator>Ryan Boog</dc:creator>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</meta>
    <meta name="cover" content="img-cover-jpg"/>
  </metadata>
  <manifest>
${manifestItems.join('\n')}
  </manifest>
  <spine>
${spineItems.join('\n')}
  </spine>
</package>`;
writeFileSync(join(CONTENT_DIR, 'package.opf'), packageOpf);

// 16) Repack.
mkdirSync(dirname(OUT_EPUB), { recursive: true });
execSync(`rm -f "${OUT_EPUB}"`);
execSync(`cd "${ASSEMBLE}" && zip -0 -X "${OUT_EPUB}" mimetype`, { stdio: 'pipe' });
execSync(`cd "${ASSEMBLE}" && zip -r -X "${OUT_EPUB}" META-INF GoogleDoc -x mimetype`, { stdio: 'pipe' });

console.log(`\nEPUB: ${OUT_EPUB}`);
console.log(`Sections: ${chapters.length}`);

// Cleanup
execSync(`rm -rf "${TMP}"`);
console.log('Done!');
