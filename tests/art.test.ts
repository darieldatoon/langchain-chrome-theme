import { expect, it } from 'vitest';

import { type Backdrop, iconHtml, ntpHtml } from '../src/art.ts';
import { toHex } from '../src/color.ts';

const backdrop: Backdrop = {
  glow: toHex('#006ddd'),
  accent: toHex('#6244a0'),
  from: toHex('#0c336a'),
  to: toHex('#101a30'),
};

it('icon centers the logomark on a rounded tile', () => {
  const html = iconHtml('<svg id="mark"></svg>', 128, backdrop);
  expect(html).toContain('<div class="tile"><svg id="mark"></svg></div>');
  expect(html).toContain('border-radius: 28px');
});

it('New Tab art fades its edges into the page color', () => {
  const html = ntpHtml({
    logomark: '<svg></svg>',
    width: 1920,
    height: 1080,
    backdrop,
    edge: toHex('#09090f'),
    mark: toHex('#f5f8fb'),
    markOpacity: 0.07,
  });
  expect(html).toContain('transparent 55%, #09090f 100%');
  expect(html).toContain('opacity: 0.07');
});
