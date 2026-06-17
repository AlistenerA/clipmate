# ClipMate Release And QA Checklist

Use this reference when preparing a completed version, debugging browser behavior, or deciding whether a feature is release-ready.

## Browser Extension QA

- Load the built extension from the active version output.
- Open the popup on a normal article page.
- Verify full-page extraction, selection extraction, preview/original tabs, copy Markdown, tag editing, note editing, and draft restore.
- Verify options page settings, Notion target CRUD, default target selection, history filter, history delete, and retry.
- Check console errors for popup, options, content script, and background/service worker.
- For image features, test at least one article with relative image URLs, one with captions, one with lazy images, and one with broken or unsupported image URLs.
- For Notion save changes, verify a real Notion append if credentials and test page are available.

## Command QA

Run from the active version directory:

```pwsh
npm run lint
npm run test
npm run build
```

If sandboxing blocks a command, request escalation for that exact command. If approval is denied or unavailable, mark the command as not verified.

## Documentation QA

Update these version docs when relevant:

- `docs/CURRENT_STATUS.md`
- `docs/CHANGELOG_AGENT.md`
- `docs/TEST_LOG.md`
- `docs/ISSUES.md`
- `docs/DECISIONS.md`

For project-level workflow or memory changes, update:

- `docs/CODEX_MIGRATION.md`
- `docs/PROJECT_ARCHITECTURE.md`
- `docs/PROJECT_MEMORY.md`

## Release Closure

- Confirm the active version directory is the only code surface intended for the release.
- Build or refresh the local archive artifact using the project's version convention.
- Review `git status --short`.
- Stage explicit paths only.
- Commit with a version-scoped message.
- Push to GitHub or open/update a PR according to the user's instruction.
