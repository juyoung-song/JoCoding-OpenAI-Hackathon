import asyncio
from app.infrastructure.providers.naver_shopping import NaverShoppingProvider
from app.domain.models.basket import BasketItem, ItemMode

async def test():
    provider = NaverShoppingProvider()
    
    # Test items
    items = [
        BasketItem(item_name="신라면", quantity=1, mode=ItemMode.RECOMMEND),
        BasketItem(item_name="계란", size="30구", quantity=1, mode=ItemMode.RECOMMEND),
    ]
    
    for item in items:
        print(f"\n--- Searching for {item.item_name} ---")
        results = await provider.search_products(item)
        if not results:
            print("No results found.")
            continue
            
        for res in results:
            print(f"[{res.source}] {res.product_name} - {res.price}원")
            
        # Verify sources
        sources = {res.source for res in results}
        print(f"\nUnique Sources: {sources}")

if __name__ == "__main__":
    asyncio.run(test())
