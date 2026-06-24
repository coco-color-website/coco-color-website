#!/usr/bin/env python3
"""Markdown -> Neo-styled WeChat draft publisher.

Image generation is intentionally outside this script. The Agent should create
cover and inline images with whatever image capability it has, then pass local
files to this script for WeChat upload, HTML formatting, and draft creation.
"""

from __future__ import annotations

import argparse
import html
import json
import mimetypes
import os
import re
import struct
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request
import zlib
from pathlib import Path
from typing import Any


CONFIG_DIR = Path.home() / ".neoguide"
ENV_PATH = CONFIG_DIR / "wechat-publisher.env"
CONFIG_PATH = CONFIG_DIR / "wechat-publisher.json"

TOKEN_URL = "https://api.weixin.qq.com/cgi-bin/token"
UPLOAD_BODY_IMG_URL = "https://api.weixin.qq.com/cgi-bin/media/uploadimg"
UPLOAD_MATERIAL_URL = "https://api.weixin.qq.com/cgi-bin/material/add_material"
DRAFT_URL = "https://api.weixin.qq.com/cgi-bin/draft/add"

DEFAULT_CONFIG: dict[str, Any] = {
    "style": "neo-warm",
    "primary_color": "#b5563e",
    "paper": "warm",
    "density": "relaxed",
    "font_size": "normal",
    "default_cover_media_id": "",
}

COLOR_PRESETS = {
    "vermilion": "#b5563e",
    "blue": "#2f6f9f",
    "green": "#4f7d57",
    "purple": "#705d9e",
    "black": "#3d3229",
    "red": "#b64b4b",
}

PAPER_PRESETS = {
    "warm": {
        "bg": "#faf8f5",
        "text": "#3d3229",
        "light_bg": "#f0ece6",
        "quote_bg": "#f3efe9",
        "quote_text": "#6b5c52",
        "code_bg": "#2d2a26",
        "code_text": "#e8e0d6",
        "hr_color": "#d4cec6",
    },
    "soft": {
        "bg": "#fbfaf7",
        "text": "#30302d",
        "light_bg": "#eef0ea",
        "quote_bg": "#f0f1ec",
        "quote_text": "#62665d",
        "code_bg": "#282b28",
        "code_text": "#e5e8df",
        "hr_color": "#d7dbd2",
    },
    "white": {
        "bg": "#ffffff",
        "text": "#242424",
        "light_bg": "#f5f5f5",
        "quote_bg": "#f7f7f7",
        "quote_text": "#666666",
        "code_bg": "#262626",
        "code_text": "#f0f0f0",
        "hr_color": "#dddddd",
    },
}


def load_private_env() -> None:
    if not ENV_PATH.exists():
        return
    for raw in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def load_config(path: Path | None = None) -> dict[str, Any]:
    config = dict(DEFAULT_CONFIG)
    candidate = path or CONFIG_PATH
    if candidate.exists():
        loaded = json.loads(candidate.read_text(encoding="utf-8"))
        if not isinstance(loaded, dict):
            raise ValueError(f"Config is not an object: {candidate}")
        config.update({k: v for k, v in loaded.items() if v is not None})
    return config


def save_config(config: dict[str, Any]) -> None:
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    CONFIG_PATH.write_text(json.dumps(config, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    try:
        CONFIG_PATH.chmod(0o600)
    except OSError:
        pass


def init_config() -> None:
    config = load_config()
    save_config(config)
    print(json.dumps({"created": str(CONFIG_PATH), "config": config}, ensure_ascii=False, indent=2))


def normalize_color(value: str) -> str:
    value = (value or "").strip()
    if not value:
        return DEFAULT_CONFIG["primary_color"]
    if value in COLOR_PRESETS:
        return COLOR_PRESETS[value]
    if re.match(r"^#[0-9a-fA-F]{6}$", value):
        return value
    raise ValueError(f"Invalid color: {value}")


def build_style(config: dict[str, Any]) -> dict[str, str]:
    paper = str(config.get("paper") or "warm")
    base = dict(PAPER_PRESETS.get(paper, PAPER_PRESETS["warm"]))
    accent = normalize_color(str(config.get("primary_color") or ""))
    density = str(config.get("density") or "relaxed")
    font_size = str(config.get("font_size") or "normal")

    p_size = {"small": "14px", "normal": "15px", "large": "16px"}.get(font_size, "15px")
    p_margin = {"compact": "16px 0", "normal": "20px 0", "relaxed": "24px 0"}.get(density, "24px 0")
    padding = {"compact": "20px 18px", "normal": "24px 20px", "relaxed": "28px 20px"}.get(density, "28px 20px")

    base.update(
        {
            "accent": accent,
            "font": "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif",
            "code_font": "Menlo, Consolas, monospace",
            "p_size": p_size,
            "p_lh": "1.75",
            "p_margin": p_margin,
            "h1_size": "26px",
            "h2_size": "20px",
            "h3_size": "17px",
            "code_size": "13px",
            "code_lh": "1.7",
            "quote_size": "14px",
            "max_width": "680px",
            "padding": padding,
        }
    )
    return base


def split_frontmatter(text: str) -> tuple[dict[str, str], str]:
    if not text.startswith("---\n"):
        return {}, text
    end = text.find("\n---\n", 4)
    if end == -1:
        return {}, text
    raw = text[4:end].strip()
    meta: dict[str, str] = {}
    for line in raw.splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        meta[key.strip()] = value.strip().strip('"').strip("'")
    return meta, text[end + 5 :]


def strip_tags(value: str) -> str:
    return re.sub(r"<[^>]+>", "", value)


def wrap_section(content: str, style: dict[str, str]) -> str:
    return (
        f'<section style="max-width:{style["max_width"]};margin:0 auto;'
        f'padding:{style["padding"]};background:{style["bg"]};'
        f'font-family:{style["font"]};">\n{content}\n</section>'
    )


def process_inline(text: str, style: dict[str, str]) -> str:
    placeholders: list[str] = []

    def stash(value: str) -> str:
        placeholders.append(value)
        return f"\u0000{len(placeholders) - 1}\u0000"

    def code_repl(match: re.Match[str]) -> str:
        value = html.escape(match.group(1), quote=False)
        return stash(
            f'<code style="background:{style["light_bg"]};padding:2px 6px;'
            f'border-radius:4px;font-size:13px;font-family:{style["code_font"]};">{value}</code>'
        )

    def strong_accent(match: re.Match[str]) -> str:
        value = html.escape(match.group(1), quote=False)
        return stash(f'<strong style="color:{style["accent"]};font-weight:600;">{value}</strong>')

    def strong_text(match: re.Match[str]) -> str:
        value = html.escape(match.group(1), quote=False)
        return stash(f'<strong style="color:{style["text"]};font-weight:700;">{value}</strong>')

    def link_repl(match: re.Match[str]) -> str:
        label = html.escape(match.group(1), quote=False)
        href = html.escape(match.group(2), quote=True)
        return stash(f'<a href="{href}" style="color:{style["accent"]};text-decoration:none;">{label}</a>')

    text = re.sub(r"`([^`]+)`", code_repl, text)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", link_repl, text)
    text = re.sub(r"__([^_]+)__", strong_text, text)
    text = re.sub(r"\*\*([^*]+)\*\*", strong_accent, text)
    escaped = html.escape(text, quote=False).replace("\n", "<br>")
    for i, value in enumerate(placeholders):
        escaped = escaped.replace(f"\u0000{i}\u0000", value)
    return escaped


def html_p(text: str, style: dict[str, str]) -> str:
    return (
        f'<p style="margin:{style["p_margin"]};font-size:{style["p_size"]};'
        f'line-height:{style["p_lh"]};color:{style["text"]};">{text}</p>'
    )


def html_h2(text: str, style: dict[str, str]) -> str:
    return (
        f'<h2 style="font-size:{style["h2_size"]};font-weight:700;color:{style["text"]};'
        f'margin:36px 0 16px;padding-left:12px;border-left:4px solid {style["accent"]};'
        f'font-family:{style["font"]};">{text}</h2>'
    )


def html_h3(text: str, style: dict[str, str]) -> str:
    return (
        f'<h3 style="font-size:{style["h3_size"]};font-weight:600;color:{style["text"]};'
        f'margin:28px 0 12px;font-family:{style["font"]};">{text}</h3>'
    )


def html_hr(style: dict[str, str]) -> str:
    return (
        f'<hr style="border:none;height:1px;background:linear-gradient(to right,'
        f'transparent,{style["hr_color"]},transparent);margin:40px 0;">'
    )


def html_code_block(text: str, style: dict[str, str]) -> str:
    value = html.escape(text, quote=False)
    return (
        f'<pre style="margin:20px 0;padding:16px 18px;background:{style["code_bg"]};'
        f'color:{style["code_text"]};font-size:{style["code_size"]};line-height:{style["code_lh"]};'
        f'font-family:{style["code_font"]};border-radius:8px;overflow-x:auto;'
        f'white-space:pre-wrap;word-wrap:break-word;">{value}</pre>'
    )


def html_quote(text: str, style: dict[str, str]) -> str:
    return (
        f'<blockquote style="margin:16px 0;padding:14px 18px;background:{style["quote_bg"]};'
        f'border-left:4px solid {style["accent"]};border-radius:0 8px 8px 0;'
        f'color:{style["quote_text"]};font-size:{style["quote_size"]};line-height:{style["p_lh"]};'
        f'font-style:italic;"><p style="margin:0;">{text}</p></blockquote>'
    )


def html_highlight(text: str, style: dict[str, str]) -> str:
    return (
        f'<p style="margin:32px 0;padding:18px 24px;background:{style["light_bg"]};'
        f'border-radius:8px;color:{style["text"]};font-size:16px;line-height:1.8;'
        f'text-align:center;font-weight:600;letter-spacing:0.5px;">{text}</p>'
    )


def html_divider(text: str, style: dict[str, str]) -> str:
    return (
        f'<p style="margin:48px 0 32px;text-align:center;">'
        f'<span style="display:inline-block;padding:8px 28px;'
        f'background:{style["light_bg"]};border-radius:24px;'
        f'font-size:{style["h2_size"]};font-weight:700;color:{style["accent"]};'
        f'letter-spacing:6px;">{text}</span></p>'
    )


def html_img(src: str, alt: str = "") -> str:
    return (
        f'<p style="margin:24px 0;text-align:center;">'
        f'<img src="{html.escape(src, quote=True)}" alt="{html.escape(alt, quote=True)}" '
        f'style="max-width:100%;border-radius:8px;display:block;margin:0 auto;"></p>'
    )


def html_img_placeholder(key: str, style: dict[str, str]) -> str:
    return (
        f'<p style="margin:24px 0;padding:16px 20px;background:{style["quote_bg"]};'
        f'color:{style["text"]};border-radius:8px;font-size:{style["p_size"]};'
        f'text-align:center;font-weight:400;letter-spacing:0.5px;">'
        f'[ 插入图片：{html.escape(key)} ]</p>'
    )


def is_remote_src(value: str) -> bool:
    return value.startswith("http://") or value.startswith("https://")


def resolve_asset_path(raw_path: str, base_dir: Path) -> Path:
    path = Path(raw_path).expanduser()
    if path.is_absolute():
        return path
    cwd_path = Path.cwd() / path
    if cwd_path.exists():
        return cwd_path.resolve()
    return (base_dir / path).resolve()


def resolve_preview_src(raw_src: str, base_dir: Path) -> str:
    if is_remote_src(raw_src):
        return raw_src
    path = resolve_asset_path(raw_src, base_dir)
    return str(path) if path.exists() else raw_src


def parse_image_plan(path: str | None) -> dict[str, Any]:
    if not path:
        return {}
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError("Image plan must be a JSON object")
    return data


def find_image_url(key: str, images: dict[str, str]) -> str | None:
    key_lower = key.lower().strip()
    num_match = re.match(r"^(\d+)", key_lower)
    num_prefix = num_match.group(1) if num_match else None
    for img_key, url in images.items():
        img_lower = img_key.lower()
        if num_prefix and img_lower.startswith(num_prefix):
            return url
        base = img_lower.replace(".png", "").replace(".jpg", "").replace(".jpeg", "")
        if key_lower in img_lower or base in key_lower:
            return url
    return None


def first_paragraph_from_parts(parts: list[str]) -> str:
    for item in parts:
        text = strip_tags(item).strip()
        if text:
            return text[:120]
    return ""


def parse_markdown(
    md_text: str,
    base_dir: Path,
    style: dict[str, str],
    images: dict[str, str],
    inline_by_heading: dict[str, str],
    markdown_image_sources: dict[str, str],
) -> tuple[str, str, str, list[str]]:
    meta, body = split_frontmatter(md_text)
    lines = body.split("\n")
    parts: list[str] = []
    headings: list[str] = []
    title = meta.get("title", "")
    i = 0

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        if not stripped:
            i += 1
            continue
        if stripped.startswith("# ") and not stripped.startswith("## "):
            if not title:
                title = stripped[2:].strip()
            i += 1
            continue
        if stripped.startswith("## "):
            heading = stripped[3:].strip()
            headings.append(heading)
            parts.append(html_h2(process_inline(heading, style), style))
            if heading in inline_by_heading:
                parts.append(html_img(inline_by_heading[heading], heading))
            i += 1
            continue
        if stripped.startswith("### "):
            parts.append(html_h3(process_inline(stripped[4:].strip(), style), style))
            i += 1
            continue
        if stripped in {"---", "***", "___"}:
            parts.append(html_hr(style))
            i += 1
            continue
        divider_match = re.match(r"^\*[—–-]\s*(.+?)\s*[—–-]\*$", stripped)
        if divider_match:
            parts.append(html_divider(f"— {divider_match.group(1)} —", style))
            i += 1
            continue
        if stripped.startswith("```"):
            code_lines: list[str] = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                code_lines.append(lines[i])
                i += 1
            i += 1
            parts.append(html_code_block("\n".join(code_lines), style))
            continue
        if stripped == ":::highlight":
            hl_lines: list[str] = []
            i += 1
            while i < len(lines) and lines[i].strip() != ":::":
                hl_lines.append(lines[i].strip())
                i += 1
            i += 1
            parts.append(html_highlight(process_inline("\n".join(hl_lines), style), style))
            continue
        if stripped.startswith("> "):
            quote_lines: list[str] = []
            while i < len(lines) and lines[i].strip().startswith("> "):
                quote_lines.append(lines[i].strip()[2:])
                i += 1
            parts.append(html_quote(process_inline("\n".join(quote_lines), style), style))
            continue
        md_img = re.match(r"!\[([^\]]*)\]\(([^)]+)\)", stripped)
        if md_img:
            raw_src = md_img.group(2)
            src = markdown_image_sources.get(raw_src) or resolve_preview_src(raw_src, base_dir)
            parts.append(html_img(src, md_img.group(1)))
            i += 1
            continue
        img_match = re.match(r"【插入(?:图片[：:]?\s*|\"[^\"]*\"图片)(.*)】", stripped)
        if not img_match:
            img_match = re.match(r"【插入\"([^\"]*)\"图片】", stripped)
        if img_match:
            key = img_match.group(1).strip() if img_match.group(1) else stripped
            url = find_image_url(key, images) if images else None
            if not url and images:
                url = find_image_url(stripped, images)
            parts.append(html_img(url, key) if url else html_img_placeholder(key, style))
            i += 1
            continue
        para_lines: list[str] = []
        while i < len(lines):
            current = lines[i].strip()
            if not current or current.startswith(("#", "```", "---", "***", "___", "> ", ":::", "【")):
                break
            para_lines.append(current)
            i += 1
        if para_lines:
            parts.append(html_p(process_inline(" ".join(para_lines), style), style))
            continue
        i += 1

    digest = meta.get("summary") or meta.get("description") or first_paragraph_from_parts(parts)
    return title, digest[:120], wrap_section("\n".join(parts), style), headings


def require_wechat_credentials() -> tuple[str, str]:
    appid = os.environ.get("WECHAT_APP_ID", "").strip()
    secret = os.environ.get("WECHAT_APP_SECRET", "").strip()
    if not appid or not secret:
        raise RuntimeError("Missing WECHAT_APP_ID / WECHAT_APP_SECRET. Configure ~/.neoguide/wechat-publisher.env.")
    return appid, secret


def request_json(url: str, payload: dict[str, Any] | None = None, headers: dict[str, str] | None = None) -> dict[str, Any]:
    data = None if payload is None else json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers or {})
    if payload is not None:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {error.code}: {body}") from error


def get_access_token() -> str:
    appid, secret = require_wechat_credentials()
    query = urllib.parse.urlencode({"grant_type": "client_credential", "appid": appid, "secret": secret})
    data = request_json(f"{TOKEN_URL}?{query}")
    token = data.get("access_token")
    if not token:
        raise RuntimeError(f"Failed to get access token: {data}")
    return str(token)


def multipart_upload(url: str, field_name: str, path: Path, extra_fields: dict[str, str] | None = None) -> dict[str, Any]:
    boundary = "----NeoGuideBoundary7MA4YWxkTrZu0gW"
    mime = mimetypes.guess_type(str(path))[0] or "image/png"
    parts: list[bytes] = []
    for key, value in (extra_fields or {}).items():
        parts.append(
            (
                f"--{boundary}\r\n"
                f'Content-Disposition: form-data; name="{key}"\r\n\r\n'
                f"{value}\r\n"
            ).encode("utf-8")
        )
    parts.append(
        (
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="{field_name}"; filename="{path.name}"\r\n'
            f"Content-Type: {mime}\r\n\r\n"
        ).encode("utf-8")
    )
    parts.append(path.read_bytes())
    parts.append(f"\r\n--{boundary}--\r\n".encode("utf-8"))
    req = urllib.request.Request(url, data=b"".join(parts), headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {error.code}: {body}") from error


def upload_cover_material(token: str, image_path: Path) -> str:
    url = f"{UPLOAD_MATERIAL_URL}?{urllib.parse.urlencode({'access_token': token, 'type': 'image'})}"
    result = multipart_upload(url, "media", image_path)
    media_id = result.get("media_id")
    if not media_id:
        raise RuntimeError(f"Cover upload failed: {result}")
    return str(media_id)


def upload_body_image(token: str, image_path: Path) -> str:
    url = f"{UPLOAD_BODY_IMG_URL}?{urllib.parse.urlencode({'access_token': token})}"
    result = multipart_upload(url, "media", image_path)
    image_url = result.get("url")
    if not image_url:
        raise RuntimeError(f"Body image upload failed: {result}")
    return str(image_url).replace("http://", "https://", 1)


def prepare_body_image_src(raw_src: str, base_dir: Path, token: str | None) -> tuple[str, dict[str, str]]:
    if is_remote_src(raw_src):
        return raw_src, {"source": raw_src, "status": "remote"}
    path = resolve_asset_path(raw_src, base_dir)
    if not path.exists():
        return raw_src, {"source": raw_src, "status": "missing"}
    if token:
        uploaded = upload_body_image(token, path)
        return uploaded, {"source": str(path), "status": "uploaded", "url": uploaded}
    return str(path), {"source": str(path), "status": "local_preview"}


def prepare_article_images(
    md_text: str,
    base_dir: Path,
    images: dict[str, str],
    image_plan: dict[str, Any],
    token: str | None,
) -> tuple[dict[str, str], dict[str, str], dict[str, str], list[dict[str, str]]]:
    resolved_images: dict[str, str] = {}
    markdown_sources: dict[str, str] = {}
    inline_by_heading: dict[str, str] = {}
    report: list[dict[str, str]] = []

    for key, raw_src in images.items():
        src, item = prepare_body_image_src(str(raw_src), base_dir, token)
        resolved_images[str(key)] = src
        item["kind"] = "placeholder"
        item["key"] = str(key)
        report.append(item)

    for match in re.finditer(r"!\[[^\]]*\]\(([^)]+)\)", md_text):
        raw_src = match.group(1).strip()
        if raw_src in markdown_sources:
            continue
        src, item = prepare_body_image_src(raw_src, base_dir, token)
        markdown_sources[raw_src] = src
        item["kind"] = "markdown"
        report.append(item)

    inline_items = image_plan.get("inline_images")
    if isinstance(inline_items, list):
        for item in inline_items:
            if not isinstance(item, dict):
                continue
            heading = str(item.get("after_heading") or item.get("heading") or "").strip()
            raw_src = str(item.get("path") or item.get("src") or item.get("url") or "").strip()
            if not heading or not raw_src:
                continue
            src, image_report = prepare_body_image_src(raw_src, base_dir, token)
            inline_by_heading[heading] = src
            image_report["kind"] = "planned_inline"
            image_report["heading"] = heading
            image_report["type"] = str(item.get("type") or "")
            report.append(image_report)

    return resolved_images, markdown_sources, inline_by_heading, report


def png_chunk(chunk_type: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + chunk_type + data + struct.pack(">I", zlib.crc32(chunk_type + data) & 0xFFFFFFFF)


def write_default_cover(path: Path, accent: str) -> None:
    width, height = 1200, 675
    accent = normalize_color(accent).lstrip("#")
    ar, ag, ab = int(accent[0:2], 16), int(accent[2:4], 16), int(accent[4:6], 16)
    rows = []
    for y in range(height):
        row = bytearray([0])
        for x in range(width):
            t = (x / width) * 0.65 + (y / height) * 0.35
            base = int(248 - 22 * t)
            r = int(base * 0.82 + ar * 0.18)
            g = int((base - 3) * 0.86 + ag * 0.14)
            b = int((base - 8) * 0.88 + ab * 0.12)
            if 70 < x - y * 0.9 < 100:
                r, g, b = min(255, r + 16), max(0, g - 3), max(0, b - 5)
            row.extend((r, g, b))
        rows.append(bytes(row))
    raw = b"".join(rows)
    png = (
        b"\x89PNG\r\n\x1a\n"
        + png_chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
        + png_chunk(b"IDAT", zlib.compress(raw, 6))
        + png_chunk(b"IEND", b"")
    )
    path.write_bytes(png)


def resolve_cover_media_id(
    args: argparse.Namespace,
    title: str,
    digest: str,
    config: dict[str, Any],
    token: str,
    work_dir: Path,
) -> tuple[str, dict[str, str], dict[str, Any]]:
    if args.cover_media_id:
        return args.cover_media_id, {"status": "provided_media_id"}, config

    if args.cover:
        media_id = upload_cover_material(token, Path(args.cover).expanduser().resolve())
        return media_id, {"status": "uploaded_user_cover"}, config

    if isinstance(args.image_plan_data, dict):
        cover = args.image_plan_data.get("cover")
        if isinstance(cover, dict):
            cover_src = str(cover.get("path") or cover.get("src") or "").strip()
            if cover_src:
                media_id = upload_cover_material(token, resolve_asset_path(cover_src, Path(args.md).expanduser().resolve().parent))
                return media_id, {"status": "uploaded_planned_cover", "path": cover_src}, config

    cached = str(config.get("default_cover_media_id") or "").strip()
    if cached:
        return cached, {"status": "cached_default_cover"}, config

    cover_path = work_dir / "default-cover.png"
    write_default_cover(cover_path, str(config.get("primary_color") or DEFAULT_CONFIG["primary_color"]))
    media_id = upload_cover_material(token, cover_path)
    config["default_cover_media_id"] = media_id
    save_config(config)
    return media_id, {"status": "created_default_cover", "path": str(cover_path)}, config


def publish_draft(token: str, title: str, content: str, digest: str, cover_media_id: str, author: str) -> str:
    payload = {
        "articles": [
            {
                "article_type": "news",
                "title": title[:64],
                "author": author[:8],
                "digest": digest[:120],
                "content": content,
                "thumb_media_id": cover_media_id,
                "need_open_comment": 1,
                "only_fans_can_comment": 0,
            }
        ]
    }
    result = request_json(
        f"{DRAFT_URL}?{urllib.parse.urlencode({'access_token': token})}",
        payload,
        headers={"Content-Type": "application/json; charset=utf-8"},
    )
    media_id = result.get("media_id")
    if not media_id:
        raise RuntimeError(f"Draft creation failed: {result}")
    return str(media_id)


def publish_newspic(token: str, title: str, content: str, image_media_ids: list[str]) -> str:
    payload = {
        "articles": [
            {
                "article_type": "newspic",
                "title": title[:64],
                "content": content,
                "need_open_comment": 1,
                "only_fans_can_comment": 0,
                "image_info": {"image_list": [{"image_media_id": mid} for mid in image_media_ids]},
            }
        ]
    }
    result = request_json(
        f"{DRAFT_URL}?{urllib.parse.urlencode({'access_token': token})}",
        payload,
        headers={"Content-Type": "application/json; charset=utf-8"},
    )
    media_id = result.get("media_id")
    if not media_id:
        raise RuntimeError(f"Newspic draft creation failed: {result}")
    return str(media_id)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Markdown -> Neo-styled WeChat draft publisher")
    parser.add_argument("--md", help="Markdown file path")
    parser.add_argument("--images", help="Image URL mapping JSON for placeholders")
    parser.add_argument("--image-plan", help="JSON image plan for cover and inline images")
    parser.add_argument("--config", help="Style config JSON path")
    parser.add_argument("--init-config", action="store_true", help="Create default user config")
    parser.add_argument("--digest", help="Article digest")
    parser.add_argument("--author", default="Neo")
    parser.add_argument("--cover", help="Local cover image path")
    parser.add_argument("--cover-media-id", help="Existing WeChat material media_id")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--html", help="Output HTML path")
    parser.add_argument("--newspic", action="store_true")
    parser.add_argument("--pic", action="append", help="Newspic image path; can repeat")
    return parser.parse_args()


def run_newspic(args: argparse.Namespace) -> None:
    if not args.md or not args.pic:
        raise RuntimeError("Newspic mode requires --md and at least one --pic")
    raw = Path(args.md).read_text(encoding="utf-8")
    meta, body = split_frontmatter(raw)
    title = meta.get("title", "")
    text_lines = []
    for line in body.splitlines():
        stripped = line.strip()
        if stripped.startswith("# ") and not title:
            title = stripped[2:].strip()
        elif stripped and not stripped.startswith("#") and stripped != "---":
            text_lines.append(stripped)
    if not title:
        raise RuntimeError("Missing article title")
    content = "\n\n".join(text_lines)
    if args.dry_run:
        print(json.dumps({"mode": "newspic", "title": title, "images": len(args.pic), "content_chars": len(content)}, ensure_ascii=False))
        return
    token = get_access_token()
    media_ids = [upload_cover_material(token, Path(p).expanduser().resolve()) for p in args.pic]
    media_id = publish_newspic(token, title, content, media_ids)
    print(json.dumps({"success": True, "mode": "newspic", "title": title, "media_id": media_id}, ensure_ascii=False, indent=2))


def main() -> None:
    load_private_env()
    args = parse_args()
    if args.init_config:
        init_config()
        return
    if args.newspic:
        run_newspic(args)
        return
    if not args.md:
        raise RuntimeError("--md is required")

    config = load_config(Path(args.config).expanduser() if args.config else None)
    style = build_style(config)
    image_plan = parse_image_plan(args.image_plan)
    args.image_plan_data = image_plan

    md_path = Path(args.md).expanduser().resolve()
    images = json.loads(Path(args.images).read_text(encoding="utf-8")) if args.images else {}
    if not isinstance(images, dict):
        raise RuntimeError("--images must be a JSON object")

    work_dir = Path(tempfile.mkdtemp(prefix="neoguide-wechat-"))
    token = None if args.dry_run else get_access_token()

    raw = md_path.read_text(encoding="utf-8")
    resolved_images, markdown_sources, inline_by_heading, image_report = prepare_article_images(
        raw,
        md_path.parent,
        images,
        image_plan,
        token,
    )
    title, digest, html_content, headings = parse_markdown(
        raw,
        md_path.parent,
        style,
        resolved_images,
        inline_by_heading,
        markdown_sources,
    )
    if not title:
        raise RuntimeError("Missing H1 title or frontmatter title")
    digest = args.digest or digest

    html_path = Path(args.html).expanduser().resolve() if args.html else work_dir / "preview.html"
    html_path.write_text(html_content, encoding="utf-8")

    if args.dry_run:
        report = {
            "dry_run": True,
            "title": title,
            "digest": digest,
            "html": str(html_path),
            "style": {
                "style": config.get("style"),
                "primary_color": normalize_color(str(config.get("primary_color") or "")),
                "paper": config.get("paper"),
                "density": config.get("density"),
                "font_size": config.get("font_size"),
            },
            "images": image_report,
        }
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return

    assert token is not None
    cover_media_id, cover_report, config = resolve_cover_media_id(args, title, digest, config, token, work_dir)
    draft_media_id = publish_draft(token, title, html_content, digest, cover_media_id, args.author)
    print(
        json.dumps(
            {
                "success": True,
                "title": title,
                "media_id": draft_media_id,
                "html": str(html_path),
                "cover": cover_report,
                "images": image_report,
                "message": "Draft created. Inspect it in the WeChat Official Account backend before sending.",
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
