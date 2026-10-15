import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { NTP_IMAGE, THEMES, buildManifest } from '../src/manifest.ts';
import { parseTokenFile } from '../src/tokens.ts';

const file = parseTokenFile(
  JSON.parse(
    readFileSync(
      fileURLToPath(import.meta.resolve('@langchain/macaw-tokens/tokens.json')),
      'utf8'
    )
  )
);
const themeDir = (dir: string) =>
  fileURLToPath(new URL(`../themes/${dir}/`, import.meta.url));

describe.each(THEMES)('$name', (spec) => {
  const manifest = buildManifest(file, spec, '1.2.3');

  it('is a Manifest V3 theme carrying the given version', () => {
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.name).toBe(spec.name);
    expect(manifest.version).toBe('1.2.3');
  });

  it('points only at files that exist', () => {
    const files = [
      ...Object.values(manifest.icons),
      ...Object.values(manifest.theme.images ?? {}),
    ];
    expect(files.filter((f) => !existsSync(themeDir(spec.dir) + f))).toEqual(
      []
    );
  });

  it('ships a New Tab image only when the spec asks for one', () => {
    expect(manifest.theme.images?.theme_ntp_background).toBe(
      spec.ntpImage ? NTP_IMAGE : undefined
    );
    expect(existsSync(themeDir(spec.dir) + NTP_IMAGE)).toBe(spec.ntpImage);
  });
});
