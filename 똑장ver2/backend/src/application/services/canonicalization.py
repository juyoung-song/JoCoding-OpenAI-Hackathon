class CanonicalizationService:
    # MVP용 간단 매핑
    KEYWORD_MAP = {
        "계란": "EGG_30", "달걀": "EGG_30",
        "우유": "MILK_1L",
        "두부": "TOFU_300",
        "삼겹살": "PORK_BELLY_600",
        "라면": "RAMEN_5", "신라면": "RAMEN_5",
        "참이슬": "SOJU_CHAMISUL_360ML",
        "소주": "SOJU_CHAMISUL_360ML",
        "비타500": "VITA500_100ML",
        "비타 500": "VITA500_100ML",
    }

    def get_canonical_id(self, item_name: str, size: str | None) -> str:
        """
        품목명 -> 표준 ID 변환
        예: '신선한 계란' -> 'EGG_30'
        """
        for key, value in self.KEYWORD_MAP.items():
            if key in item_name:
                return value
        return "UNKNOWN_ITEM"
