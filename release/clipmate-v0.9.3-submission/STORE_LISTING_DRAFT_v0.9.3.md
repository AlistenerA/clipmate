# ClipMate v0.9.3 Store Listing Draft

## Product name

ClipMate - Web Clipper for Notion

## One-line introduction

Clip webpages, selections, structured tutorials, and selected images to Notion or clean Markdown.

## Short description

Save webpages to Notion with full-page, selection, tutorial, image-picker, Markdown, and local-history tools.

## Detailed description

ClipMate is a Chrome and Edge extension for turning content from the current webpage into editable Markdown and saving it to a user-selected Notion page.

The Popup lets the user choose full-page, selection, or tutorial-style clipping. A local page-awareness feature can recommend a suitable mode for articles, technical pages, discussions, search and navigation pages, videos, and supported AI conversation pages. Recommendations are optional and every clipping mode remains available to the user.

ClipMate cleans common page controls and navigation noise, then preserves useful structure such as headings, links, lists, code blocks, formulas, tables, images, captions, and supported video links. Users can edit the clip title, tags, and note, choose a Markdown target profile, copy the result, or save it to Notion.

The Asset Picker lets the user explicitly select additional images from the current page. The Options page supports a Notion integration token, multiple target pages, a default target, default tags, and optional local history. History supports local search, Markdown copy, failed-save retry, deletion, and clear-all.

ClipMate has no advertising, telemetry, analytics, cloud sync, or ClipMate-operated backend. It does not use an external AI service. All executable code and the optional local code-language model are included in the extension package.

## Permission justification

### `storage`

Stores the user's settings, masked-input Notion integration token value, configured Notion targets, default tags, current clip draft, optional clipping history, and UI preferences in `chrome.storage.local`. This data is needed to restore user configuration and support local history and retry.

### `activeTab`

Used after the user opens the ClipMate Popup to identify the active tab, associate drafts with the correct tab, and exchange clipping messages with the content script for that tab. ClipMate does not use this permission for background browsing surveillance.

### Content script access on `<all_urls>`

ClipMate is a general webpage clipper, so the content script must be available on webpages the user chooses to clip. It reads the current page DOM only to extract content, detect the page type locally, and run the user-invoked Asset Picker. Browser-restricted pages such as store pages and internal browser URLs remain inaccessible.

### Host access to `https://api.notion.com/*`

Required only to send a user-initiated clip to the official Notion API. No other remote API host is declared.

## Privacy and data use

ClipMate does not send data to a ClipMate-operated server and does not sell or share user data for advertising, analytics, or profiling.

The following data may be stored locally in the browser:

- Notion integration token and target page identifiers.
- User settings, default tags, and UI preferences.
- Current draft, including page title, URL, selected or extracted content, Markdown, tags, note, and selected external image URLs.
- Optional history entries used for search, copy, review, deletion, and retry.

When the user explicitly selects "Save to Notion", ClipMate sends directly to `https://api.notion.com`:

- The configured Notion authentication token and target page identifier.
- The clip title and source URL.
- User-entered tags and note.
- Extracted or selected page content and its supported structure.
- External image URLs and supported video links included in the clip.

This transfer is necessary to provide the requested Notion save. ClipMate does not place an intermediate server between the browser and Notion. Users can disable history, delete individual history entries, clear all history, remove configured targets, clear settings, or uninstall the extension to remove local extension data. Notion's own terms and privacy policy apply to data sent to Notion.

ClipMate does not read cookies, collect browsing history, use remote code, download page media, or send page content to an external AI service.

## Reviewer test steps

1. Load the `extension` directory as an unpacked Manifest V3 extension in Chrome or Edge.
2. Open a normal public article page containing headings, paragraphs, links, and at least one image.
3. Open ClipMate. Confirm a preview appears and that Full Page, Selection, and Tutorial/Adaptive choices remain reachable.
4. Edit the title, add a tag and note, choose a Markdown target, and select "Copy Markdown". Paste into a text editor and verify title, source URL, edited metadata, and body structure.
5. Select text on the webpage, reopen ClipMate, choose Selection, and verify only the selected content is prepared.
6. On a public technical article, choose the tutorial-style mode and verify code blocks, headings, lists, formulas, tables, or media links are preserved when present in the source.
7. Select "Choose page images", choose a visible eligible image on the page, finish selection, reopen the Popup, and verify the image can be previewed, removed, or reordered.
8. Open Options. Confirm a Notion token can be entered, targets can be added/edited/deleted, one target can be made default, default tags can be changed, and local history can be disabled.
9. With local history enabled, perform a successful Markdown copy. Open Options > Clipping History and verify search, copy, and delete. Retry is available for failed Notion-save records.
10. To test Notion saving, use a reviewer-controlled Notion integration and test page, connect the integration to that page, enter the token and page identifier in Options, then save a clip. Verify blocks are appended to the selected page.
11. Remove the test token and targets with "Clear configuration" after testing.

## Expected failure and empty states

- Without a configured Notion token or target, saving shows a configuration message and directs the user to Options.
- On browser-internal or extension-store pages, browser policy prevents content-script access; ClipMate cannot clip those pages.
- If the source page has no user selection, Selection mode reports or falls back according to the current draft state rather than inventing content.
- If Notion rejects a request, ClipMate shows a short mapped error and allows a failed history item to be retried.

## Known limitations

- Manual Notion integration token setup; no OAuth.
- No direct save targets other than Notion.
- No AI summary, AI tags, OCR, screenshot fallback, video download, subtitles, or database property mapping.
- External images can fail because of source-site restrictions or expired URLs.
- Login walls, virtualized views, closed shadow DOM, and late dynamic content can limit extraction.
- Complex merged tables may lose some layout fidelity.

## Suggested category and keywords

- Category: Productivity
- Keywords: Notion, web clipper, Markdown, webpage capture, notes, article saver, productivity

## Required portal fields still supplied outside the package

- Bilingual privacy-policy source: `PRIVACY_POLICY_v0.9.3.md` in this submission directory.
- Public privacy-policy URL.
- Support URL or support email.
- Store icons and screenshots required by each portal.
- Reviewer-controlled Notion credentials if the portal requests authenticated integration testing.
