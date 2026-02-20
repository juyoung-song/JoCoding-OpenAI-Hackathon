#!/bin/bash

# API Base URL
API_URL="http://localhost:8000/api/v1"

echo "=== 통합 테스트 시작 ==="

# 0. 장바구니 초기화
echo "\n[Step 0] 장바구니 초기화"
curl -X DELETE "$API_URL/basket" -H "accept: application/json"

# 1. 장바구니 아이템 추가
echo "\n\n[Step 1] 장바구니 아이템 추가 (우유 2개, 라면 5개)"
curl -X POST "$API_URL/basket/items" \
     -H "Content-Type: application/json" \
     -d '{ "item_name": "우유", "quantity": 2, "category": "dairy" }'

curl -X POST "$API_URL/basket/items" \
     -H "Content-Type: application/json" \
     -d '{ "item_name": "신라면", "quantity": 5, "category": "noodle" }'

echo "\n\n[Step 2] 장바구니 조회 (초기 상태)"
curl -X GET "$API_URL/basket" -H "accept: application/json"

# 2. 수량 변경 (PATCH)
echo "\n\n[Step 3] 우유 수량 변경 (2 -> 5)"
curl -X PATCH "$API_URL/basket/items/우유" \
     -H "Content-Type: application/json" \
     -d '{ "item_name": "우유", "quantity": 5 }'

echo "\n\n[Step 4] 장바구니 조회 (변경 후)"
curl -X GET "$API_URL/basket" -H "accept: application/json"

# 3. 아이템 삭제 (DELETE)
echo "\n\n[Step 5] 신라면 삭제"
curl -X DELETE "$API_URL/basket/items/신라면" \
     -H "accept: application/json"

echo "\n\n[Step 6] 장바구니 조회 (삭제 후: 우유 5개만 있어야 함)"
curl -X GET "$API_URL/basket" -H "accept: application/json"

# 4. 플랜 생성 테스트
echo "\n\n[Step 7] 플랜 생성 요청"
curl -X POST "$API_URL/plans/generate" \
     -H "Content-Type: application/json" \
     -d '{}'

# 5. 채팅 테스트 (Timeout 30초 설정)
echo "\n\n[Step 8] AI 채팅 메시지 전송"
curl -X POST "$API_URL/chat/message" \
     -H "Content-Type: application/json" \
     --max-time 30 \
     -d '{ "message": "우유 말고 딴거 추천해줘" }'

echo "\n\n=== 통합 테스트 완료 ==="
