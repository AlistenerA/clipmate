---
name: clipmate-codex-workflow
description: Continue ClipMate browser-extension development in Codex. Use when working on ClipMate feature ideas, bug reports, v0.5/v0.6 planning, Chrome or Edge extension code, Notion clipping behavior, reference plugin code under other source, browser DOM verification, release archives, GitHub push/PR flow, or project memory updates.
---

# ClipMate Codex Workflow

## Overview

Act as the engineering owner for ClipMate inside Codex. Convert lightweight product input into scoped implementation, verification, documentation, archive, and GitHub work while preserving historical version boundaries.

## First Reads

For any non-trivial ClipMate task, read these project-level files first:

- `docs/PROJECT_MEMORY.md`
- `docs/CODEX_MIGRATION.md`
- `docs/PROJECT_ARCHITECTURE.md` when architecture, bug triage, or planning is involved

Then read the active version docs that match the task:

- `clipmate-v0.5/docs/CURRENT_STATUS.md`
- `clipmate-v0.5/docs/AGENT_CONTEXT.md`
- `clipmate-v0.5/docs/ISSUES.md`
- `clipmate-v0.5/docs/DECISIONS.md`
- `clipmate-v0.5/docs/WORKFLOW_RULES.md`

When preparing a version release or browser QA, also read `references/release-and-qa.md`.

## Operating Loop

1. Check `git status --short` before editing.
2. Identify the active version directory and whether the task changes code, UX, permissions, storage, tests, docs, archive artifacts, or GitHub state.
3. Inspect current implementation paths before proposing or editing code.
4. Treat `other source/` as read-only reference input.
5. Implement narrowly using existing project patterns.
6. Verify with focused tests plus lint/test/build when the change is release-relevant.
7. Use Playwright or screenshots for popup, options, DOM, console, network, content-script, or extension runtime behavior.
8. Update version docs after meaningful work.
9. On version completion, archive locally, explicitly stage intentional files, commit, and push to GitHub.

## Engineering Rules

- Keep Manifest V3 permissions minimal and justified.
- Preserve service worker async message semantics.
- Avoid printing Notion tokens, page IDs beyond masked forms, or other secrets.
- Do not mutate old version directories unless explicitly requested.
- Do not stage unrelated opencode, Playwright, scratch, or reference-code changes.
- Prefer official docs for APIs and browser behavior that may have changed.
- If `rg` is unavailable or blocked, use PowerShell file traversal and text search.
- If npm test/build fails because of sandbox access restrictions, request escalation for the exact command and record any unverified command honestly.

## Versioning

Use `clipmate-v0.5` as the current base unless the user asks to start the next version. For the next version, copy from the current stable version into a new isolated folder and make changes there.

Development iterations do not need automatic commits. Completed versions do need a local archive and GitHub push under the user's standing instruction.
