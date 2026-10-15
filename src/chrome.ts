import type { Hex } from './color.ts';
import type { Palette, TokenName } from './tokens.ts';

/**
 * The subset of Chromium's `kOverwritableColorTable` this theme sets. Chrome
 * derives the rest (incognito frames, background tabs) from these.
 */
export type ChromeColorKey =
  | 'frame'
  | 'frame_inactive'
  | 'toolbar'
  | 'toolbar_text'
  | 'toolbar_button_icon'
  | 'tab_text'
  | 'tab_background_text'
  | 'bookmark_text'
  | 'omnibox_background'
  | 'omnibox_text'
  | 'ntp_background'
  | 'ntp_text'
  | 'ntp_link';

export type Rgb = readonly [number, number, number];

// Same layout as the VS Code theme: the tab strip is the tab bar, the active
// tab and toolbar are the editor. Macaw's dark mode flips these scales, so one
// table serves both variants.
const mapping: Readonly<Record<ChromeColorKey, TokenName>> = {
  frame: '--bg-surface-level-2',
  // Set explicitly: Chrome's derived inactive frame washes out to grey.
  frame_inactive: '--bg-surface-level-1',
  toolbar: '--bg-surface-level-1',
  toolbar_text: '--text-primary',
  toolbar_button_icon: '--icon-secondary',
  tab_text: '--text-primary',
  tab_background_text: '--text-tertiary',
  bookmark_text: '--text-secondary',
  omnibox_background: '--bg-surface-level-3',
  omnibox_text: '--text-primary',
  ntp_background: '--bg-surface-level-1',
  ntp_text: '--text-primary',
  ntp_link: '--text-brand-secondary',
};

export function chromeColors(
  p: Palette
): Readonly<Record<ChromeColorKey, Hex>> {
  return Object.fromEntries(
    Object.entries(mapping).map(([key, token]) => [key, p.color(token)])
  ) as Record<ChromeColorKey, Hex>;
}

/** Chrome theme colors are opaque `[r, g, b]` triples. */
export function toRgb(hex: Hex): Rgb {
  if (hex.length !== 7)
    throw new Error(`Chrome themes need opaque colors: ${hex}`);
  return [1, 3, 5].map((i) =>
    parseInt(hex.slice(i, i + 2), 16)
  ) as unknown as Rgb;
}
