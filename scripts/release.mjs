import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const options = new Set(process.argv.slice(2));
for (const option of options) {
  if (!['--check', '--tag'].includes(option)) throw new Error(`Unknown release option: ${option}`);
}
const root = new URL('../', import.meta.url);
const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
if (!/^\d+\.\d+\.\d+$/.test(pkg.version)) throw new Error('Release requires a stable semver package version.');
const tag = `v${pkg.version}`;
const run = (command, args, capture = false) => execFileSync(command, args, { cwd: root, stdio: capture ? 'pipe' : 'inherit', encoding: 'utf8' });

// Default is an inspection only. Never push, deploy, alter DNS, or publish here.
process.stdout.write(`EducationOS ${tag}\nDefault: inspect only. --check runs quality checks. --tag checks and creates a local annotated tag; it never pushes.\n`);
for (const name of ['backend/uv.lock', 'backend/openapi.json', 'package-lock.json', 'docs/RELEASE.md', 'docs/DEPLOYMENT.md', 'docs/SECURITY.md', '.env.example']) {
  await readFile(new URL(name, root));
}
if (options.has('--check') || options.has('--tag')) {
  run('uv', ['run', '--frozen', '--directory', 'backend', 'ruff', 'check', '.']);
  run('uv', ['run', '--frozen', '--directory', 'backend', 'pytest']);
  run('uv', ['run', '--frozen', '--directory', 'backend', 'python', '-m', 'educationos.export_openapi', '--check']);
  run('npm', ['run', 'check']);
  run('npm', ['run', 'test:e2e']);
}
if (options.has('--tag')) {
  if (run('git', ['status', '--porcelain'], true).trim()) throw new Error('Commit the reviewed release before tagging; working tree has changes.');
  const existing = run('git', ['tag', '--list', tag], true).trim();
  if (existing) throw new Error(`Tag ${tag} already exists; inspect it before doing anything else.`);
  run('git', ['tag', '-a', tag, '-m', `EducationOS ${tag}: full-stack foundation, synthetic demo only`]);
  process.stdout.write(`Created local tag ${tag}. Push it separately after release approval. This does not mean the app is live or approved for child accounts.\n`);
}
