# ClipMate v0.9.3 Release Notes

- Version: 0.9.3
- Release date: 2026-06-20
- Platforms: Google Chrome and Microsoft Edge (Manifest V3)
- Status: frozen store-submission build

## User-visible features

- Clip a full webpage, the current text selection, or tutorial-style structured content.
- Recommend suitable clipping modes locally from the current page type while keeping every mode manually selectable.
- Extract ordered conversations from supported ChatGPT, DeepSeek, and Doubao pages, including role-aware selection clipping.
- Preserve headings, paragraphs, links, lists, code blocks, formulas, tables, images, captions, and supported video links when the source page exposes them.
- Clean common navigation, advertising, control, and duplicate-content noise before Markdown generation.
- Copy clips as Notion-oriented, Obsidian-oriented, Typora-oriented, or generic Markdown.
- Select additional page images with the on-page Asset Picker, then preview, remove, or reorder them before saving.
- Save content to one of multiple user-configured Notion target pages.
- Add a title, tags, and a note before copying or saving.
- Keep an optional local history with search, Markdown copy, failed-save retry, single-item deletion, and clear-all controls.

## Fixes and improvements

- Fixed fenced-code language enhancement so closing fences and adjacent content remain in the correct order.
- Prevented selection drafts from one tab from being restored into another tab with the same URL.
- Improved page-aware recommendations for technical articles, GitHub discussions, videos, navigation pages, and supported AI conversations.
- Added multiple full-page extraction candidates with a quality gate that rejects candidates losing headings, code, lists, tables, formulas, or images.
- Replaced broad noise-class matching with precise token and role checks to reduce accidental body-content removal.
- Kept the existing extraction path as a fallback when a newer candidate is lower quality.

## Permissions and network behavior

- No permissions were added for v0.9.3.
- The extension uses `storage`, `activeTab`, a content script on user-visited webpages, and host access only to `https://api.notion.com/*`.
- All extension JavaScript, styles, icons, and the optional local code-language model are packaged with the extension.
- The extension does not remotely download or execute code.

## Known limitations

- Notion setup uses a manually supplied integration token; OAuth is not supported.
- Only Notion is supported as a direct save destination.
- External images are saved by URL. Images blocked by hotlink protection, authentication, expiry, or Notion's external-image rules may not render.
- The extension does not download or upload image bytes, capture screenshots, run OCR, fetch subtitles, or download video.
- Video support stores link metadata; embedded playback support depends on Notion and the video provider.
- Login walls, closed shadow DOM, heavily virtualized content, and late dynamic rendering can reduce extraction completeness.
- Complex merged tables may not be reproduced exactly.
- AI summaries, AI-generated tags, database property mapping, and cloud sync are not included.

## Verification

- `npm run lint`: passed.
- `npm run test`: 64 test files and 2043 tests passed.
- `npm run build`: passed; 171 modules transformed.
- Generated manifest: Manifest V3, version 0.9.3.
- Store package contains only the loadable extension output and has `manifest.json` at the zip root.
