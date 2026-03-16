import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const WORK_DIR = join(ROOT, '.epub-fix');

// Fix both EPUBs
const epubs = [
  join(ROOT, 'public', 'chasing-the-sun-draft.epub'),
  join(ROOT, 'public', 'chasing-the-sun.epub'),
];

const selfClosingTags = new Set(['br', 'hr', 'img', 'meta', 'link', 'input', 'col', 'area', 'base']);

function balanceTags(html) {
  const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\/?>/g;
  const stack = [];
  let match;

  // Remove orphan closing tags at the very start (before any opening tag)
  html = html.replace(/^(\s*(<\/[a-zA-Z][a-zA-Z0-9]*\s*>\s*)+)/, '');

  while ((match = tagRe.exec(html)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();

    if (selfClosingTags.has(tagName) || fullTag.endsWith('/>')) continue;

    if (fullTag.startsWith('</')) {
      // Closing tag — find and remove matching open from stack
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i] === tagName) {
          stack.splice(i, 1);
          break;
        }
      }
    } else {
      stack.push(tagName);
    }
  }

  // Close remaining open tags in reverse order
  for (let i = stack.length - 1; i >= 0; i--) {
    html += `</${stack[i]}>`;
  }

  return html;
}

for (const epubPath of epubs) {
  console.log(`\nFixing: ${epubPath}`);

  execSync(`rm -rf "${WORK_DIR}"`);
  execSync(`mkdir -p "${WORK_DIR}"`);
  execSync(`unzip -o "${epubPath}" -d "${WORK_DIR}"`, { stdio: 'pipe' });

  const contentDir = join(WORK_DIR, 'GoogleDoc');
  const files = readdirSync(contentDir).filter(f => f.startsWith('section-') && f.endsWith('.xhtml'));
  let fixCount = 0;

  for (const file of files.sort()) {
    const filePath = join(contentDir, file);
    const content = readFileSync(filePath, 'utf-8');

    // Extract body content, balance it, put it back
    const bodyMatch = content.match(/(<body[^>]*>)([\s\S]*)(<\/body>)/);
    if (!bodyMatch) {
      console.log(`  ${file}: no <body> found, skipping`);
      continue;
    }

    const bodyOpen = bodyMatch[1];
    const bodyInner = bodyMatch[2];
    const bodyClose = bodyMatch[3];

    const balanced = balanceTags(bodyInner);
    if (balanced !== bodyInner) {
      const fixed = content.replace(bodyMatch[0], bodyOpen + balanced + bodyClose);
      writeFileSync(filePath, fixed);

      // Count what was fixed
      const addedClosing = balanced.length - bodyInner.length;
      console.log(`  ${file}: fixed (${addedClosing > 0 ? '+' + addedClosing + ' chars of closing tags' : 'removed orphan tags'})`);
      fixCount++;
    }
  }

  if (fixCount === 0) {
    console.log('  No fixes needed');
  } else {
    console.log(`  Fixed ${fixCount} files`);
  }

  // Repack
  execSync(`rm -f "${epubPath}"`);
  execSync(`cd "${WORK_DIR}" && zip -0 -X "${epubPath}" mimetype`, { stdio: 'pipe' });
  execSync(`cd "${WORK_DIR}" && zip -r -X "${epubPath}" META-INF GoogleDoc -x mimetype`, { stdio: 'pipe' });
  console.log(`  Repacked: ${epubPath}`);

  execSync(`rm -rf "${WORK_DIR}"`);
}

console.log('\nDone!');
