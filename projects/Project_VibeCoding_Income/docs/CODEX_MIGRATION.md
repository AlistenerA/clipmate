# ClipMate Codex Migration Workflow

Last updated: 2026-06-20.

This document converts the earlier opencode workflow into a Codex-native workflow for continuing the Chrome and Edge extension project. It is intentionally operational: future Codex sessions should use it to decide what to read, what to verify, and when a version is ready to archive and push.

## Current Baseline

- Active product: ClipMate, a Manifest V3 browser extension for clipping web content into Notion.
- Current frozen version: `clipmate-v0.9` v0.9.3 on `codex/clipmate-v0.9-page-aware`.
- Current store archive: `release-submissions/clipmate-v0.9.3-submission/` with a minimal 26-entry upload zip.
- Current automated snapshot: v0.9.3 passes lint, 64 files / 2043 tests, build, and isolated Playwright Popup interaction QA.
- Frozen release baseline: `clipmate-v0.8` v0.8.5.
- Frozen historical versions: `clipmate-v0.1` through `clipmate-v0.4`; use them for comparison only.
- `clipmate-v0.5` was promoted/renamed to `clipmate-v0.6` by explicit user instruction.
- Reference code: `other source/`; treat all files there as read-only design references, not as code to copy blindly.
- Historical planning material exists under the archived ChatGPT/session files. Use it for intent and lessons learned, but let the current code and current docs win when they conflict.

## Codex Tooling

Codex should prefer these capabilities for this project:

- `extension-principal-engineer`: senior browser-extension workflow, MV3 review, release checks, browser QA, GitHub push/PR, and remote server safety.
- `clipmate-codex-workflow`: repo-level skill created for this project. It should trigger for ClipMate feature work, bug reports, release prep, or reference-plugin comparisons.
- `openai-docs`: Codex/OpenAI product documentation and official Codex behavior.
- `playwright` or `playwright-interactive`: browser DOM inspection, popup/options UI checks, content-script behavior, console/network debugging, screenshots, and extension runtime QA.
- GitHub skills/apps: commits, pushes, PRs, CI debugging, and review-comment follow-up.
- Security skills: only when permissions, tokens, storage, remote calls, or threat modeling are explicitly in scope.

The project `.codex/config.toml` raises project-doc context size and includes disabled MCP templates for Playwright and Context7. They are disabled by default so Codex startup does not depend on network access. Enable them only after confirming the packages are available or the session has approval to download them.

## Research Rules

- Browser extension behavior, Notion API behavior, browser APIs, library changes, and MCP setup can change; verify against primary documentation when accuracy matters.
- Prefer official sources: Chrome Extensions docs, Microsoft Edge Add-ons docs, MDN, Notion API docs, package docs, and upstream GitHub repositories.
- Use normal web/document fetching for static documentation. Use Playwright only when the page requires interaction, dynamic DOM inspection, screenshots, or runtime debugging.
- For source examples from `other source/`, read architecture and behavior patterns; do not transplant code without checking license, compatibility, and project conventions.

## Development Loop

1. Orient first.
   - Check `git status --short`.
   - Identify the active version directory and whether the task affects code, UX, permissions, storage, tests, docs, build output, archive output, or GitHub state.
   - Read the active version docs, currently `clipmate-v0.9/docs/CURRENT_STATUS.md`, `AGENT_CONTEXT.md`, `ISSUES.md`, `DECISIONS.md`, and relevant source files before editing.

2. Accept user input in the lightweight future mode.
   - The user will usually provide feature ideas, bug descriptions, screenshots, or reference code.
   - Convert that input into concrete tasks, then inspect the current code path that owns the behavior.
   - Ask only when a missing decision is risky and cannot be inferred from local context.

3. Implement narrowly.
   - Preserve existing architecture and local style.
   - Keep extension permissions minimal.
   - Do not change old version directories unless the user explicitly asks.
   - Do not stage or revert unrelated dirty files such as historical opencode config changes.

4. Verify.
   - Run focused tests for the changed area.
   - Run `npm run lint`, `npm run test`, and `npm run build` in the active version before calling a version complete.
   - Use Playwright or screenshots for real popup/options/content UI changes.
   - If sandboxing blocks test/build on Windows, request escalation for the exact command. If approval fails, record the command as unverified instead of silently replacing it with a weaker check.

5. Update docs.
   - For each meaningful development round, update the active version docs: `CURRENT_STATUS.md`, `CHANGELOG_AGENT.md`, `TEST_LOG.md`, `ISSUES.md`, and `DECISIONS.md` when relevant.
   - Update project-level docs here only when workflow, architecture, or durable project memory changes.

6. Release a completed version.
   - Confirm lint, tests, build, and browser QA appropriate to the changed surface.
   - Create or update the local archive artifact using the project convention.
   - Review Git status and stage only intentional files.
   - Commit and push to GitHub when the user says the version is complete or the standing instruction clearly applies.
   - Prefer a PR for reviewable work unless the user asks for direct push to the release branch.

## Version Policy

- Development iterations should not auto-commit every small edit.
- Completed versions must have a local archive plus GitHub push.
- Use explicit staging, never `git add .`.
- Keep `other source/`, `.opencode/`, `.playwright-mcp/`, `.wolf/`, and generated scratch artifacts out of release commits unless the user explicitly says they are part of the deliverable.
- When creating the next version, first create/switch to a new `codex/` branch, then copy forward from the current stable version into a new isolated directory such as `clipmate-v0.7`, then make version-local changes there.
- Completed publishable major versions should keep a local zip archive, but generated zip files remain untracked unless the user explicitly asks to commit release artifacts.

## Remote Server Policy

Only configure remote servers when the user provides a target or an existing SSH host alias is already configured. Before changing a server:

- Confirm the host alias and purpose.
- Inspect current state before editing files.
- Back up config files before changing them.
- Avoid printing secrets.
- Verify service status and logs after changes.

Codex App remote SSH work requires a concrete host alias in `~/.ssh/config`, successful `ssh <host>`, Codex installed and authenticated on the remote host, and the host enabled in Codex Settings > Connections.

## Current Verification Snapshot

On 2026-06-20, while preparing v0.9.3 for manual acceptance:

- `npm run lint` passed.
- `npm run test` passed with 64 test files and 2043 tests.
- `npm run build` passed with 171 transformed modules and manifest 0.9.3.
- The isolated submission zip has one root manifest, no forbidden entries or unsafe paths, and SHA-256 `CE507BAF3E80E07F6EE778FDCCD6DDA0264F0651924FD67BCCFB5DA966318226`.
- Playwright verified adaptive first-load selection, single recommendation messaging, all-mode expansion, manual full-page override, and zero application console errors.
- Real Chrome/Edge and Notion acceptance remain open because the Windows session could not attach the user's Chrome process.

On 2026-06-19, while completing v0.9.0:

- `npm run lint` passed.
- `npm run test` passed with 62 test files and 2028 tests.
- `npm run build` passed with 168 transformed modules.
- Playwright verified the real built Popup for video recommendation, first-load auto-apply, all-mode expansion, and persistent user override.
- In-app Browser could not start under the Windows process policy; Playwright CLI was used as the documented fallback.

On 2026-06-18, while preparing the v0.7 automated release candidate:

- `npm run lint` in `clipmate-v0.7` passed.
- `npm run test` passed with 53 test files and 1966 tests after approved Windows sandbox escalation.
- `npm run build` passed with 132 transformed modules.
- Browser automation could not start because the Windows sandbox rejected the browser process; use `clipmate-v0.7/docs/V0.7_MANUAL_RISK_QA.md` for the remaining Chrome/Edge/Notion gate.
