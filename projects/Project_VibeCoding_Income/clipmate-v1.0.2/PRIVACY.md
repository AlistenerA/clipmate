# ClipMate v1.0.2 Privacy Policy

**Last updated: 2026-06-21**

## Overview

ClipMate clips content from pages selected by the user and saves it to the
user's Notion workspace or copies it as Markdown. Version 1.0.2 also provides
an optional License activation service for Pro entitlements.

ClipMate does not sell personal data, show advertising, use analytics or
telemetry, or continuously track browsing activity.

## Local browser data

The following data is stored in `chrome.storage.local`:

- Notion Integration Token and configured Notion targets.
- Default tags, local drafts, local clipping history and UI settings.
- A random installation/device identifier.
- When Pro is activated: a short-lived License Token, plan, feature list,
  activation time, last successful verification time, expiry and device counts.

The complete License Key is not stored after activation. Removing the extension
removes its local browser storage.

## Data sent to Notion

Only after the user explicitly saves a clip, ClipMate sends the selected page
title, URL, tags, notes, extracted content, Markdown structure and selected
external media URLs directly to `https://api.notion.com`. The user's Notion
Token is sent only to Notion's official API.

For supported Xiaohongshu notes and Baidu Tieba topics, extracted content may
include the visible post author, post text, image URLs and up to 50 visible
comments or replies, including visible commenter names, text, dates and image
URLs. This content is processed only for the page the user explicitly clips.

## Data sent to the ClipMate License service

Only when the user activates, refreshes or deactivates a License, the Background
Service Worker communicates over HTTPS with `https://license.cydl.site`.
Staging builds may use `https://cydl.site` and are not distributed publicly.

The License service receives:

- The License Key during activation only.
- A random device identifier and limited browser/extension version information.
- The request IP address, retained only as the latest IP on the active device row.
- A short-lived signed Token during refresh or deactivation.

The License service does **not** receive page DOM, page content, selected text,
Markdown, tags, notes, clipping history, Notion Token or Notion Page IDs.

## Local page processing

Content extraction, page awareness, AI-conversation extraction, code language
detection, social-post extraction, Tutorial Mode and Asset Picker run locally.
Social-post extraction reads only the currently rendered page DOM; it does not
call private site APIs or read cookies. ClipMate does not send page content to
an AI service, classification service or analytics endpoint. It does not
download videos, fetch subtitles or load remote code.

## Security and retention

- Notion and License API communications use HTTPS.
- License Tokens expire after 24 hours. A maximum seven-day offline grace is
  derived from the last successful verification time stored locally.
- The License database stores the current active-device record. Deactivation
  removes that device record and frees its device slot.
- Service logs do not include request bodies, License Keys or Tokens.
- Application code does not print Notion Tokens, full page text, complete notes
  or complete Markdown to the browser console.

## User controls

Users can clear local history, disable history, delete individual entries and
Notion targets, deactivate the current License device, or uninstall ClipMate.

## Children and changes

ClipMate is not intended for children under 13. Policy changes are reflected in
the extension listing and this document.

For privacy questions, use the GitHub repository issues page.
