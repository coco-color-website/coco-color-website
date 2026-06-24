---
name: wechat-article-archiver
description: Extract WeChat public-account article URLs from mp.weixin.qq.com/s into clean local Markdown, preserving title, account, publish time, body text, image links, and a tidy final output folder.
metadata:
  version: 1.0.4
  requires-cli: ">=1.0.4"
---

# WeChat Article Archiver

## Purpose

Use for `mp.weixin.qq.com/s/...` links when the user wants to read, archive, summarize, or save a WeChat public-account article locally. This supports both normal rich-media articles and WeChat text-only share pages whose body is stored in appmsg text fields instead of the usual article body container.

## Workflow

Use the global CLI from the directory where final documents should be saved:

```bash
neo-link-reader-import-wechat "https://mp.weixin.qq.com/s/..."
```

Or pass a save root explicitly:

```bash
neo-link-reader-import-wechat --output-root "/path/to/library" "https://mp.weixin.qq.com/s/..."
```

On first setup, ask the user where the final document library should live, resolve their natural-language answer to an absolute local path, and remember it:

```bash
neo-link-reader-config --set-output-root "/path/to/library"
```

If the folder does not exist, the config command creates it.

The script extracts:

- title
- account name
- publish time when present
- article body
- image URLs as Markdown image links

Final output goes to:

```text
<save-root>/公众号文档/<title>.md
```

Process files live under `<save-root>/.transcribe-work/公众号/` and are deleted after success unless `--keep-work` is used.
If the same source URL already exists in a final Markdown document, report the existing document path and skip duplicate extraction.

The save root is `--output-root`, then `LINK_READER_OUTPUT_ROOT` from the user's global config or shell, then the current working directory. If no default save root is configured and the user has not said where to save, ask once, resolve the answer to an absolute path, and run `neo-link-reader-config --set-output-root ...` before processing.

## Options

```bash
--keep-work
--save-html
--output-root "/path/to/library"
```

Use `--save-html` only for debugging extraction failures.

## Notes

- This workflow does not require ASR, Whisper, ffmpeg, or model API keys.
- Normal rich-media articles use the `js_content` body container; text-only share pages fall back to `content_noencode` / `content` appmsg fields.
- Some WeChat pages may block anonymous fetches or require logged-in browser access. If extraction fails, report the failure and use a browser/cookie-based fallback if the environment provides one.
- Do not download images unless the user asks; preserve original image links in Markdown.
