# ClipMate v0.9.3 Review Checklist

## Build checks

- [x] Version frozen at 0.9.3; no release-scope feature additions.
- [x] npm lockfile is present and npm scripts were used.
- [x] `npm run lint` passed.
- [x] `npm run test` passed: 64 files, 2043 tests.
- [x] `npm run build` passed: 171 modules transformed.
- [x] Submission `extension/` was created from the fresh production `dist/` output; the two generated HTML entry points were moved to the package root and their manifest paths updated so no development-named `src/` wrapper remains.
- [x] No source maps are present.

## Manifest checks

- [x] `manifest_version` is 3.
- [x] `version` is 0.9.3.
- [x] Popup, Options, service worker, content script, icons, and packaged model paths exist.
- [x] Content Security Policy is the Manifest V3 default; no remote script origin is added.
- [x] No externally hosted executable code or dynamic remote-code loader was found.

## Permission checks

- [x] `storage` is used for settings, token, targets, draft, and optional local history.
- [x] `activeTab` is used for the user-opened Popup's current-tab workflow and tab-aware draft association.
- [x] `<all_urls>` content-script access is required because ClipMate clips user-chosen webpages across sites.
- [x] `https://api.notion.com/*` is the only remote API host permission.
- [x] No `tabs`, `scripting`, `downloads`, `cookies`, `identity`, `history`, `bookmarks`, `webRequest`, or declarative network permission is declared.

## Privacy checks

- [x] Local storage fields and their purposes are disclosed.
- [x] Data sent to Notion is disclosed by category and purpose.
- [x] Transfer occurs only after a user-initiated Notion save.
- [x] No ClipMate-operated server, telemetry, advertising, or external AI processing is used.
- [x] Local history controls and data-removal controls are documented.
- [x] Remote code is not used.
- [ ] Publish the privacy policy at a stable public HTTPS URL and enter it in both store portals.

## Sensitive-content checks

- [x] No `.env` file is included.
- [x] No credential value, secret, private key, personal account, or local absolute path is included.
- [x] No development-agent configuration, session file, internal plan, development log, test artifact, or screenshot is included.
- [x] No `node_modules`, source tree, tests, internal docs, repository metadata, or log file is included.
- [x] Credential-related words in the public documents are explanatory text only and contain no credential values.

## Testability checks

- [x] Reviewer steps cover full-page clipping, selection clipping, structured clipping, Markdown copy, Asset Picker, Options, targets, and history.
- [x] Notion integration steps explain that the reviewer should use a reviewer-controlled integration and page.
- [x] Empty/configuration and API failure behavior is documented.
- [x] Known limitations are disclosed without promising unsupported behavior.

## Zip structure checks

- [x] Zip root directly contains `manifest.json`.
- [x] Zip root does not contain an extra parent directory.
- [x] Zip contains only files from `extension/`.
- [x] Zip contains no `node_modules`, source tree, tests, internal docs, `.env`, repository metadata, log, screenshot, or source map.
- [x] Zip entry paths contain no parent traversal or absolute paths.

## Manual unpacked-extension verification

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable Developer mode.
3. Select "Load unpacked" and choose the submission `extension/` directory.
4. Confirm ClipMate 0.9.3 loads without a manifest error.
5. Exercise the reviewer steps in `STORE_LISTING_DRAFT_v0.9.3.md`.
6. Inspect Popup, Options, content-script, and service-worker consoles for errors.
7. Remove all reviewer credentials and test data when finished.

## Remaining human gates

- [ ] Smoke-test the exact submission directory in current stable Chrome.
- [ ] Smoke-test the exact submission directory in current stable Microsoft Edge.
- [ ] Complete one real save to a reviewer-controlled Notion page.
- [ ] Prepare portal screenshots and promotional assets.
- [ ] Publish and enter the privacy-policy URL and support contact.
