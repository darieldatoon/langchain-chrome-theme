import type { Hex } from './color.ts';
import type { Palette, Variant } from './tokens.ts';

export type Backdrop = {
  readonly glow: Hex;
  readonly accent: Hex;
  readonly from: Hex;
  readonly to: Hex;
};

/**
 * The brand backdrop: blue easing into purple. Pass the light palette: dark
 * mode flips Macaw's scales, which would turn this backdrop nearly white.
 */
export const heroBackdrop = ({ color }: Palette): Backdrop => ({
  glow: color('--brand-400'),
  accent: color('--purple-500'),
  from: color('--brand-800'),
  to: color('--brand-950'),
});

const layers = (b: Backdrop, glowSize: string, accentSize: string) => `
  radial-gradient(circle at 18% 12%, ${b.glow} 0, transparent ${glowSize}),
  radial-gradient(circle at 92% 96%, ${b.accent} 0, transparent ${accentSize}),
  linear-gradient(135deg, ${b.from}, ${b.to})`;

const page = (width: number, height: number, style: string, body: string) =>
  `<!doctype html>
<html>
<head>
<style>
  * { margin: 0; }
  html, body { width: ${width}px; height: ${height}px; background: transparent; overflow: hidden; }
${style}
</style>
</head>
<body>${body}</body>
</html>`;

/** A rounded tile with the logomark centered on the hero backdrop. */
export function iconHtml(
  logomark: string,
  size: number,
  backdrop: Backdrop
): string {
  return page(
    size,
    size,
    `  .tile {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    border-radius: ${Math.round(size * 0.22)}px;
    color: #ffffff;
    background: ${layers(backdrop, '60%', '55%')};
  }
  .tile svg { width: 62%; height: 62%; }`,
    `<div class="tile">${logomark}</div>`
  );
}

export type NtpInput = {
  readonly logomark: string;
  readonly width: number;
  readonly height: number;
  readonly backdrop: Backdrop;
  /** Page color the edges fade into; matches the theme's `ntp_background`. */
  readonly edge: Hex;
  readonly mark: Hex;
  readonly markOpacity: number;
};

/**
 * New Tab background. Chrome centers it unscaled, so the edges fade into the
 * page color and windows larger than the image show no seam. The logomark sits
 * low and right, clear of the centered Google logo and search box.
 */
export function ntpHtml(input: NtpInput): string {
  const { logomark, width, height, backdrop, edge, mark, markOpacity } = input;
  return page(
    width,
    height,
    `  .bg {
    position: absolute;
    inset: 0;
    background: ${layers(backdrop, '45%', '40%')};
  }
  .fade {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 55%, ${edge} 100%);
  }
  .mark {
    position: absolute;
    right: -6%;
    bottom: -18%;
    width: ${Math.round(height * 0.9)}px;
    height: ${Math.round(height * 0.9)}px;
    color: ${mark};
    opacity: ${markOpacity};
  }
  .mark svg { width: 100%; height: 100%; }`,
    `<div class="bg"></div><div class="mark">${logomark}</div><div class="fade"></div>`
  );
}

/** The dark New Tab art: the brand backdrop under a faint light logomark. */
export const darkNtpStyle = (
  palettes: Readonly<Record<Variant, Palette>>
): Pick<NtpInput, 'backdrop' | 'edge' | 'mark' | 'markOpacity'> => ({
  backdrop: heroBackdrop(palettes.light),
  edge: palettes.dark.color('--bg-surface-level-1'),
  mark: palettes.dark.color('--text-primary'),
  markOpacity: 0.07,
});
