import { spawnSync } from 'node:child_process';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const committedDir = path.join(root, 'src/shared/api/generated');
const tmp = await mkdtemp(path.join(os.tmpdir(), 'gen-api-'));

try {
  const res = spawnSync(process.execPath, [path.join(root, 'scripts/gen-api.mjs'), '--out', tmp], {
    stdio: ['ignore', 'ignore', 'inherit'],
    env: process.env,
  });
  if (res.status !== 0) process.exit(res.status ?? 1);

  const names = new Set([
    ...(await readdir(tmp)),
    ...(await readdir(committedDir).catch(() => [])),
  ]);
  const stale = [];
  for (const name of [...names].sort()) {
    const [a, b] = await Promise.all([
      readFile(path.join(tmp, name)).catch(() => null),
      readFile(path.join(committedDir, name)).catch(() => null),
    ]);
    if (!a || !b || !a.equals(b)) stale.push(name);
  }
  if (stale.length > 0) {
    console.error(`check-api: out of date: ${stale.join(', ')}. Run npm run gen:api.`);
    process.exit(1);
  }
  console.log('check-api: generated files are up to date');
} finally {
  await rm(tmp, { recursive: true, force: true });
}
