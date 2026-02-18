import os
import asyncio
import httpx
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv("NAVER_CLIENT_ID")
CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET")

async def search():
    url = "https://openapi.naver.com/v1/search/shop.json"
    headers = {
        "X-Naver-Client-Id": CLIENT_ID,
        "X-Naver-Client-Secret": CLIENT_SECRET,
    }
    # Search for common items to get major marts
    queries = ["신라면 5개입", "계란 30구", "서울우유 1L"]
    
    unique_malls = set()
    
    for q in queries:
        params = {"query": q, "display": 100, "sort": "sim"}
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=headers, params=params)
            data = resp.json()
            for item in data.get("items", []):
                unique_malls.add(item["mallName"])

    print("Found Malls:", sorted(list(unique_malls)))

asyncio.run(search())
