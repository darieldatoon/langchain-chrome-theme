// Renders each theme's icons and New Tab background with Playwright, from
// Macaw's LangChain logomark (copied from macaw-design-system's components/Logo).
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { type Browser, chromium } from 'playwright';

import { darkNtpStyle, heroBackdrop, iconHtml, ntpHtml } from '../src/art.ts';
import { ICON_SIZES, NTP_IMAGE, THEMES, iconPath } from '../src/manifest.ts';
import { palette, parseTokenFile, tokenTable } from '../src/tokens.ts';

/** Chrome centers the New Tab image unscaled; this covers common window sizes. */
const NTP = { width: 1920, height: 1080 };

const path = (relative: string) =>
  fileURLToPath(new URL(`../${relative}`, import.meta.url));

async function render(
  browser: Browser,
  html: string,
  size: { width: number; height: number },
  scale: number,
  out: string
) {
  const page = await browser.newPage({
    viewport: size,
    deviceScaleFactor: scale,
  });
  try {
    await page.setContent(html);
    await mkdir(out.slice(0, out.lastIndexOf('/')), { recursive: true });
    await writeFile(out, await page.screenshot({ omitBackground: true }));
  } finally {
    await page.close();
  }
}

const tokensPath = fileURLToPath(
  import.meta.resolve('@langchain/macaw-tokens/tokens.json')
);
const file = parseTokenFile(JSON.parse(await readFile(tokensPath, 'utf8')));
const logomark = await readFile(path('assets/langchain-logomark.svg'), 'utf8');

const palettes = {
  light: palette(tokenTable(file, 'light')),
  dark: palette(tokenTable(file, 'dark')),
};
// The icon is the same brand tile in both variants, like the VS Code icon.
const iconBackdrop = heroBackdrop(palettes.light);

const browser = await chromium.launch();
try {
  for (const spec of THEMES) {
    const dir = `themes/${spec.dir}`;
    for (const size of ICON_SIZES) {
      await render(
        browser,
        iconHtml(logomark, size, iconBackdrop),
        { width: size, height: size },
        1,
        path(`${dir}/${iconPath(size)}`)
      );
    }
    if (spec.ntpImage) {
      const html = ntpHtml({ logomark, ...NTP, ...darkNtpStyle(palettes) });
      await render(browser, html, NTP, 1, path(`${dir}/${NTP_IMAGE}`));
    }
    console.log(`rendered ${dir}`);
  }
} finally {
  await browser.close();
}
