import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const EPUB_PATH = join(ROOT, 'public', 'chasing-the-sun.epub');
const WORK_DIR = join(ROOT, '.epub-build');

// Clean and extract
execSync(`rm -rf "${WORK_DIR}"`);
mkdirSync(WORK_DIR, { recursive: true });
execSync(`unzip -o "${EPUB_PATH}" -d "${WORK_DIR}"`, { stdio: 'pipe' });

const CONTENT_DIR = join(WORK_DIR, 'GoogleDoc');
const mainXhtml = readFileSync(join(CONTENT_DIR, 'CHASING_THE_SUN_v2.docx.xhtml'), 'utf-8');

// Extract <head> and <body> attributes
const headContent = mainXhtml.match(/<head>[\s\S]*?<\/head>/)[0];
const bodyAttrs = (mainXhtml.match(/<body([^>]*)>/) || ['', ''])[1];
const bodyContent = mainXhtml.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

// Step 1: Split on <hr> page breaks
const rawSections = bodyContent.split(/<hr\s+style="page-break-before:always[^"]*"\s*\/>/);

// Step 2: For each section, check if it contains multiple headings that should be
// separate spine items. Split only when there's substantial content before a heading.
function hasSubstantialContent(html) {
  // Strip tags and whitespace — if there's real text, it's substantial
  const text = html.replace(/<[^>]*>/g, '').trim();
  return text.length > 20;
}

// Heading patterns that mark the start of a new section
const headingRe = /<(?:h[12]\s[^>]*>\s*<span[^>]*>(?:Chapter|PART|INTERLUDE|PROLOGUE|EPILOGUE)|p\s[^>]*>\s*<span[^>]*\b(?:c7|c31|c36)\b[^>]*>(?:Chapter|PART|INTERLUDE))/i;

function splitSection(html) {
  const results = [];
  let remaining = html;

  while (remaining) {
    // Find the first heading
    const firstMatch = remaining.match(headingRe);
    if (!firstMatch) {
      // No more headings — rest is content
      if (remaining.trim()) results.push(remaining.trim());
      break;
    }

    const headingPos = firstMatch.index;
    const before = remaining.substring(0, headingPos);
    const after = remaining.substring(headingPos);

    if (hasSubstantialContent(before)) {
      // There's real content before this heading — split here
      results.push(before.trim());
      remaining = after;
    } else {
      // Just empty spacers before the heading — find the NEXT heading
      // to see if there's another split point after this one
      const afterFirstHeading = after.substring(1); // skip past the '<' we matched
      const nextMatch = afterFirstHeading.match(headingRe);

      if (!nextMatch) {
        // No more headings — everything is one section
        if (remaining.trim()) results.push(remaining.trim());
        break;
      }

      // Include everything up to the next heading match point (offset by 1 for the char we skipped)
      const nextPos = headingPos + 1 + nextMatch.index;
      const chunk = remaining.substring(0, nextPos);
      const rest = remaining.substring(nextPos);

      if (hasSubstantialContent(rest.substring(0, rest.indexOf('</' + (rest.match(/<(\w+)/)?.[1] || 'p')) || 200))) {
        // Next section has content — split
        results.push(chunk.trim());
        remaining = rest;
      } else {
        // Keep scanning — prepend spacer to next heading's content
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

  for (const cls of ['c36', 'c7', 'c31']) {
    const m = html.match(new RegExp(`<span[^>]*\\b${cls}\\b[^>]*>(.*?)<\\/span>`));
    if (m) {
      const text = m[1].replace(/<[^>]*>/g, '').trim();
      if (text) return text;
    }
  }

  const big = html.match(/<span[^>]*c54[^>]*>(.*?)<\/span>/);
  if (big) return big[1].replace(/<[^>]*>/g, '').trim();

  return null;
}

// Extract the italic subtitle that follows the heading (e.g. "Raw, furious, and unmistakably alive")
// These are in <p> tags with <span class="... c15 ..."> (c15 = italic)
// They appear right after the h1/h2 or heading <p>, containing real text (not empty spans)
function extractSubtitle(html) {
  // After normalization, headings are <h1>/<h2>. Find the first italic span after them.
  // Match: closing </h1> or </h2>, then optional whitespace/empty-paragraphs, then a <p> with an italic span
  const afterHeading = html.match(/<\/h[12]>[\s\S]*?<p[^>]*>\s*<span[^>]*\bc15\b[^>]*>(.*?)<\/span>/);
  if (afterHeading) {
    const text = afterHeading[1].replace(/<[^>]*>/g, '').trim();
    if (text) return text;
  }

  // Pre-normalization fallback: look for italic span in first few elements
  // c15 = italic, with c34/c42/c35 = various sizes
  const italicSpan = html.match(/<span[^>]*\bc15\b[^>]*>(.*?)<\/span>/);
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

// Normalize headings: convert <p>-wrapped chapter/part/interlude titles to proper <h1>/<h2>,
// and ensure subtitles use a consistent <p class="subtitle"> pattern.
// This is critical because epubjs CSS overrides target h1/h2 for gold color.
//
// Source patterns found in the Google Docs export:
//   PART/PROLOGUE/EPILOGUE headings:
//     Correct:  <h1 class="..."><span class="c36">PART ONE</span></h1>
//     Broken:   <p class="c19"><span class="c36">PART FIVE</span></p>
//               <p class="c41"><span class="c7">INTERLUDE</span></p>
//
//   Chapter headings:
//     Correct:  <h2 class="c14"><span class="c31">Chapter One</span></h2>
//     Broken:   <p class="c49"><span class="c7">Chapter Eleven</span></p>
//               <p class="c9"><span class="c31">Chapter Thirty-Two</span></p>
//
//   Subtitles (line after heading):
//     Variant A: <p class="c6"><span class="c25 c15 c34">Raw, furious...</span></p>    (c15=italic, c34=16pt)
//     Variant B: <p class="c26"><span class="c25 c15 c42">Slums again...</span></p>    (c15=italic, c42=14pt)
//     Both should render as italic subtitle text — they do, but sizing differs.

function normalizeHeadings(html) {
  // Convert <p ...><span class="c7|c31|c36">PART/INTERLUDE/Chapter ...</span></p>
  // to proper <h1> (for PART/PROLOGUE/EPILOGUE/INTERLUDE) or <h2> (for Chapter)

  // PART headings in <p> → <h1>
  html = html.replace(
    /<p\s+class="[^"]*">\s*<span[^>]*\b(?:c36)\b[^>]*>(PART\s+\w+)<\/span>\s*<\/p>/gi,
    '<h1 class="c48"><span class="c36">$1</span></h1>'
  );

  // INTERLUDE in <p> → <h2>
  html = html.replace(
    /<p\s+class="[^"]*">\s*<span[^>]*\b(?:c7)\b[^>]*>(INTERLUDE)<\/span>\s*<\/p>/gi,
    '<h2 class="c14"><span class="c31">$1</span></h2>'
  );

  // Chapter headings in <p> with c7 span → <h2>
  html = html.replace(
    /<p\s+class="[^"]*">\s*<span[^>]*\b(?:c7)\b[^>]*>(Chapter\s+[\w-]+)<\/span>\s*<\/p>/gi,
    '<h2 class="c14"><span class="c31">$1</span></h2>'
  );

  // Chapter headings in <p> with c31 span → <h2>
  html = html.replace(
    /<p\s+class="[^"]*">\s*<span[^>]*\b(?:c31)\b[^>]*>(Chapter\s+[\w-]+)<\/span>\s*<\/p>/gi,
    '<h2 class="c14"><span class="c31">$1</span></h2>'
  );

  // Normalize subtitle paragraphs: c26 (used with broken chapters) → c6 (used with working ones)
  // Both are centered paragraphs, but c26 has 24pt bottom padding vs c6's 10pt.
  // Also normalize c42 (14pt) spans to c34 (16pt) for consistent subtitle size.
  html = html.replace(
    /<p\s+class="c26">\s*<span\s+class="c25 c15 c42">/g,
    '<p class="c6"><span class="c25 c15 c34">'
  );

  // Normalize subtitle paragraphs with c9 class (used in Part 5 chapters) → c6
  html = html.replace(
    /<p\s+class="c9">\s*<span\s+class="c25 c15 c34">/g,
    '<p class="c6"><span class="c25 c15 c34">'
  );
  html = html.replace(
    /<p\s+class="c9">\s*<span\s+class="c25 c15">/g,
    '<p class="c6"><span class="c25 c15 c34">'
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

  // For chapters, include the subtitle in the nav label: "Chapter 1: Raw, furious..."
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
    <dc:identifier id="uid">1735777a-0e2b-407e-9f13-19c2131f13ec</dc:identifier>
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

execSync(`rm -f "${join(CONTENT_DIR, 'CHASING_THE_SUN_v2.docx.xhtml')}"`);

mkdirSync(dirname(EPUB_PATH), { recursive: true });
execSync(`rm -f "${EPUB_PATH}"`);
execSync(`cd "${WORK_DIR}" && zip -0 -X "${EPUB_PATH}" mimetype`, { stdio: 'pipe' });
execSync(`cd "${WORK_DIR}" && zip -r -X "${EPUB_PATH}" META-INF GoogleDoc -x mimetype`, { stdio: 'pipe' });

console.log(`\nEPUB written to: ${EPUB_PATH}`);
execSync(`rm -rf "${WORK_DIR}"`);
console.log('Done!');
