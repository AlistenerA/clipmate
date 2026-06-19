# ClipMate Project Memory

Last updated: 2026-06-19.

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

- Active version: `clipmate-v0.8` v0.8.2 on `codex/clipmate-v0.8-asset-picker`.
- v0.8.0 adds the Asset Picker: an in-page session overlay plus current-draft image preview, removal, ordering, Markdown integration, and tutorial Notion block integration.
- v0.8.1 fixes Asset Picker result recovery, Popup handoff, mode cleanup, and overlay-card clicks found in human QA.
- v0.8.2 fixes Runoob code class retention, numbered headings, native Notion lists, and empty image captions.
- v0.8.2 passes lint, 58 files / 1998 tests, build, and local fixture HTTP smoke; Chrome/Edge plus real Notion retest remains for the user.
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
- Browser DOM and extension UI checks should use Codex Playwright skills or an enabled Playwright MCP.
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

- Retest `clipmate-v0.8/docs/V0.8_TEST_DOCUMENT.md` against v0.8.2 in Chrome, Edge, and a real Notion test page.
- Keep all V0.8 commits on `codex/clipmate-v0.8-asset-picker`; older version directories remain frozen.
- Fix any P0 findings only inside `clipmate-v0.8` before marking human QA complete.
- Review known v0.5 watch-list items in `docs/PROJECT_ARCHITECTURE.md`.
- Use `other source/` to compare mature clipping, Notion, or browser-extension patterns.
- Add browser QA for real pages and real Notion saves before declaring the next version complete.
