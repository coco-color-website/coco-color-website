---
name: link-reader
description: Route supported Chinese content links into clean local Markdown. Use when the user gives a URL and wants it read, imported, transcribed, archived, or saved locally, especially Xiaoyuzhou episode links and WeChat public-account article links.
metadata:
  version: 1.0.6
  requires-cli: ">=1.3.9"
---

# Link Reader

## Purpose

Use this as the top-level router when the user drops a supported link and wants a local Markdown document. It detects the source type and runs the matching workflow:

- Xiaoyuzhou episode: parse metadata and shownotes for host/guest candidates, download audio, local ASR, text audit, semantic speaker turns, save to `小宇宙文档/`.
- WeChat article: extract article metadata/body/images, save to `公众号文档/`.

## Quick Start

Use the global CLI from the folder where the final document folders should live:

```bash
neo-link-reader "https://www.xiaoyuzhoufm.com/episode/..."
neo-link-reader "https://mp.weixin.qq.com/s/..."
```

Or specify the save root explicitly:

```bash
neo-link-reader --output-root "/path/to/library" "https://mp.weixin.qq.com/s/..."
```

On first setup, ask the user where the final document library should live, resolve their natural-language answer to an absolute local path, and remember it:

```bash
neo-link-reader-config --set-output-root "/path/to/library"
```

If the folder does not exist, the config command creates it. Natural-language answers such as "put it in my external learning folder" should be translated by the agent into a concrete path before running the command.

For Xiaoyuzhou transcription, run a preflight only after the user has installed this Skill and is preparing to use Xiaoyuzhou transcription for the first time. Do not run dependency checks during the initial NeoGuide connection step.

```bash
neo-link-reader-preflight
```

If dependencies or model API keys are missing, explain in Chinese what each item does, what the agent can install or configure, and what the user must provide. Do not ask for or print secret values.

Treat setup checks as three levels:

- Required: Node.js; `ffmpeg` 音频处理工具; `whisper-cli` 本地语音转文字命令; 本地 Whisper medium 模型; 基础清洗模型 API, used for Xiaoyuzhou cleanup and paragraphing.
- Recommended optional: 高质量复核模型, used for better text audit, speaker turns, and paragraph quality; 搜索服务, used for uncertain terms.
- Optional: host-agent manual search, custom search integrations, and debug work files.

Run the whole workflow even when 高质量复核模型 is missing. In that case, use 基础清洗模型 for text audit, semantic speaker turns, paragraphing, and speaker repair; explain in Chinese that quality may be lower.

## Execution Mode

For Xiaoyuzhou links, always run transcription in the background because ASR and model review can take a long time. Use `screen`, `tmux`, `nohup`, or the host agent's background-job mechanism, write logs under `.transcribe-work/runs/`, and report the session/log path plus periodic progress.

Do not run a full Xiaoyuzhou transcription in the foreground. If a background launch exits immediately, inspect the log/process state, fix the background command, and relaunch in the background. If background execution still cannot be made to work quickly, stop and report the blocker instead of falling back to a foreground long run.

WeChat article imports are usually short and can run in the foreground.

## Routing

Use exact URL host/path checks:

- `xiaoyuzhoufm.com/episode/...` -> invoke the Xiaoyuzhou transcriber workflow.
- `mp.weixin.qq.com/s/...` -> invoke the WeChat article archiver workflow.
- Anything else -> say it is unsupported and ask whether to add a new source adapter.

## Output Rules

The save root is `--output-root`, then `LINK_READER_OUTPUT_ROOT` from the user's global config or shell, then the current working directory. If no default save root is configured and the user has not said where to save, ask once, resolve the answer to an absolute path, and run `neo-link-reader-config --set-output-root ...` before processing. Do not ask repeatedly after a save root is known.

Keep user-facing folders clean:

- Xiaoyuzhou final docs only: `小宇宙文档/<title>.md`
- WeChat final docs only: `公众号文档/<title>.md`
- Process files live under `.transcribe-work/` and are deleted after success unless `--keep-work` is used.
- If the same source URL already exists in a final Markdown document, report the existing document path and skip duplicate extraction.
- Search is helpful but not required. If no local search provider exists, keep uncertainty markers and continue.

## Configuration

Read [configuration.md](references/configuration.md) when setting up a new machine, diagnosing missing dependencies, or preparing the skill for sharing.

## Common Options

Pass options through to the routed workflow:

```bash
--keep-work
--no-search
--text-audit-model auto
--text-audit-max-items 120
--finalizer-model auto
--speaker-repair-model auto
```

For background Xiaoyuzhou runs, include the target URL, session/log path, latest ASR progress, live clean chunk count, and final Markdown path when reporting status.
