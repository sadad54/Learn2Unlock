import { chromium } from 'file:///C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs/promises';

const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(here, 'screens');
await fs.mkdir(output, { recursive: true });
const ids = ['p1','p2','p3','p4','p5','p6','p7','p8','p9','p10','p11','p12','p13','c1','c2','c3','c4','c5','c6'];
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
const base = pathToFileURL(path.join(here, 'index.html')).href;
for (const id of ids) {
  await page.goto(`${base}?screen=${id}`, { waitUntil: 'load' });
  if (!(await page.evaluate(() => document.body.classList.contains('single')))) throw new Error(`Single-screen mode failed for ${id}`);
  await page.screenshot({ path: path.join(output, `${id}.png`), fullPage: false });
}
await browser.close();
console.log(`Exported ${ids.length} screens to ${output}`);
