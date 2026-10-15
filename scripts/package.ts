// Zips each theme folder into dist/<dir>-v<version>.zip: the format the Chrome
// Web Store accepts, and what GitHub releases attach.
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { THEMES } from '../src/manifest.ts';

const path = (relative: string) =>
  fileURLToPath(new URL(`../${relative}`, import.meta.url));

const { version } = JSON.parse(
  await readFile(path('package.json'), 'utf8')
) as {
  version: string;
};
await mkdir(path('dist'), { recursive: true });

for (const spec of THEMES) {
  const zip = path(`dist/${spec.dir}-v${version}.zip`);
  await rm(zip, { force: true });
  // -X drops macOS extended attributes; the store rejects resource forks.
  // Chrome caches a compiled theme into folders loaded unpacked; never ship it.
  execFileSync('zip', ['-r', '-X', '-q', zip, '.', '-x', 'Cached Theme.pak'], {
    cwd: path(`themes/${spec.dir}`),
  });
  console.log(`wrote dist/${spec.dir}-v${version}.zip`);
}
