---
name: xiaoyuzhou-transcriber
description: Transcribe Xiaoyuzhou podcast episode URLs into clean local Markdown with local Whisper ASR, model-based text cleaning/audit, metadata-derived host/guest names, semantic speaker labels, and a clean final output folder.
metadata:
  version: 1.0.5
  requires-cli: ">=1.3.9"
---

# Xiaoyuzhou Transcriber

## Purpose

Use for `xiaoyuzhoufm.com/episode/...` links when the user wants readable Markdown from an episode. The workflow keeps raw transcription faithful, uses local ASR, and uses API models only for text cleanup, audit, and semantic speaker segmentation.

## Workflow

Use the global CLI from the directory where final documents should be saved:

```bash
neo-link-reader-transcribe-xiaoyuzhou "https://www.xiaoyuzhoufm.com/episode/..."
```

Or pass a save root explicitly:

```bash
neo-link-reader-transcribe-xiaoyuzhou --output-root "/path/to/library" "https://www.xiaoyuzhoufm.com/episode/..."
```

On first setup, ask the user where the final document library should live, resolve their natural-language answer to an absolute local path, and remember it:

```bash
neo-link-reader-config --set-output-root "/path/to/library"
```

If the folder does not exist, the config command creates it.

The save root is `--output-root`, then `LINK_READER_OUTPUT_ROOT` from the user's global config or shell, then the current working directory. If no default save root is configured and the user has not said where to save, ask once, resolve the answer to an absolute path, and run `neo-link-reader-config --set-output-root ...` before launching a long background transcription.

For normal full episodes, always run this in the background with `screen`, `tmux`, `nohup`, or the host agent's background-job mechanism. Write logs under `.transcribe-work/runs/`, then report the session/log path so the user can continue the conversation while ASR, cleaning, audit, and speaker finalization run.

Do not run a full episode transcription in the foreground. After launching, verify within a few seconds that the background process is still alive and that the log has started. If the background launch exits immediately, inspect the log/process state, fix the background command, and relaunch in the background. If background execution cannot be made to work quickly, stop and report the blocker instead of falling back to a foreground long run.

Default stages:

1. Parse Xiaoyuzhou metadata, including title, duration, audio URL, episode description, shownotes, host profiles, and guest profiles.
2. Download and normalize audio; verify normalized duration is complete.
3. Run local `whisper-cli` medium model. This consumes local compute, not API tokens.
4. 在 ASR 流式产出时，使用基础清洗模型清理转写片段。
5. Run search if a provider is configured; otherwise preserve `〔不确定〕`.
6. 对高风险片段做文字审核，优先使用高质量复核模型；缺失时使用基础清洗模型，并用中文说明质量可能下降。
7. 做说话人整理，优先使用高质量复核模型；缺失时使用基础清洗模型。有元数据确认的主播/嘉宾姓名时优先使用；否则使用 `主持人` / `嘉宾`。
8. Run speaker repair on suspicious mixed turns with the same model fallback rule.
9. Save only the final Markdown to `<save-root>/小宇宙文档/`; clean `<save-root>/.transcribe-work/` after success.
10. If the same source URL already exists in a final Markdown document, report the existing document path and skip duplicate extraction.

## Important Guarantees

- Do not generate SRT/subtitles.
- Do not let the speaker finalizer rewrite text; it only cuts speaker turns.
- Speaker names come from structured page data, shownotes semantics, and the opening transcript when clear. Explicit shownotes phrases such as `本期主播 X` and `嘉宾是 A 和 B` take priority over broad keyword guesses. If not clear, use `主持人` or `嘉宾`; uncertain turns use `UNKNOWN`.
- Text audit applies local exact replacements from model-returned diffs; it should not accept freeform rewritten paragraphs.
- Evidence-poor corrections remain marked `〔不确定〕`.

## Commands

Preflight:

```bash
neo-link-reader-preflight
```

Run with normal defaults:

```bash
neo-link-reader-transcribe-xiaoyuzhou "$URL"
```

Background example:

```bash
mkdir -p .transcribe-work/runs
screen -dmS "xy-<episode-id>" sh -lc 'neo-link-reader-transcribe-xiaoyuzhou "$URL" > ".transcribe-work/runs/xy-<episode-id>.log" 2>&1'
```

When checking progress, inspect whether the background process is still running, summarize latest ASR progress lines, live clean chunk count, runtime/memory metadata if available, and final Markdown path if completed.

Useful options:

```bash
--no-search
--keep-work
--output-root "/path/to/library"
--host-names 主持人姓名
--speaker-names 嘉宾姓名
--text-audit-model auto
--text-audit-max-items 120
--no-text-audit
--finalizer-batch-size 3
--clean-concurrency 3
--review-concurrency 2
--finalizer-model auto
--speaker-repair-model auto
```

For an existing Markdown document, test text audit without rerunning ASR:

```bash
neo-link-reader-audit-md "小宇宙文档/<file>.md" --max-items 20
```

Add `--apply` only after reviewing the proposed changes.

## Setup

For dependencies, env vars, and sharing notes, read the top-level skill reference: `skills/link-reader/references/configuration.md`.
