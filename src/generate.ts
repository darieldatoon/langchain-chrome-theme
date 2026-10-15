// Writes themes/*/manifest.json from the installed @langchain/macaw-tokens and
// package.json's version. `--check` writes nothing and exits 1 if one is stale.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { THEMES, buildManifest, renderManifest } from './manifest.ts';
import { parseTokenFile } from './tokens.ts';

const check = process.argv.includes('--check');
const root = new URL('../', import.meta.url);

const tokensPath = fileURLToPath(
  import.meta.resolve('@langchain/macaw-tokens/tokens.json')
);
const file = parseTokenFile(JSON.parse(await readFile(tokensPath, 'utf8')));
const { version } = JSON.parse(
  await readFile(new URL('package.json', root), 'utf8')
) as { version: string };

const stale: string[] = [];
for (const spec of THEMES) {
  const dir = new URL(`themes/${spec.dir}/`, root);
  const target = new URL('manifest.json', dir);
  const text = renderManifest(buildManifest(file, spec, version));
  if (!check) {
    await mkdir(dir, { recursive: true });
    await writeFile(target, text);
    console.log(`wrote themes/${spec.dir}/manifest.json`);
  } else if ((await readFile(target, 'utf8').catch(() => '')) !== text) {
    stale.push(spec.dir);
  }
}

if (stale.length > 0) {
  console.error(`stale: ${stale.join(', ')}. Run \`mise run generate\`.`);
  process.exit(1);
}
