"""품목명 정규화 서비스 (Canonicalization)."""

import re

class CanonicalizationService:
    """사용자가 입력한 품목명을 시스템 표준 ID(Canonical ID)로 변환한다."""
    
    # MVP용 간단 매핑 테이블 (나중엔 DB나 별도 파일로 분리)
    KEYWORD_MAP = {
        "계란": "EGG", "달걀": "EGG", "특란": "EGG", "대란": "EGG",
        "두부": "TOFU",
        "우유": "MILK",
        "콩나물": "BEAN_SPROUT",
        "신라면": "SHIN_RAMYUN", "진라면": "JIN_RAMYUN",
        "햇반": "RICE_INSTANT",
        "파": "GREEN_ONION", "대파": "GREEN_ONION",
        "양파": "ONION",
        "마늘": "GARLIC",
        "삼겹살": "PORK_BELLY", "목살": "PORK_NECK",
    }
    
    def get_canonical_id(self, item_name: str, size: str | None = None) -> str:
        """
        품목명과 용량을 분석해 표준 ID를 반환한다.
        매칭 실패 시 원본 item_name을 대문자로 사용.
        
        예: 
          - "계란", "30구" -> "EGG_30"
          - "두부", "300g" -> "TOFU_300"
          - "풀무원 두부", "1모" -> "TOFU_1ETC" (or just TOFU)
        """
        # 1. 품목명에서 핵심 키워드 추출
        code = self._extract_code(item_name)
        if not code:
            return f"UNKNOWN_{item_name.upper()}"

        # 2. 용량/규격 파싱 (숫자만 추출)
        suffix = ""
        if size:
            # "30구" -> "30", "300g" -> "300"
            numbers = re.findall(r"\d+", size)
            if numbers:
                suffix = f"_{numbers[0]}"
        
        # 3. 예외 처리 (계란은 30구가 표준)
        if code == "EGG" and not suffix:
            suffix = "_30" # Default

        return f"{code}{suffix}"

    def _extract_code(self, name: str) -> str | None:
        """품목명에 매핑 키워드가 포함되어 있는지 확인."""
        name = name.replace(" ", "") # 공백 제거 후 검색
        for key, code in self.KEYWORD_MAP.items():
            if key in name:
                return code
        return None
