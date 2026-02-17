# prices.json 생성 스크립트 - 한번 실행 후 삭제 가능
import json, random

random.seed(42)

with open('E:/AI/똑장/backend/mock/stores.json', encoding='utf-8') as f:
    stores = json.load(f)
with open('E:/AI/똑장/backend/mock/products.json', encoding='utf-8') as f:
    products = json.load(f)

base_prices = {
    '두부|풀무원|300g': 1500,
    '계란|무항생제|30ea': 6000,
    '우유|서울우유|1000ml': 2500,
    '우유|매일유업|1000ml': 2600,
    '양파|국내산|1000g': 2500,
    '감자|국내산|1000g': 3500,
    '고구마|국내산|1000g': 4500,
    '사과|국내산|1500g': 8900,
    '바나나|수입산|1pack': 3500,
    '삼겹살|국내산|600g': 15800,
    '닭가슴살|하림|500g': 6500,
    '대파|국내산|1pack': 1800,
    '당근|국내산|500g': 2200,
    '시금치|국내산|200g': 2500,
    '애호박|국내산|1ea': 1500,
    '배추|국내산|1ea': 3500,
    '무|국내산|1ea': 1800,
    '오이|국내산|3ea': 3000,
    '마늘|국내산|300g': 5500,
    '생강|국내산|100g': 2800,
    '콩나물|풀무원|300g': 1200,
    '버섯|국내산|300g': 2200,
    '요거트|빙그레|100ml': 3200,
    '소고기|국내산|300g': 18500,
    '돼지목살|국내산|500g': 12800,
    '신라면|농심|5pack': 3800,
    '진라면|오뚜기|5pack': 3500,
    '참치캔|동원|150g': 2200,
    '김치|종가집|500g': 5500,
    '고추장|해찬들|500g': 4800,
    '된장|해찬들|500g': 3500,
    '간장|샘표|500ml': 3200,
    '식용유|CJ|900ml': 4500,
    '밀가루|CJ|1000g': 1800,
    '설탕|CJ|1000g': 2500,
    '소금|해표|500g': 1200,
    '쌀|국내산|10000g': 28000,
    '햇반|CJ|210g': 3600,
    '스팸|CJ|340g': 5800,
    '어묵|삼진|450g': 3800,
    '김|동원|10pack': 4500,
    '맛살|대림선|150g': 2200,
    '떡볶이떡|풀무원|500g': 2800,
    '케찹|오뚜기|300g': 2500,
    '마요네즈|오뚜기|500g': 3800,
    '참기름|오뚜기|160ml': 6500,
    '카레|오뚜기|100g': 2200,
    '물|제주삼다수|2000ml': 6800,
    '콜라|코카콜라|1500ml': 2500,
    '식빵|삼립|420g': 2800,
    '당면|오뚜기|500g': 3200,
    '미역|해표|50g': 2800,
    '멸치|국내산|150g': 5500,
    '부침가루|CJ|1000g': 2200,
    '휴지|깨끗한나라|30pack': 12800,
    '물티슈|쏘피아|100ea': 1800,
    '세제|피죤|2500ml': 9800,
    '섬유유연제|다우니|2000ml': 8500,
    '샴푸|엘라스틴|500ml': 7800,
    '린스|엘라스틴|500ml': 7500,
    '바디워시|온더바디|900ml': 8200,
    '치약|LG|140g': 5500,
    '칫솔|오랄비|4ea': 6800,
    '쓰레기봉투|배꼽|50ea': 5500,
    '주방세제|자연퐁|500ml': 2800,
    '수세미|3M|3ea': 3200,
    '키친타올|크리넥스|4pack': 5500,
    '지퍼백|크린랩|20ea': 3200,
    '랩|크린랩|30m': 2800,
    '호일|크린랩|10m': 2500,
    '비누|LG|100g': 3800,
    '면봉|깨끗한나라|200ea': 1500,
    '화장솜|코튼클럽|80ea': 2200,
    '건전지|듀라셀|4ea': 5500,
    '표백제|유한락스|1000ml': 2800,
}

prices = []
for store in stores:
    sid = store['store_id']
    cat = store['category']
    for prod in products:
        pk = prod['product_norm_key']
        if random.random() > 0.70:
            continue
        base = base_prices.get(pk, 3000)
        if cat == '대형마트':
            variation = random.uniform(0.97, 1.03)
        elif cat == '중형슈퍼':
            variation = random.uniform(1.05, 1.15)
        else:
            variation = random.uniform(1.15, 1.30)
        price = round(base * variation / 10) * 10
        prices.append({
            'price_snapshot_key': f'{sid}|{pk}|2026-02-14',
            'store_id': sid,
            'product_norm_key': pk,
            'price_won': price,
            'observed_at': '2026-02-14T00:00:00+09:00',
            'source': 'mock',
            'notice': '테스트용 데이터, 실제 가격 아님',
            'created_at': '2026-02-14T00:00:00+09:00'
        })

print(f'Total: {len(prices)} price entries')
with open('E:/AI/똑장/backend/mock/prices.json', 'w', encoding='utf-8') as f:
    json.dump(prices, f, ensure_ascii=False, indent=2)
print('prices.json written successfully')
