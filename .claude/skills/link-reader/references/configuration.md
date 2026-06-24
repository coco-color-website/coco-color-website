# Configuration

## Runtime

Required for all workflows:

- Node.js 18+ with built-in `fetch`

Install or refresh the global CLI and skills:

```bash
npm install -g /path/to/neo-ai-skills
neo-link-reader-install-skills
neo-link-reader-preflight
```

After installation, set the default save root once:

```bash
neo-link-reader-config --set-output-root "/path/to/library"
neo-link-reader-config --show
```

The config command creates the folder if it does not exist. Then `neo-link-reader ...` saves under that folder from any working directory. For one-off overrides, pass `--output-root "/path/to/library"`.

Save-root resolution:

```text
--output-root
LINK_READER_OUTPUT_ROOT
current working directory
```

Final output folders are created automatically under the save root. Process files go under `<save-root>/.transcribe-work/` and are cleaned after success unless `--keep-work` is used.

Environment variables already present in the shell win. Optional environment files are loaded in this order without overwriting existing shell variables:

```text
$LINK_READER_ENV_FILE
$HOME/.config/neo-link-reader/.env
```

Project `.env` files are not loaded by default, because another project may contain unrelated secrets with colliding variable names. To explicitly allow the current directory's `.env`, set:

```bash
LINK_READER_LOAD_PROJECT_ENV=1
```

Required for Xiaoyuzhou transcription:

- `ffmpeg`
- `whisper-cli` from whisper.cpp
- A local Whisper medium model

Default Whisper model lookup:

```text
$WHISPER_MODEL_MEDIUM
$WHISPER_MODEL_PATH
$HOME/.local/share/whisper.cpp/ggml-medium-q5_0.bin
```

Install examples:

```bash
brew install ffmpeg
# Install whisper.cpp separately, then make sure whisper-cli is on PATH.
# Download a ggml medium model and set WHISPER_MODEL_PATH if it is not in the default location.
```

## Model API Environment

这个 Skill 支持两层模型配置。用户如果只想接一个 API，也可以让两层配置指向同一个 provider/model。面向中文新手解释配置时，使用下面的中文名称，不要暴露密钥明文。

基础清洗模型环境变量，小宇宙转写必需，用于清洗语音识别结果和整理段落：

```text
LIGHT_MODEL_API_KEY
LIGHT_MODEL_BASE_URL
LIGHT_MODEL_CHAT_BASE_URL
LIGHT_MODEL
```

兼容别名：

```text
DOUBAO_MINI_API_KEY
DOUBAO_API_KEY
DOUBAO_MINI_BASE_URL
DOUBAO_CHAT_BASE_URL
DOUBAO_MINI_MODEL
DOUBAO_MODEL
```

高质量复核模型环境变量，建议配置但可选。它会提升文字审核、说话人分段、段落整理和说话人修复的质量。缺失时，流程仍会用基础清洗模型继续运行：

```text
PRO_MODEL_API_KEY
PRO_MODEL_BASE_URL
PRO_MODEL_CHAT_BASE_URL
PRO_MODEL
```

兼容别名：

```text
DEEPSEEK_API_KEY
DEEPSEEK_BASE_URL
DEEPSEEK_MODEL
```

可选的快速模型：

```text
PRO_FLASH_MODEL
PRO_FLASH_MODEL_NAME
DEEPSEEK_FLASH_MODEL
```

If only one API/model is available, set both light and pro variables to the same values.

## Search

Search is recommended but optional. If no provider is configured, the workflow keeps `〔不确定〕` markers and continues.

The workflow first uses any local provider configured in the user's environment. A user can explicitly choose one with:

```text
LINK_READER_SEARCH_PROVIDER
SEARCH_PROVIDER
```

Built-in providers:

```text
TAVILY_API_KEY
SERPAPI_API_KEY
BRAVE_SEARCH_API_KEY
```

For other search APIs, configure a custom command:

```text
LINK_READER_SEARCH_COMMAND
```

The command receives:

```text
LINK_READER_SEARCH_QUERY
LINK_READER_SEARCH_MAX_RESULTS
```

It should print JSON to stdout, either an array of `{ "title": "...", "url": "...", "snippet": "..." }` objects or an object with a `results` array.

Search requests respect standard local proxy variables such as `HTTPS_PROXY`, `HTTP_PROXY`, and `NO_PROXY`.

In agent environments with host search but no local search API, the local Node process may not be able to call host search directly. Do not block the main workflow; run with `--no-search` or let the agent do a separate manual verification pass.

## Privacy

Never hard-code or print secrets. Keep API keys in the user's shell environment or a local `.env` file that is not committed.

Audio ASR is local and consumes compute, not API tokens. Cleaning, text audit, speaker finalizer, and speaker repair consume model API tokens.
