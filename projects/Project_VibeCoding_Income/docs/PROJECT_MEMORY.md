# ClipMate Project Memory

Last updated: 2026-06-21.

Use this as the compact handoff for future Codex sessions.

## Identity

ClipMate is a Chrome and Edge extension for clipping webpages into Notion. The user is migrating development from opencode to Codex and wants future work to proceed from lightweight natural-language input: feature ideas, bug descriptions, screenshots, or reference code placed under `other source/`.

## Standing Preferences

- Reply to the user in Chinese unless there is a strong reason to quote English source text.
- Treat the user as product owner and Codex as the engineering owner for implementation, verification, docs, and release hygiene.
- Prefer decisive implementation once enough context is available.
- Preserve all user changes and avoid reverting unrelated dirty files.
- Use explicit Git staging. Never stage everything casually.
- Completed versions require local archive plus GitHub push.
- During ordinary development, do not create surprise commits before the user confirms the version or work slice is ready.

## Current Code State

- Current release candidate: `clipmate-v1.0/` v1.0.1 on `codex/clipmate-v1-license`, with production License API at `license.cydl.site`.
- License Server v1.0.0 is deployed under `/opt/license-server`, using isolated Python 3.11, loopback Gunicorn, Nginx HTTPS, SQLite backups and Certbot renewal hooks.
- v1.0.1 passes lint, 68 files / 2058 tests, production and staging builds, Chrome 148 / Edge 149 extension QA, production API smoke, and production dependency audit with 0 vulnerabilities.
- Frozen version: `clipmate-v0.9` v0.9.3 on `codex/clipmate-v0.9-page-aware`; no further features enter this release.
- Store submission archive: `release-submissions/clipmate-v0.9.3-submission/`, including a minimal unpacked extension, root-manifest zip, release notes, listing draft, and review checklist.
- v0.9.1-v0.9.3 adds tab-aware drafts, stateful code fences, multi-signal page candidates, ChatGPT/DeepSeek/Doubao conversation extraction, GitHub discussion routes, and quality-gated full-page candidates.
- Recommendations are local, explainable, optional, and user-overridable; they store no raw detector signals, DOM, body text, selection text, or URL.
- v0.9.3 passes lint, 64 files / 2043 tests, build, and isolated Playwright Popup interaction covering adaptive auto-apply, recommendation deduplication, mode expansion, and user override.
- `clipmate-v0.8` is frozen at v0.8.5; its branch was pushed after completing structure, image semantics, hybrid code detection, Asset Picker interaction, and History fixes.
- v0.7 goal: Tutorial Mode with a versioned `ClipDocument` and native Notion structure mapping.
- v0.7 automated candidate passes lint, 53 files / 1966 tests, and build; Chrome/Edge plus real Notion QA remains for the user.
- `clipmate-v0.6` is the frozen v0.6 Asset Pipeline release directory and has a local untracked archive.
- `clipmate-v0.1` through `clipmate-v0.4` should remain frozen unless explicitly requested.
- `clipmate-v0.5` was promoted/renamed to `clipmate-v0.6` at the user's request, so there is no standalone v0.5 directory after this migration.
- `other source/4.0.13` exists as reference code and should remain read-only input.

## Current Git Awareness

At migration time, `git status --short` showed:

- `M ../../AGENTS.md`: Codex/extension workflow guidance added earlier in the wider repo.
- `M ../../opencode.json`: pre-existing opencode config modification; do not stage unless the user explicitly asks.
- `?? other source/`: reference code folder.
- `?? 测试文档/`: existing test/reference documents.

Future sessions should re-check status before editing because this can change.

## Tool Notes

- `rg` is preferred, but in this Windows Codex environment `rg.exe` previously failed with access denied. Fall back to PowerShell `Get-ChildItem` and `Select-String` when needed.
- Python may not be available as `python` on PATH. Codex bundled Python exists at `C:\Users\20499\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
- `npm run test` and `npm run build` may hit sandbox access errors on Windows because Vite/Vitest attempt to inspect parent directories. Request escalation for the exact npm command if that happens.
- Optional MCP templates are in `.codex/config.toml` but disabled by default.
- Browser DOM and extension UI checks should prefer the in-app Browser; current Windows policy blocks that process, while the Playwright CLI fallback works.
- Documentation research should use official docs and primary sources; use Context7 if enabled and relevant.
- Remote server work requires a configured SSH host alias and explicit target from the user.

## Main Risks To Remember

- MV3 background service worker lifetime and async `sendResponse` behavior are easy to regress.
- Notion token, page ID, and history data are sensitive; never print secrets.
- Extension permissions should remain minimal.
- Image saving remains URL-only; video support is link metadata only. Do not quietly introduce binary upload, downloading, subtitles, or caching.
- Reference plugin code can guide design but should not be copied blindly.
- Pure function tests are not enough for popup/background/content-script integration; verify the actual end-to-end route when behavior changes.

## Next Likely Work

- Run Chrome and Edge unpacked smoke against the exact submission directory plus a real Notion test-page save before portal upload.
- Keep v0.8 and earlier directories frozen; normal follow-up changes enter `clipmate-v0.9`.
- Complete real Chrome/Edge/Notion acceptance against Bilibili, Runoob, GitHub Issue, Bing, and three AI conversation sites.
- Evaluate a separate video-collection data model only in v0.9.x; do not mix subtitles, private APIs, cookies, downloads, or DRM into the current mode recommender.
- Review known watch-list items in `docs/PROJECT_ARCHITECTURE.md` when those surfaces are touched.
