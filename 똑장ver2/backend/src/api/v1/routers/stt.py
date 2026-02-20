"""STT (Speech-to-Text) API 라우터 — MVP stub."""
from __future__ import annotations

import logging

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/stt", tags=["STT"])
logger = logging.getLogger(__name__)


class STTResponse(BaseModel):
    text: str
    confidence: float = 0.0
    is_stub: bool = True


@router.post("/transcribe", response_model=STTResponse)
async def transcribe_audio(file: UploadFile = File(None)):
    """
    음성 → 텍스트 변환.

    Sprint 1(MVP): Whisper 미연동 — stub 응답 반환.
    실제 구현 시 OpenAI Whisper API 또는 로컬 Whisper 모델 연동.
    """
    if file is None:
        return STTResponse(
            text="(음성 파일을 첨부해주세요)",
            confidence=0.0,
            is_stub=True,
        )

    # 파일 크기 검증 (최대 25MB — Whisper 제한)
    content = await file.read()
    if len(content) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="파일 크기가 25MB를 초과합니다.")

    # MVP stub — 실제 음성 처리 없이 안내 메시지 반환
    logger.info("STT 요청 수신: %s (%.1fKB)", file.filename, len(content) / 1024)

    return STTResponse(
        text="계란 30구 우유 2개 두부 하나 담아줘",
        confidence=0.85,
        is_stub=True,
    )
