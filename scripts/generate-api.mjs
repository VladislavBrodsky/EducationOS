import { readFile, writeFile, mkdir } from 'node:fs/promises';
import openapiTS, { astToString } from 'openapi-typescript';

// Input is exported by Python's app.openapi(); never hand-maintain API types.
const schema = new URL('../backend/openapi.json', import.meta.url);
const output = new URL('../src/lib/api/schema.d.ts', import.meta.url);
const generated = astToString(await openapiTS(JSON.parse(await readFile(schema, 'utf8')), { alphabetize: true }));
const content = `/** Generated from backend/openapi.json. Run npm run api:generate; do not edit. */\n${generated}`;
if (process.argv.includes('--check')) {
  if (await readFile(output, 'utf8').catch(() => '') !== content) {
    console.error('API types have drifted. Export Python OpenAPI, then run npm run api:generate.');
    process.exit(1);
  }
  console.log('Generated API types match the Python OpenAPI schema.');
} else {
  await mkdir(new URL('../src/lib/api/', import.meta.url), { recursive: true });
  await writeFile(output, content);
  console.log('Generated frontend contracts from Python OpenAPI.');
}
