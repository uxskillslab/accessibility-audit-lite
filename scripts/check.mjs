#!/usr/bin/env node
// Quick automated accessibility check for the accessibility-audit-lite skill.
// Usage: node check.mjs <url> [outDir]
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const [url, outDir = 'a11y-check'] = process.argv.slice(2);
if (!url) {
  console.error('Usage: node check.mjs <url> [outDir]');
  process.exit(1);
}
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const results = { url, checkedAt: new Date().toISOString(), errors: [] };

// Each check runs on its own, so one failure doesn't stop the other.
async function check(name, viewport, fn) {
  // bypassCSP lets axe inject its script on sites with a strict Content Security Policy
  const context = await browser.newContext({ viewport, bypassCSP: true, locale: 'en-GB' });
  try {
    const page = await context.newPage();
    const response = await page.goto(url, { waitUntil: 'load', timeout: 45000 });
    if (response && response.status() >= 400) {
      throw new Error(`Page returned HTTP ${response.status()} (the site may block automated browsers)`);
    }
    await page.waitForTimeout(1500);
    await fn(page);
  } catch (e) {
    let message = e.message.split('\n')[0];
    if (/ERR_HTTP2_PROTOCOL_ERROR|ERR_CONNECTION_RESET|HTTP 403|HTTP 429/.test(message)) {
      message = `Blocked by the site's bot protection (${message})`;
    }
    results.errors.push({ check: name, message });
    console.warn(`! ${name} failed: ${message}`);
  } finally {
    await context.close();
  }
}

try {
  // Automated WCAG 2.2 A/AA rules
  await check('axe', { width: 1440, height: 900 }, async (page) => {
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    results.axe = axe.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      helpUrl: v.helpUrl,
      wcag: v.tags.filter((t) => /^wcag\d{3,}$/.test(t)),
      count: v.nodes.length,
      examples: v.nodes.slice(0, 3).map((n) => n.target.join(' ')),
    }));
  });

  // Reflow at 320px (WCAG 1.4.10)
  await check('reflow', { width: 320, height: 640 }, async (page) => {
    results.reflow = await page.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      return { viewportWidth: innerWidth, scrollWidth, horizontalScroll: scrollWidth > innerWidth + 1 };
    });
  });
} finally {
  await browser.close();
}

await fs.writeFile(path.join(outDir, 'results.json'), JSON.stringify(results, null, 2));
console.log(
  `Done: ${results.axe?.length ?? '?'} axe rules failing, ` +
    `reflow scroll at 320px: ${results.reflow?.horizontalScroll ?? '?'}` +
    (results.errors.length ? `, ${results.errors.length} check(s) failed (see results.errors)` : '') +
    `. Output in ${outDir}/results.json`
);
// Both checks failed: most likely the site blocked us or the URL is wrong
if (results.errors.length === 2) process.exit(2);
