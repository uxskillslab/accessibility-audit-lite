# Accessibility Audit Lite by UX Skills Lab

A free Claude Code skill that runs a quick WCAG 2.2 A/AA check on any web page and explains what's wrong in plain English.

```
/accessibility-audit-lite https://your-site.com
```

## What it checks

- Automated WCAG rules with axe-core: contrast, missing labels, alt text, button and link names, page structure
- Reflow at 320px: does the page scroll sideways on a small phone? (WCAG 1.4.10)

You get a short summary in chat, ranked by impact, with a fix for each problem.

## Install

**The easy way:** open Claude Code on your computer, drag this folder (or the zip) into it and say:

```
Install this skill into ~/.claude/skills and run its setup commands
```

**Manually:**

```
git clone https://github.com/uxskillslab/accessibility-audit-lite ~/.claude/skills/accessibility-audit-lite
cd ~/.claude/skills/accessibility-audit-lite
npm install
npx playwright install chromium
```

Then restart Claude Code. Needs Node.js 18 or newer.

## Want the full audit?

Automated rules catch roughly a third of real accessibility problems. The full **Accessibility Audit** covers the rest:

| | Lite (free) | Full |
|---|---|---|
| Automated WCAG rules (axe-core) | ✅ | ✅ |
| Reflow at 320px | ✅ | ✅ |
| 200% zoom, text spacing, orientation | | ✅ |
| Keyboard focus walk with screenshots | | ✅ |
| Target size with the real WCAG spacing rule | | ✅ |
| Claude reviews every screenshot for visual issues | | ✅ |
| Every issue screenshotted and outlined in red | | ✅ |
| Ranked Critical, Serious, Polish with VPAT verdicts | | ✅ |
| One shareable HTML report for clients or devs | | ✅ |

**[Get the full Accessibility Audit →](https://uxskillslab.gumroad.com/l/AccessibilityAudit)**

---

MIT licence. UX Skills Lab is independent and not affiliated with, endorsed by or sponsored by Anthropic. Claude and Claude Code are trademarks of Anthropic, PBC.
