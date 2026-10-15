import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { type ChromeColorKey, chromeColors, toRgb } from '../src/chrome.ts';
import { type Hex, contrast, toHex } from '../src/color.ts';
import { palette, parseTokenFile, tokenTable } from '../src/tokens.ts';

const file = parseTokenFile(
  JSON.parse(
    readFileSync(
      fileURLToPath(import.meta.resolve('@langchain/macaw-tokens/tokens.json')),
      'utf8'
    )
  )
);

/** Chromium's kOverwritableColorTable (chrome/browser/themes/browser_theme_pack.cc). */
const CHROMIUM_KEYS = new Set([
  'background_tab',
  'background_tab_inactive',
  'background_tab_incognito',
  'background_tab_incognito_inactive',
  'bookmark_text',
  'button_background',
  'frame',
  'frame_inactive',
  'frame_incognito',
  'frame_incognito_inactive',
  'ntp_background',
  'ntp_header',
  'ntp_link',
  'ntp_text',
  'omnibox_background',
  'omnibox_text',
  'tab_background_text',
  'tab_background_text_inactive',
  'tab_background_text_incognito',
  'tab_background_text_incognito_inactive',
  'tab_text',
  'toolbar',
  'toolbar_button_icon',
  'toolbar_text',
]);

it('toRgb splits opaque hex and rejects translucent colors', () => {
  expect(toRgb(toHex('#006ddd'))).toEqual([0, 109, 221]);
  expect(() => toRgb(toHex('#006ddd80'))).toThrow(/opaque/);
});

describe.each(['light', 'dark'] as const)('%s colors', (variant) => {
  const colors = chromeColors(palette(tokenTable(file, variant)));
  const c = (key: ChromeColorKey): Hex => colors[key];

  it('only uses keys Chromium lets themes override', () => {
    for (const key of Object.keys(colors)) expect(CHROMIUM_KEYS).toContain(key);
  });

  it.each([
    ['tab_text', 'toolbar', 4.5],
    ['toolbar_text', 'toolbar', 4.5],
    ['bookmark_text', 'toolbar', 4.5],
    ['tab_background_text', 'frame', 4.5],
    ['tab_background_text', 'frame_inactive', 4.5],
    ['omnibox_text', 'omnibox_background', 4.5],
    ['ntp_text', 'ntp_background', 4.5],
    ['ntp_link', 'ntp_background', 4.5],
    // Icons are non-text UI: WCAG asks 3:1.
    ['toolbar_button_icon', 'toolbar', 3],
  ] as const)('%s on %s reaches %s:1', (fg, bg, min) => {
    expect(contrast(c(fg), c(bg))).toBeGreaterThanOrEqual(min);
  });
});
