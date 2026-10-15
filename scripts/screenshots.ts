// Captures the dark theme's New Tab page from Chromium with the theme loaded
// unpacked. Only page content can be captured: Chrome draws the tab strip and
// toolbar natively, outside what Playwright screenshots.
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

import { THEMES } from '../src/manifest.ts';

const path = (relative: string) =>
  fileURLToPath(new URL(`../${relative}`, import.meta.url));

const spec = THEMES.find((t) => t.ntpImage);
if (!spec) throw new Error('No theme ships a New Tab image');
const theme = path(`themes/${spec.dir}`);
const profile = await mkdtemp(join(tmpdir(), 'langchain-chrome-theme-'));

const context = await chromium.launchPersistentContext(profile, {
  // Full Chromium: the headless shell cannot load extensions.
  channel: 'chromium',
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  args: [`--disable-extensions-except=${theme}`, `--load-extension=${theme}`],
});
try {
  const page = context.pages()[0] ?? (await context.newPage());
  await page.goto('chrome://newtab');
  await page.locator('ntp-app').waitFor();
  await page.waitForTimeout(1500);
  await mkdir(path('docs/images'), { recursive: true });
  await page.screenshot({
    path: path(`docs/images/new-tab-${spec.variant}.png`),
  });
  console.log(`wrote docs/images/new-tab-${spec.variant}.png`);
} finally {
  await context.close();
  await rm(profile, { recursive: true, force: true });
  // Chrome compiles the theme into the folder it loaded; keep the tree clean.
  await rm(join(theme, 'Cached Theme.pak'), { force: true });
}
