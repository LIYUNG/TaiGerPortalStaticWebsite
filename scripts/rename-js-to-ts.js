/**
 * Bulk rename .js/.jsx to .ts/.tsx in src/ for TypeScript migration.
 * - .jsx -> .tsx
 * - .js -> .tsx if file contains JSX (return with <, or createElement), else .ts
 * - Skips utils/contants.js (rename to constants.ts in a separate step)
 * - Skips if .ts/.tsx already exists (avoid overwriting)
 */
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');
const SKIP_REL = new Set(['utils/contants.js', 'utils\\contants.js']);

function hasJSX(content) {
  // Strip single-line and multi-line comments to avoid false positives
  const withoutComments = content
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  return (
    /return\s*\(?\s*</.test(withoutComments) ||
    /<\s*[A-Z][a-zA-Z]*/.test(withoutComments) ||
    /React\.createElement\s*\(/.test(withoutComments) ||
    /createElement\s*\(/.test(withoutComments)
  );
}

function getAllJsFiles(dir, list = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(SRC_DIR, full);
    if (e.isDirectory()) {
      getAllJsFiles(full, list);
    } else if (e.name.endsWith('.js') || e.name.endsWith('.jsx')) {
      const relNorm = path.normalize(rel).replace(/\\/g, '/');
      if (!SKIP_REL.has(relNorm)) {
        const fileDir = path.dirname(full);
        const base = path.basename(full, e.name.endsWith('.jsx') ? '.jsx' : '.js');
        const tsPath = path.join(fileDir, base + '.ts');
        const tsxPath = path.join(fileDir, base + '.tsx');
        if (!fs.existsSync(tsPath) && !fs.existsSync(tsxPath)) {
          list.push({ full, rel: relNorm, ext: e.name.endsWith('.jsx') ? 'jsx' : 'js' });
        }
      }
    }
  }
  return list;
}

const files = getAllJsFiles(SRC_DIR);
let tsxCount = 0;
let tsCount = 0;

for (const { full, rel, ext } of files) {
  const dir = path.dirname(full);
  const base = path.basename(full, ext === 'jsx' ? '.jsx' : '.js');
  let newExt;
  if (ext === 'jsx') {
    newExt = 'tsx';
    tsxCount++;
  } else {
    const content = fs.readFileSync(full, 'utf8');
    newExt = hasJSX(content) ? 'tsx' : 'ts';
    if (newExt === 'tsx') tsxCount++;
    else tsCount++;
  }
  const newPath = path.join(dir, base + '.' + newExt);
  fs.renameSync(full, newPath);
  console.log(`${rel} -> ${path.normalize(path.relative(SRC_DIR, newPath))}`);
}

console.log(`\nDone: ${tsxCount} -> .tsx, ${tsCount} -> .ts (${files.length} total).`);
