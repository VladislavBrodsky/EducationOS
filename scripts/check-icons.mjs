import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
const bad = [];
async function scan(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) await scan(file);
    else if (/\.(tsx?|css|html|json|svg)$/.test(file)) {
      const text = await readFile(file, 'utf8');
      if (/[\p{Extended_Pictographic}\p{Regional_Indicator}\uFE0F\u20E3]/u.test(text)) bad.push(file);
    }
  }
}
await scan('src');
await scan('public');
if (bad.length) { console.error('Emoji characters found:', bad.join(', ')); process.exit(1); }
console.log('Frontend icon policy passed: no emoji characters.');
