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
const run = (command, args, capture = false) => execFileSync(command, args, { cwd: root, stdio: capture ? 'pipe' : 'inherit', encoding: 'utf8', env: { ...process.env, CI: 'true' } });

// Default is an inspection only. Never push, deploy, alter DNS, or publish here.
process.stdout.write(`EducationOS ${tag}\nPreserved reference: --check runs quality checks. Product tagging is disabled; use the accepted Python-first release.\n`);
for (const name of ['package-lock.json', 'docs/RELEASE.md', 'docs/DEPLOYMENT.md', 'docs/SECURITY.md', '.env.example']) {
  await readFile(new URL(name, root));
}
if (options.has('--check') || options.has('--tag')) {
  run('npm', ['run', 'check']);
  run('npm', ['run', 'test:e2e']);
}
if (options.has('--tag')) {
  throw new Error('This backend architecture was superseded. Tag the accepted Python-first release instead.');
}
