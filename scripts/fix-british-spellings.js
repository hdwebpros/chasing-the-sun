import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const WORK_DIR = join(ROOT, '.epub-fix-spelling');

const replacements = [
  // -our → -or
  [/\bcolour\b/g, 'color'],
  [/\bColour\b/g, 'Color'],
  [/\bharbour\b/g, 'harbor'],
  [/\bHarbour\b/g, 'Harbor'],
  [/\bneighbour\b/g, 'neighbor'],
  [/\bNeighbour\b/g, 'Neighbor'],
  // -ise → -ize
  [/\brealised\b/g, 'realized'],
  [/\bRealised\b/g, 'Realized'],
  [/\bmemorised\b/g, 'memorized'],
  [/\bMemorised\b/g, 'Memorized'],
  // -lled → -led
  [/\blevelled\b/g, 'leveled'],
  [/\bLevelled\b/g, 'Leveled'],
  // -ellery → -elry
  [/\bjewellery\b/g, 'jewelry'],
  [/\bJewellery\b/g, 'Jewelry'],
  // grey → gray
  [/\bgrey\b/g, 'gray'],
  [/\bGrey\b/g, 'Gray'],
  [/\bgreys\b/g, 'grays'],
  [/\bGreys\b/g, 'Grays'],
  // -wards → -ward
  [/\btowards\b/g, 'toward'],
  [/\bTowards\b/g, 'Toward'],
  [/\bbackwards\b/g, 'backward'],
  [/\bBackwards\b/g, 'Backward'],
  [/\bupwards\b/g, 'upward'],
  [/\bUpwards\b/g, 'Upward'],
];

const epubs = [
  join(ROOT, 'public', 'chasing-the-sun-draft.epub'),
  join(ROOT, 'public', 'chasing-the-sun.epub'),
];

for (const epubPath of epubs) {
  console.log(`\nFixing: ${epubPath}`);

  execSync(`rm -rf "${WORK_DIR}"`);
  execSync(`mkdir -p "${WORK_DIR}"`);
  execSync(`unzip -o "${epubPath}" -d "${WORK_DIR}"`, { stdio: 'pipe' });

  const contentDir = join(WORK_DIR, 'GoogleDoc');
  const files = readdirSync(contentDir).filter(f => f.endsWith('.xhtml')).sort();
  let totalFixes = 0;

  for (const file of files) {
    const filePath = join(contentDir, file);
    let content = readFileSync(filePath, 'utf-8');
    let fileFixes = 0;

    for (const [pattern, replacement] of replacements) {
      const matches = content.match(pattern);
      if (matches) {
        fileFixes += matches.length;
        content = content.replace(pattern, replacement);
      }
    }

    if (fileFixes > 0) {
      writeFileSync(filePath, content);
      console.log(`  ${file}: ${fileFixes} replacements`);
      totalFixes += fileFixes;
    }
  }

  console.log(`  Total: ${totalFixes} replacements`);

  // Repack
  execSync(`rm -f "${epubPath}"`);
  execSync(`cd "${WORK_DIR}" && zip -0 -X "${epubPath}" mimetype`, { stdio: 'pipe' });
  execSync(`cd "${WORK_DIR}" && zip -r -X "${epubPath}" META-INF GoogleDoc -x mimetype`, { stdio: 'pipe' });
  console.log(`  Repacked: ${epubPath}`);

  execSync(`rm -rf "${WORK_DIR}"`);
}

console.log('\nDone!');
