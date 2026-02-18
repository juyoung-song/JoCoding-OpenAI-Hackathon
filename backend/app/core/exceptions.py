"""도메인별 커스텀 예외 정의."""


class TtokjangError(Exception):
    """똑장 기본 예외."""

    def __init__(self, message: str = "알 수 없는 오류가 발생했습니다."):
        self.message = message
        super().__init__(self.message)


class BasketError(TtokjangError):
    """장바구니 관련 예외."""
    pass


class PriceError(TtokjangError):
    """가격 수집 관련 예외."""
    pass


class PlanError(TtokjangError):
    """플랜 생성 관련 예외."""
    pass


class ProviderError(TtokjangError):
    """외부 API Provider 관련 예외."""
    pass


class ChatError(TtokjangError):
    """챗봇/LLM 관련 예외."""
    pass
