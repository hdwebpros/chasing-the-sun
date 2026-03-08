import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const EPUB_PATH = join(ROOT, 'public', 'chasing-the-sun-draft.epub');
const V2_PATH = join(ROOT, 'public', 'chasing-the-sun-v2.epub');
const WORK_DIR = join(ROOT, '.epub-build-draft');

// Clean and extract draft
execSync(`rm -rf "${WORK_DIR}"`);
mkdirSync(WORK_DIR, { recursive: true });
execSync(`unzip -o "${EPUB_PATH}" -d "${WORK_DIR}"`, { stdio: 'pipe' });

// Extract v2 to get cover image
const V2_WORK = join(ROOT, '.epub-build-v2-tmp');
execSync(`rm -rf "${V2_WORK}"`);
mkdirSync(V2_WORK, { recursive: true });
execSync(`unzip -o "${V2_PATH}" -d "${V2_WORK}"`, { stdio: 'pipe' });

const CONTENT_DIR = join(WORK_DIR, 'GoogleDoc');
const mainXhtml = readFileSync(join(CONTENT_DIR, 'CHASING_THE_SUN_v2__6_.docx.xhtml'), 'utf-8');

// Copy cover.jpg from v2 (draft doesn't have one)
const v2ImagesDir = join(V2_WORK, 'GoogleDoc', 'images');
const draftImagesDir = join(CONTENT_DIR, 'images');
if (existsSync(join(v2ImagesDir, 'cover.jpg'))) {
  cpSync(join(v2ImagesDir, 'cover.jpg'), join(draftImagesDir, 'cover.jpg'));
  console.log('Copied cover.jpg from v2');
}

// Extract <head> and <body> attributes
let headContent = mainXhtml.match(/<head>[\s\S]*?<\/head>/)[0];
// Remove external Google Fonts import (won't work in most epub readers)
headContent = headContent.replace(/@import\s+url\([^)]+\);?/g, '');
// Normalize base fonts to Garamond for consistency with v2
headContent = headContent.replace(/font-family:"Times New Roman"/g, 'font-family:"Garamond"');
// Update title
headContent = headContent.replace(/<title>[^<]*<\/title>/, '<title>Chasing the Sun</title>');

const bodyAttrs = (mainXhtml.match(/<body([^>]*)>/) || ['', ''])[1];
let bodyContent = mainXhtml.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

// Fix page breaks that occur inside <p> tags — move </p> before <hr> so the split is clean
bodyContent = bodyContent.replace(
  /(<\/span>)\s*(<hr\s+style="page-break-before:always[^"]*"\s*\/?>)\s*(<\/p>)/g,
  '$1$3\n$2'
);

// Step 1: Split on <hr> page breaks
const rawSections = bodyContent.split(/<hr\s+style="page-break-before:always[^"]*"\s*\/?>/);

// Step 2: For each section, check if it contains multiple headings that should be
// separate spine items. Split only when there's substantial content before a heading.
function hasSubstantialContent(html) {
  const text = html.replace(/<[^>]*>/g, '').trim();
  return text.length > 20;
}

// Heading patterns that mark the start of a new section
// Draft CSS class mappings:
//   c22 = 16pt bold Garamond (INTERLUDE, some chapter headings)
//   c32 = 14pt bold Garamond (chapter headings)
//   c46 = 18pt bold Garamond (PART, PROLOGUE, EPILOGUE headings)
const headingRe = /<(?:h[12]\s[^>]*>\s*<span[^>]*>(?:Chapter|PART|INTERLUDE|PROLOGUE|EPILOGUE)|p\s[^>]*>\s*<span[^>]*\b(?:c22|c32|c46)\b[^>]*>(?:Chapter|PART|INTERLUDE|PROLOGUE|EPILOGUE))/i;

function splitSection(html) {
  const results = [];
  let remaining = html;

  while (remaining) {
    const firstMatch = remaining.match(headingRe);
    if (!firstMatch) {
      if (remaining.trim()) results.push(remaining.trim());
      break;
    }

    const headingPos = firstMatch.index;
    const before = remaining.substring(0, headingPos);
    const after = remaining.substring(headingPos);

    if (hasSubstantialContent(before)) {
      results.push(before.trim());
      remaining = after;
    } else {
      const afterFirstHeading = after.substring(1);
      const nextMatch = afterFirstHeading.match(headingRe);

      if (!nextMatch) {
        if (remaining.trim()) results.push(remaining.trim());
        break;
      }

      const nextPos = headingPos + 1 + nextMatch.index;
      const chunk = remaining.substring(0, nextPos);
      const rest = remaining.substring(nextPos);

      if (hasSubstantialContent(rest.substring(0, rest.indexOf('</' + (rest.match(/<(\w+)/)?.[1] || 'p')) || 200))) {
        results.push(chunk.trim());
        remaining = rest;
      } else {
        results.push(chunk.trim());
        remaining = rest;
      }
    }
  }

  return results.length > 0 ? results : [html.trim()];
}

const sections = [];
for (const raw of rawSections) {
  const trimmed = raw.trim();
  if (!trimmed) continue;

  const sub = splitSection(trimmed);
  for (const s of sub) {
    if (s) sections.push(s);
  }
}

console.log(`Found ${sections.length} sections after splitting`);

// Extract title from section HTML
function extractTitle(html) {
  const h1 = html.match(/<h1[^>]*>\s*<span[^>]*>(.*?)<\/span>\s*<\/h1>/);
  if (h1) return h1[1].replace(/<[^>]*>/g, '').trim();

  const h2 = html.match(/<h2[^>]*>\s*<span[^>]*>(.*?)<\/span>\s*<\/h2>/);
  if (h2) return h2[1].replace(/<[^>]*>/g, '').trim();

  // Draft heading font classes in <p> tags
  for (const cls of ['c46', 'c22', 'c32']) {
    const m = html.match(new RegExp(`<span[^>]*\\b${cls}\\b[^>]*>(.*?)<\\/span>`));
    if (m) {
      const text = m[1].replace(/<[^>]*>/g, '').trim();
      if (text) return text;
    }
  }

  // Title page: c68 = 41pt Garamond
  const big = html.match(/<span[^>]*\bc68\b[^>]*>(.*?)<\/span>/);
  if (big) return big[1].replace(/<[^>]*>/g, '').trim();

  return null;
}

// Extract the italic subtitle that follows the heading
// Draft italic indicators: c14 (16pt italic), c7 (14pt italic), c40 (font-style:italic)
function extractSubtitle(html) {
  // After h1/h2 heading
  const afterHeading = html.match(/<\/h[12]>[\s\S]*?<p[^>]*>\s*<span[^>]*\b(?:c14|c7|c40)\b[^>]*>(.*?)<\/span>/);
  if (afterHeading) {
    const text = afterHeading[1].replace(/<[^>]*>/g, '').trim();
    if (text) return text;
  }

  // After <p>-wrapped heading (before normalization)
  // Look for heading span (c22/c32/c46) then italic span nearby
  const afterPHeading = html.match(/<span[^>]*\b(?:c22|c32|c46)\b[^>]*>(?:Chapter|INTERLUDE|PART)[^<]*<\/span>[\s\S]*?<span[^>]*\b(?:c14|c7|c40)\b[^>]*>(.*?)<\/span>/i);
  if (afterPHeading) {
    const text = afterPHeading[1].replace(/<[^>]*>/g, '').trim();
    if (text) return text;
  }

  // Fallback: first italic span near the start (c14 or c7)
  const italicSpan = html.match(/<span[^>]*\b(?:c14|c7)\b[^>]*>(.*?)<\/span>/);
  if (italicSpan) {
    const text = italicSpan[1].replace(/<[^>]*>/g, '').trim();
    if (text) return text;
  }

  return null;
}

// Standardize "Chapter Twenty-Three" → "Chapter 23"
const wordToNum = {
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6,
  'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10, 'eleven': 11,
  'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
  'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19,
  'twenty': 20, 'twenty-one': 21, 'twenty-two': 22, 'twenty-three': 23,
  'twenty-four': 24, 'twenty-five': 25, 'twenty-six': 26,
  'twenty-seven': 27, 'twenty-eight': 28, 'twenty-nine': 29,
  'thirty': 30, 'thirty-one': 31, 'thirty-two': 32, 'thirty-three': 33,
  'thirty-four': 34, 'thirty-five': 35, 'thirty-six': 36,
  'thirty-seven': 37, 'thirty-eight': 38, 'thirty-nine': 39,
};

function standardizeTitle(title) {
  const m = title.match(/^Chapter\s+(.+)$/i);
  if (m && wordToNum[m[1].toLowerCase()] !== undefined) {
    return `Chapter ${wordToNum[m[1].toLowerCase()]}`;
  }
  return title;
}

// Normalize headings: convert <p>-wrapped chapter/part/interlude titles to proper <h1>/<h2>
function normalizeHeadings(html) {
  // PART headings in <p> with c46 span → <h1>
  html = html.replace(
    /<p\s+class="[^"]*">\s*<span[^>]*\b(?:c46)\b[^>]*>(PART\s+\w+)<\/span>\s*<\/p>/gi,
    '<h1 class="c52"><span class="c46">$1</span></h1>'
  );

  // INTERLUDE in <p> with c22 span → <h2>
  html = html.replace(
    /<p\s+class="[^"]*">\s*<span[^>]*\b(?:c22)\b[^>]*>(INTERLUDE)<\/span>\s*<\/p>/gi,
    '<h2 class="c48"><span class="c22">$1</span></h2>'
  );

  // Chapter headings in <p> with c22 span → <h2>
  html = html.replace(
    /<p\s+class="[^"]*">\s*<span[^>]*\b(?:c22)\b[^>]*>(Chapter\s+[\w-]+)<\/span>\s*<\/p>/gi,
    '<h2 class="c48"><span class="c22">$1</span></h2>'
  );

  // Chapter headings in <p> with c32 span → <h2>
  html = html.replace(
    /<p\s+class="[^"]*">\s*<span[^>]*\b(?:c32)\b[^>]*>(Chapter\s+[\w-]+)<\/span>\s*<\/p>/gi,
    '<h2 class="c48"><span class="c32">$1</span></h2>'
  );

  return html;
}

function makeXhtml(section) {
  const normalized = normalizeHeadings(section);
  return `<?xml version="1.0" encoding="UTF-8"?><html xmlns="http://www.w3.org/1999/xhtml">
  ${headContent}
  <body${bodyAttrs}>
    ${normalized}
  </body>
</html>`;
}

// Build section files
const chapters = [];
for (let i = 0; i < sections.length; i++) {
  const filename = `section-${String(i).padStart(2, '0')}.xhtml`;
  const rawTitle = extractTitle(sections[i]) || `Section ${i}`;
  const title = standardizeTitle(rawTitle);
  const subtitle = extractSubtitle(sections[i]);

  const isChapter = /^Chapter\s/.test(title);
  const navLabel = (isChapter && subtitle) ? `${title}: ${subtitle}` : title;

  writeFileSync(join(CONTENT_DIR, filename), makeXhtml(sections[i]));
  chapters.push({ filename, title: navLabel, id: `section-${String(i).padStart(2, '0')}` });
  console.log(`  ${filename}: "${navLabel}"`);
}

// Build nav with PART nesting
function buildNavOl(chapters) {
  const lines = [];
  let inPart = false;

  for (const ch of chapters) {
    const { title } = ch;
    const isPart = /^PART\s/.test(title);
    const isTopLevel = /^(PROLOGUE|EPILOGUE|CHASING THE SUN)$/i.test(title);

    if (isPart) {
      if (inPart) {
        lines.push('          </ol>');
        lines.push('        </li>');
      }
      lines.push(`        <li>`);
      lines.push(`          <a href="${ch.filename}">${title}</a>`);
      lines.push('          <ol>');
      inPart = true;
    } else if (isTopLevel) {
      if (inPart) {
        lines.push('          </ol>');
        lines.push('        </li>');
        inPart = false;
      }
      lines.push(`        <li>`);
      lines.push(`          <a href="${ch.filename}">${title}</a>`);
      lines.push(`        </li>`);
    } else if (inPart) {
      lines.push(`            <li>`);
      lines.push(`              <a href="${ch.filename}">${title}</a>`);
      lines.push(`            </li>`);
    } else {
      lines.push(`        <li>`);
      lines.push(`          <a href="${ch.filename}">${title}</a>`);
      lines.push(`        </li>`);
    }
  }

  if (inPart) {
    lines.push('          </ol>');
    lines.push('        </li>');
  }

  return lines.join('\n');
}

const navXhtml = `<?xml version="1.0" encoding="UTF-8"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en">
  <head>
    <meta charset="utf-8"/>
  </head>
  <body>
    <nav epub:type="toc" id="toc">
      <ol>
${buildNavOl(chapters)}
      </ol>
    </nav>
  </body>
</html>`;

writeFileSync(join(CONTENT_DIR, 'nav.xhtml'), navXhtml);
console.log('Rebuilt nav.xhtml');

// Cover page
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
console.log('Created cover.xhtml');

// Images for manifest
const imagesDir = join(CONTENT_DIR, 'images');
const imageFiles = existsSync(imagesDir)
  ? execSync(`ls "${imagesDir}"`).toString().trim().split('\n').filter(Boolean)
  : [];

const manifestItems = [
  '    <item href="cover.xhtml" id="cover" media-type="application/xhtml+xml"/>',
  '    <item href="nav.xhtml" id="toc" media-type="application/xhtml+xml" properties="nav"/>',
];
const spineItems = ['    <itemref idref="cover" linear="yes"/>'];

for (const ch of chapters) {
  manifestItems.push(`    <item href="${ch.filename}" id="${ch.id}" media-type="application/xhtml+xml"/>`);
  spineItems.push(`    <itemref idref="${ch.id}"/>`);
}

for (const img of imageFiles) {
  const ext = img.split('.').pop().toLowerCase();
  const mediaType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'png' ? 'image/png' : 'image/jpeg';
  const props = img === 'cover.jpg' ? ' properties="cover-image"' : '';
  manifestItems.push(`    <item href="images/${img}" id="${img}" media-type="${mediaType}"${props}/>`);
}

const packageOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">d7a3f2b1-8c4e-4d9a-b6f1-3e5a7c9d2b8f</dc:identifier>
    <dc:language>en</dc:language>
    <dc:title>Chasing the Sun</dc:title>
    <dc:creator>Ryan Boog</dc:creator>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</meta>
    <meta name="cover" content="cover-image"/>
  </metadata>
  <manifest>
${manifestItems.join('\n')}
  </manifest>
  <spine>
${spineItems.join('\n')}
  </spine>
</package>`;

writeFileSync(join(CONTENT_DIR, 'package.opf'), packageOpf);
console.log('Rebuilt package.opf');

// Remove original monolithic source file
execSync(`rm -f "${join(CONTENT_DIR, 'CHASING_THE_SUN_v2__6_.docx.xhtml')}"`);

// Re-pack epub
mkdirSync(dirname(EPUB_PATH), { recursive: true });
execSync(`rm -f "${EPUB_PATH}"`);
execSync(`cd "${WORK_DIR}" && zip -0 -X "${EPUB_PATH}" mimetype`, { stdio: 'pipe' });
execSync(`cd "${WORK_DIR}" && zip -r -X "${EPUB_PATH}" META-INF GoogleDoc -x mimetype`, { stdio: 'pipe' });

console.log(`\nEPUB written to: ${EPUB_PATH}`);

// Cleanup
execSync(`rm -rf "${WORK_DIR}"`);
execSync(`rm -rf "${V2_WORK}"`);
console.log('Done!');
