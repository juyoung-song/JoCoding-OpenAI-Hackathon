from __future__ import annotations

import json
import logging
import time
from typing import Any, Iterable

from langchain_core.messages import BaseMessage

from src.core.config import settings

logger = logging.getLogger(__name__)

_PLACEHOLDER_PREFIX = "__SET_IN_SECRET_MANAGER__"
_OPENAI_COOLDOWN_SECONDS = 300
_openai_blocked_until_ts = 0.0


def is_openai_configured() -> bool:
    api_key = (settings.openai_api_key or "").strip()
    return bool(api_key) and not api_key.startswith(_PLACEHOLDER_PREFIX)


def _iter_models() -> list[str]:
    models = [model.strip() for model in settings.openai_fallback_models if model.strip()]
    if models:
        return models
    fallback = (settings.openai_model or "").strip()
    return [fallback] if fallback else []


def _strip_code_fence(text: str) -> str:
    content = text.strip()
    if not content.startswith("```"):
        return content
    lines = content.splitlines()
    if not lines:
        return content
    # ```json 또는 ``` 로 시작하는 코드펜스 제거
    if lines[0].startswith("```"):
        lines = lines[1:]
    if lines and lines[-1].startswith("```"):
        lines = lines[:-1]
    return "\n".join(lines).strip()


def _is_auth_related_error(error_text: str) -> bool:
    lowered = error_text.lower()
    return any(
        token in lowered
        for token in (
            "401",
            "403",
            "unauthorized",
            "invalid_api_key",
            "authentication",
            "does not have access to model",
            "model_not_found",
            "insufficient_quota",
        )
    )


async def ainvoke_with_model_fallback(
    messages: Iterable[BaseMessage],
    *,
    temperature: float = 0.2,
) -> Any:
    global _openai_blocked_until_ts

    if not is_openai_configured():
        raise RuntimeError("OPENAI_NOT_CONFIGURED")

    now_ts = time.time()
    if _openai_blocked_until_ts > now_ts:
        raise RuntimeError("OPENAI_TEMPORARILY_BLOCKED")

    models = _iter_models()
    if not models:
        raise RuntimeError("OPENAI_MODEL_NOT_CONFIGURED")

    from langchain_openai import ChatOpenAI

    message_list = list(messages)
    errors: list[str] = []
    auth_related_failures = 0
    for model in models:
        try:
            llm = ChatOpenAI(
                model=model,
                api_key=settings.openai_api_key,
                temperature=temperature,
            )
            response = await llm.ainvoke(message_list)
            if model != settings.openai_model:
                logger.info("OpenAI fallback model success: %s", model)
            return response
        except Exception as exc:
            error_name = exc.__class__.__name__
            error_text = str(exc)
            errors.append(f"{model}:{error_name}")
            if _is_auth_related_error(error_text):
                auth_related_failures += 1
            logger.warning("OpenAI model invocation failed (%s): %s", model, error_name)

    if auth_related_failures == len(models):
        _openai_blocked_until_ts = time.time() + _OPENAI_COOLDOWN_SECONDS
        logger.warning("OpenAI calls blocked for %ss due to repeated auth/model errors", _OPENAI_COOLDOWN_SECONDS)

    raise RuntimeError(f"OPENAI_ALL_MODELS_FAILED ({', '.join(errors)})")


async def ainvoke_json_with_model_fallback(
    messages: Iterable[BaseMessage],
    *,
    temperature: float = 0.1,
) -> dict[str, Any]:
    response = await ainvoke_with_model_fallback(messages, temperature=temperature)
    raw_content = getattr(response, "content", "")

    if isinstance(raw_content, list):
        text_parts: list[str] = []
        for entry in raw_content:
            if isinstance(entry, dict) and entry.get("type") == "text":
                text_parts.append(str(entry.get("text", "")))
            else:
                text_parts.append(str(entry))
        content = "\n".join(part for part in text_parts if part).strip()
    else:
        content = str(raw_content or "").strip()

    if not content:
        raise RuntimeError("OPENAI_EMPTY_RESPONSE")

    cleaned = _strip_code_fence(content)
    parsed = json.loads(cleaned)
    if not isinstance(parsed, dict):
        raise RuntimeError("OPENAI_JSON_OBJECT_REQUIRED")
    return parsed
