import asyncio
import httpx
import sys

# Backend URL
BASE_URL = "http://localhost:8000/api/v1"

async def main():
    print("--- Verifying Brand Preferences ---")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # 1. 선호 브랜드 설정 (계란 -> 풀무원)
        print("\n1. Setting Preference: EGG_30 -> 풀무원")
        pref_payload = {
            "user_id": "test_user",
            "canonical_item_id": "EGG_30",
            "preferred_brand": "풀무원",
            "preferred_variant": "목초란 15구"
        }
        resp = await client.post(f"{BASE_URL}/preferences/brands", json=pref_payload)
        if resp.status_code != 200:
            print(f"❌ Failed to set preference: {resp.text}")
            return
        print(f"✅ Preference Set: {resp.json()}")

        # 2. 채팅으로 상품 추가 요청 (브랜드 언급 없이)
        print("\n2. Sending Chat: '계란 30구 추가해줘'")
        chat_payload = {
            "session_id": "test_session",
            "message": "계란 30구 추가해줘"
        }
        resp = await client.post(f"{BASE_URL}/chat/message", json=chat_payload)
        if resp.status_code != 200:
            print(f"❌ Chat failed: {resp.text}")
            return
        
        chat_data = resp.json()
        print(f"✅ Chat Response:")
        print(f"  Content: {chat_data['content']}")
        
        # 3. Diff 확인
        if not chat_data['diff']:
            print("❌ No diff found in response.")
        else:
            found_locked = False
            for item in chat_data['diff']:
                print(f"  Diff Item: {item['item']['item_name']} | Brand: {item['item']['brand']} | Mode: {item['item']['mode']}")
                if item['item']['brand'] == "풀무원" and item['item']['mode'] == "fixed":
                    found_locked = True
            
            if found_locked:
                print("\n🎉 SUCCESS: Preferred Brand Applied (LOCKED Mode)!")
            else:
                print("\n❌ FAILURE: Preferred Brand NOT Applied.")

if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
