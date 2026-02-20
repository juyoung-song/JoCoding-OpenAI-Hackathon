from __future__ import annotations

import string
from functools import lru_cache
from pathlib import Path

_PROMPT_DIR = Path(__file__).resolve().parent
_FORMATTER = string.Formatter()


class PromptTemplateError(ValueError):
    """프롬프트 템플릿 로드/렌더링 오류."""


def _resolve_prompt_path(name: str) -> Path:
    normalized = name.strip().replace("\\", "/")
    if not normalized:
        raise PromptTemplateError("Prompt template name is required.")

    path = (_PROMPT_DIR / normalized).resolve()
    if _PROMPT_DIR not in path.parents:
        raise PromptTemplateError(f"Prompt path traversal is not allowed: {name}")
    if not path.exists() or not path.is_file():
        raise PromptTemplateError(f"Prompt template not found: {name}")
    return path


@lru_cache(maxsize=128)
def load_prompt_template(name: str) -> str:
    path = _resolve_prompt_path(name)
    return path.read_text(encoding="utf-8")


def render_prompt(name: str, **variables: str) -> str:
    template = load_prompt_template(name)
    required_fields = {
        field_name
        for _, field_name, _, _ in _FORMATTER.parse(template)
        if field_name
    }
    missing_fields = sorted(field for field in required_fields if field not in variables)
    if missing_fields:
        missing = ", ".join(missing_fields)
        raise PromptTemplateError(f"Missing prompt variables for {name}: {missing}")
    try:
        return template.format(**variables)
    except Exception as exc:
        raise PromptTemplateError(f"Failed to render prompt template {name}: {exc}") from exc
