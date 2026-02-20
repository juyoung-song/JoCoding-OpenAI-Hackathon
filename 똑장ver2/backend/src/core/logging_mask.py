from __future__ import annotations

import logging
import re


_MASK_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"(sk-[a-zA-Z0-9_-]{8,})"), "sk-***"),
    (re.compile(r"(pk-[a-zA-Z0-9_-]{8,})"), "pk-***"),
    (re.compile(r"(hf_[a-zA-Z0-9]{8,})"), "hf_***"),
    (re.compile(r"(Bearer\s+)([A-Za-z0-9._-]{12,})"), r"\1***"),
    (
        re.compile(
            r"((?:[?&]|\b)(?:p_cert_key|p_cert_id|api_key|service_key|servicekey|client_secret|access_token)=)([^&\s]+)",
            re.IGNORECASE,
        ),
        r"\1***",
    ),
    (
        re.compile(
            r'("(?:p_cert_key|p_cert_id|api_key|service_key|servicekey|client_secret|access_token)"\s*:\s*")([^"]+)(")',
            re.IGNORECASE,
        ),
        r"\1***\3",
    ),
    (re.compile(r"\b(01[0-9])[-\s]?(\d{3,4})[-\s]?(\d{4})\b"), r"\1-****-\3"),
]


class SensitiveDataFilter(logging.Filter):
    """로그 메시지 내 민감정보를 마스킹한다."""

    def filter(self, record: logging.LogRecord) -> bool:
        message = record.getMessage()
        masked = message
        for pattern, replacement in _MASK_PATTERNS:
            masked = pattern.sub(replacement, masked)

        if masked != message:
            record.msg = masked
            record.args = ()

        return True


def install_sensitive_data_filter() -> None:
    root_logger = logging.getLogger()
    for handler in root_logger.handlers:
        handler.addFilter(SensitiveDataFilter())
