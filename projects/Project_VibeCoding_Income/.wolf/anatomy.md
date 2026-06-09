# Project Anatomy · VibeCoding_Income

> Research and planning project for Vibe Coding monetization strategies.
> Generated 2026-06-09 · 5 source files · ~9.5K tok total

---

## /

- `vibecoding_实操方案.md` -- Comprehensive Vibe Coding monetization guide: 6 validated revenue directions (B2B SaaS, Chrome extensions, AI wrappers, templates, freelancing, content), 30-day execution plan, and tech stack recommendations (~2000 tok)

---

## 选题分析/

- `Chrome插件选题分析报告.md` -- Chrome Web Store market research: scraped ratings/user counts for writing, screenshot, PDF translate, web-to-notion, and screenshot-blur plugins. Recommends two gold opportunities (AI Web Clipper for Notion/飞书 and AI Document Translator) with pricing, revenue projections, and competitive analysis (~2300 tok)
- `Notion Web Clipper 选题分析报告.md` -- Deep-dive competitor analysis of Notion Web Clipper (official) from Zhihu/Weibo/Xiaohongshu. Enumerates 7 pros, 7 cons, compares against Save to Notion/简悦/Cubox, and suggests 5 content topic angles for a potential product (~1400 tok)

---

## .opencode/plugins/

- `token-monitor.ts` -- Background plugin (bun:sqlite + @opencode-ai/plugin SDK) that silently tracks per-session token usage and cost from opencode's SQLite DB, writes cumulative stats to ~/.config/opencode/token-stats.json. Supports DeepSeek v4-pro/v4-flash pricing with cache-hit awareness (~3000 tok)

---

## .opencode/

- `.gitignore` -- Ignores node_modules, package.json, package-lock.json, bun.lock (~5 tok)
- `package-lock.json` -- NPM lockfile pinning @opencode-ai/plugin v1.16.2 and its dependency tree (~500 tok meaningful)

---

## .playwright-mcp/

> Auto-generated browser automation artifacts (console logs, page YAML snapshots). Not source code; regenerated on each Playwright session.

## .wolf/

- `.wolf\anatomy.md` -- > Research and planning project for Vibe Coding monetization strategies. (~446 tok)
