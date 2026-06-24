---
name: neoguide-wechat-publisher
description: Format Markdown articles with Neo warm editorial WeChat styling, generate or prepare cover and inline images, preview HTML, and create WeChat Official Account drafts. Use for 公众号排版、封面图、正文配图、草稿箱同步、小绿书/newspic.
metadata:
  version: 1.0.0
---

# NeoGuide WeChat Publisher

## Purpose

Use this skill to turn a Markdown article into a styled WeChat Official Account draft.

It is not a generic WeChat poster. Its default value is:

- Neo warm editorial visual style
- Agent-generated no-text cover image
- optional article-aware inline images
- WeChat-safe inline HTML
- draft-box creation only, never mass-send

The script does not call image-generation APIs. Image generation is an Agent responsibility:

- In Codex, use Codex's available image-generation capability to create local image files first.
- Outside Codex, use the image model/API configured for that Agent to create local image files first.
- Then pass those local files to `md2wechat.py` for upload, formatting, and draft creation.

## Safety

- Never print or expose `WECHAT_APP_SECRET`, `ARK_API_KEY`, access tokens, API keys, `.env` values, or private config contents.
- Use credentials only from environment variables or `~/.neoguide/wechat-publisher.env`.
- Do not write real secrets into project files, article files, logs, examples, or chat.
- Always run a dry-run HTML preview before creating a draft unless the user explicitly asks to skip preview.
- Only create drafts. Never publish or mass-send.
- After creating a draft, tell the user to inspect the article in the WeChat Official Account backend before sending.

## Configuration

Private env file:

```text
~/.neoguide/wechat-publisher.env
```

Expected variables:

```text
WECHAT_APP_ID=...
WECHAT_APP_SECRET=...
```

If the Agent uses an external image model such as Volcengine Seedream, keep those API keys in that Agent's normal private configuration. Do not pass them to `md2wechat.py`; the publisher script only receives generated image files.

Optional style config:

```bash
python3 {skill_dir}/scripts/md2wechat.py --init-config
```

This creates:

```text
~/.neoguide/wechat-publisher.json
```

Keep config simple. The normal user-facing knobs are:

- `style`: default `neo-warm`
- `primary_color`: default `#b5563e`
- `paper`: `warm`, `white`, or `soft`
- `density`: `relaxed`, `normal`, or `compact`
- `font_size`: `normal`, `large`, or `small`

## Tool

Use the bundled script from this skill directory:

```bash
python3 {skill_dir}/scripts/md2wechat.py --md article.md --dry-run --html preview.html
```

Create a draft after preview:

```bash
python3 {skill_dir}/scripts/md2wechat.py --md article.md
```

Use a local cover:

```bash
python3 {skill_dir}/scripts/md2wechat.py --md article.md --cover cover.png
```

Use an existing WeChat cover material:

```bash
python3 {skill_dir}/scripts/md2wechat.py --md article.md --cover-media-id MEDIA_ID
```

Use generated local inline images with an explicit image plan:

```json
{
  "cover": {
    "path": "images/cover.png"
  },
  "inline_images": [
    {
      "after_heading": "从一次回答，变成一条流程",
      "type": "concept",
      "path": "images/process-metaphor.png"
    }
  ]
}
```

Then publish with:

```bash
python3 {skill_dir}/scripts/md2wechat.py --md article.md --image-plan image_plan.json
```

Newspic / 小绿书 mode:

```bash
python3 {skill_dir}/scripts/md2wechat.py --newspic --md article.md --pic cover.png --pic image2.png
```

## Workflow

1. Read the article source.
2. Extract title, digest, author/context, and image needs.
3. Check for accidental secrets or private data.
4. Prepare images:
   - Prefer user-provided cover.
   - Otherwise use the Agent's image capability to generate a no-text cover image as a local file.
   - If the Agent cannot generate images, let `md2wechat.py` create and upload a default no-text cover.
   - Generate inline images only when requested or when the user asks for article images.
   - Put generated inline image paths in `image_plan.json`, or insert local Markdown image links in the article.
5. Run dry-run preview and inspect the resulting HTML path.
6. Create a WeChat draft only after preview.
7. Return title, media id, cover status, inline image status, and backend check reminder.

## Image Strategy

Cover images are recommended and should be no-text. WeChat already displays the article title separately, so the cover should express the article mood, core metaphor, or editorial atmosphere.

Recommended cover prompt pattern:

```text
Create a no-text editorial cover image for a WeChat article. Warm paper texture, calm knowledge-work atmosphere, restrained contrast, Chinese independent creator tone, subtle visual metaphor, no words, no letters, no logo, no watermark. Use #b5563e only as a small visual accent. Article title: <title>. Article summary: <digest>.
```

Inline images are optional and should be planned before generation. Use these categories:

- `atmosphere`: mood image for story or reflective essays.
- `concept`: visual metaphor for abstract arguments.
- `infographic`: simple structured image for comparisons, lists, or frameworks.
- `process`: workflow or system diagram; prefer generated HTML/SVG when exact text matters.
- `quote-card`: key sentence card; prefer the formatter instead of AI image generation when text accuracy matters.

Keep inline images sparse:

- Story essay: cover only, or one atmosphere image.
- Opinion essay: cover plus one concept image.
- How-to article: cover plus one process or infographic image.
- Sales or enrollment article: cover plus one framework image or quote card.

Avoid stock-photo style, neon futurism, plastic 3D, clutter, and generated Chinese text inside images.

## Style

Default style is `neo-warm`:

- Warm paper background, not plain white.
- Body text in deep brown charcoal.
- Key sentence emphasis in reddish brown.
- Inline styles only; avoid CSS classes.
- Avoid `ul`/`ol` because WeChat rendering often creates spacing bugs.
- Use quote blocks for other people's words and centered highlight cards for core claims.
