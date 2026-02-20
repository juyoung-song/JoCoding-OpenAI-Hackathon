"""API 통합 테스트 (JWT 인증 + 계약 정렬)."""
from urllib.parse import urlparse

import pytest
from httpx import ASGITransport, AsyncClient

from src.core.config import settings
from src.infrastructure.persistence.cache_service import CacheService
from src.infrastructure.persistence.database import get_app_db, get_cache_db, init_db
from src.infrastructure.persistence.seed_offline_mock_data import seed_offline_mock_data
from src.infrastructure.providers.mock_providers import MockRoutingProvider, MockWeatherProvider
from src.main import app


@pytest.fixture
async def client():
    await init_db()
    db = await get_app_db()
    cache_db = await get_cache_db()
    cache = CacheService(cache_db)
    await seed_offline_mock_data(db)

    app.state.db = db
    app.state.cache_db = cache_db
    app.state.routing = MockRoutingProvider()
    app.state.weather = MockWeatherProvider()
    app.state.place = None
    app.state.shopping = None
    app.state.cache = cache

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    await db.close()
    await cache_db.close()


async def login(client: AsyncClient, email: str, name: str = "테스터") -> dict[str, str]:
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "name": name},
    )
    assert resp.status_code == 200
    body = resp.json()
    return {
        "Authorization": f"Bearer {body['access_token']}",
        "refresh_token": body["refresh_token"],
    }


@pytest.fixture
async def auth(client):
    return await login(client, "tester1@ddokjang.ai", "Tester1")


class TestHealthCheck:
    @pytest.mark.asyncio
    async def test_health(self, client):
        resp = await client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"

    @pytest.mark.asyncio
    async def test_api_root(self, client):
        resp = await client.get("/api/v1")
        assert resp.status_code == 200
        data = resp.json()
        assert data["prefix"] == "/api/v1"


class TestAuthAPI:
    @pytest.mark.asyncio
    async def test_login_me_refresh_logout(self, client):
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "authcase@ddokjang.ai", "name": "Auth Case"},
        )
        assert login_resp.status_code == 200
        login_data = login_resp.json()
        assert login_data["token_type"] == "bearer"
        headers = {"Authorization": f"Bearer {login_data['access_token']}"}

        me_resp = await client.get("/api/v1/auth/me", headers=headers)
        assert me_resp.status_code == 200
        me_data = me_resp.json()
        assert me_data["email"] == "authcase@ddokjang.ai"

        refresh_resp = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": login_data["refresh_token"]},
        )
        assert refresh_resp.status_code == 200
        refreshed = refresh_resp.json()
        assert refreshed["access_token"]

        logout_resp = await client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {refreshed['access_token']}"},
            json={"refresh_token": refreshed["refresh_token"]},
        )
        assert logout_resp.status_code == 200

    @pytest.mark.asyncio
    async def test_unauthorized_request_blocked(self, client):
        resp = await client.get("/api/v1/basket")
        assert resp.status_code == 401


class TestBasketAPI:
    @pytest.mark.asyncio
    async def test_get_add_remove_clear(self, client, auth):
        headers = {"Authorization": auth["Authorization"]}

        await client.delete("/api/v1/basket", headers=headers)
        resp = await client.get("/api/v1/basket", headers=headers)
        assert resp.status_code == 200
        assert resp.json()["items"] == []

        add_resp = await client.post(
            "/api/v1/basket/items",
            headers=headers,
            json={"item_name": "계란", "size": "30구", "quantity": 1},
        )
        assert add_resp.status_code == 200
        assert any(i["item_name"] == "계란" for i in add_resp.json()["items"])

        remove_resp = await client.delete("/api/v1/basket/items/계란", headers=headers)
        assert remove_resp.status_code == 200
        assert not any(i["item_name"] == "계란" for i in remove_resp.json()["items"])

    @pytest.mark.asyncio
    async def test_user_data_isolation(self, client):
        auth1 = await login(client, "user-a@ddokjang.ai", "UserA")
        auth2 = await login(client, "user-b@ddokjang.ai", "UserB")
        h1 = {"Authorization": auth1["Authorization"]}
        h2 = {"Authorization": auth2["Authorization"]}

        await client.delete("/api/v1/basket", headers=h1)
        await client.delete("/api/v1/basket", headers=h2)

        await client.post(
            "/api/v1/basket/items",
            headers=h1,
            json={"item_name": "우유", "quantity": 2},
        )
        basket1 = await client.get("/api/v1/basket", headers=h1)
        basket2 = await client.get("/api/v1/basket", headers=h2)

        assert any(item["item_name"] == "우유" for item in basket1.json()["items"])
        assert all(item["item_name"] != "우유" for item in basket2.json()["items"])


class TestChatAPI:
    @pytest.mark.asyncio
    async def test_greeting_and_message(self, client, auth):
        headers = {"Authorization": auth["Authorization"]}

        greet = await client.get("/api/v1/chat/greeting", headers=headers)
        assert greet.status_code == 200
        assert greet.json()["role"] == "assistant"

        msg = await client.post(
            "/api/v1/chat/message",
            headers=headers,
            json={"message": "안녕하세요"},
        )
        assert msg.status_code == 200
        assert msg.json()["role"] == "assistant"

    @pytest.mark.asyncio
    async def test_chat_does_not_fallback_to_agent_disconnected_message(self, client, auth):
        headers = {"Authorization": auth["Authorization"]}
        msg = await client.post(
            "/api/v1/chat/message",
            headers=headers,
            json={"message": "우유 1개 담아줘"},
        )
        assert msg.status_code == 200
        payload = msg.json()
        assert "현재 AI 에이전트에 연결할 수 없어요" not in payload["content"]
        assert payload["diff"] is not None

    @pytest.mark.asyncio
    async def test_chat_can_add_non_alias_item(self, client, auth):
        headers = {"Authorization": auth["Authorization"]}
        msg = await client.post(
            "/api/v1/chat/message",
            headers=headers,
            json={"message": "깻잎 1개 담아줘"},
        )
        assert msg.status_code == 200
        payload = msg.json()
        assert payload["diff"] is not None
        assert any(diff["item"]["item_name"] == "깻잎" for diff in payload["diff"])

    @pytest.mark.asyncio
    async def test_chat_remove_item_generates_diff(self, client, auth):
        headers = {"Authorization": auth["Authorization"]}
        await client.post(
            "/api/v1/basket/items",
            headers=headers,
            json={"item_name": "우유", "quantity": 1},
        )
        msg = await client.post(
            "/api/v1/chat/message",
            headers=headers,
            json={"message": "우유 빼줘"},
        )
        assert msg.status_code == 200
        payload = msg.json()
        assert payload["diff"] is not None
        assert any(diff["action"] == "remove" for diff in payload["diff"])

    @pytest.mark.asyncio
    async def test_chat_show_cart_returns_summary_without_mutation(self, client, auth):
        headers = {"Authorization": auth["Authorization"]}
        await client.delete("/api/v1/basket", headers=headers)
        await client.post(
            "/api/v1/basket/items",
            headers=headers,
            json={"item_name": "계란", "size": "30구", "quantity": 1},
        )

        msg = await client.post(
            "/api/v1/chat/message",
            headers=headers,
            json={"message": "장바구니 보여줘"},
        )
        assert msg.status_code == 200
        payload = msg.json()
        assert "장바구니" in payload["content"]
        assert payload["diff"] == []


class TestPlansAPI:
    @pytest.mark.asyncio
    async def test_generate_online_offline_and_compat(self, client, auth):
        headers = {"Authorization": auth["Authorization"]}
        payload = {
            "items": [
                {"item_name": "계란", "size": "30구", "quantity": 1},
                {"item_name": "우유", "quantity": 2},
                {"item_name": "두부", "quantity": 1},
            ]
        }

        online = await client.post("/api/v1/online/plans/generate", headers=headers, json=payload)
        offline = await client.post("/api/v1/offline/plans/generate", headers=headers, json=payload)
        compat = await client.post("/api/v1/plans/generate?mode=online", headers=headers, json=payload)

        assert online.status_code in {200, 206}
        assert offline.status_code in {200, 206}
        assert compat.status_code in {200, 206}

        online_data = online.json()
        assert online_data["top3"]
        assert "request_id" in online_data["meta"]

    @pytest.mark.asyncio
    async def test_online_select_invalid_redirect_url_returns_400(self, client, auth):
        headers = {"Authorization": auth["Authorization"]}
        payload = {
            "items": [
                {"item_name": "계란", "size": "30구", "quantity": 1},
                {"item_name": "우유", "quantity": 1},
            ]
        }
        generated = await client.post("/api/v1/online/plans/generate", headers=headers, json=payload)
        assert generated.status_code in {200, 206}
        generated_data = generated.json()

        selected_plan_type = generated_data["top3"][0]["plan_type"]
        mall_name = generated_data["top3"][0]["mart_name"]
        select_resp = await client.post(
            "/api/v1/online/plans/select",
            headers=headers,
            json={
                "request_id": generated_data["meta"]["request_id"],
                "selected_plan_type": selected_plan_type,
                "mall_name": mall_name,
                "cart_redirect_url": "https://evil.example.com/hijack",
            },
        )
        assert select_resp.status_code == 400
        assert select_resp.json()["detail"]["code"] == "INVALID_REDIRECT_URL"

    @pytest.mark.asyncio
    async def test_online_cart_url_whitelist(self, client, auth):
        headers = {"Authorization": auth["Authorization"]}
        payload = {
            "items": [
                {"item_name": "우유", "quantity": 1},
                {"item_name": "두부", "quantity": 1},
            ]
        }
        resp = await client.post("/api/v1/online/plans/generate", headers=headers, json=payload)
        assert resp.status_code in {200, 206}
        data = resp.json()

        allowed = {"ssg.com", "homeplus.co.kr", "kurly.com", "coupang.com", "lotteon.com"}
        for plan in data["top3"]:
            cart_url = plan.get("cart_url")
            if not cart_url:
                continue
            host = (urlparse(cart_url).hostname or "").lower()
            assert any(host == domain or host.endswith(f".{domain}") for domain in allowed)


class TestPaymentsAPI:
    @pytest.mark.asyncio
    async def test_create_confirm_and_idempotency(self, client, auth):
        headers = {"Authorization": auth["Authorization"]}
        idempotent_headers = {
            **headers,
            "Idempotency-Key": "idem-payment-1",
        }

        payload = {
            "request_id": "req-payment-001",
            "amount_won": 28900,
            "currency": "KRW",
            "mall_name": "이마트몰 (SSG)",
            "plan_type": "cheapest",
            "budget_cap_won": 30000,
            "allowed_malls": ["이마트몰 (SSG)", "홈플러스"],
        }

        first = await client.post("/api/v1/payments/intents", headers=idempotent_headers, json=payload)
        assert first.status_code == 200
        first_data = first.json()

        second = await client.post("/api/v1/payments/intents", headers=idempotent_headers, json=payload)
        assert second.status_code == 200
        second_data = second.json()
        assert second_data["intent_id"] == first_data["intent_id"]

        confirm = await client.post(
            f"/api/v1/payments/intents/{first_data['intent_id']}/confirm",
            headers=headers,
            json={"simulate_result": "success"},
        )
        assert confirm.status_code == 200
        assert confirm.json()["status"] == "succeeded"
        assert confirm.json()["confirmed_at"] is not None

    @pytest.mark.asyncio
    async def test_payment_guardrails(self, client, auth):
        headers = {"Authorization": auth["Authorization"]}
        budget_fail = await client.post(
            "/api/v1/payments/intents",
            headers=headers,
            json={
                "request_id": "req-payment-guard-budget",
                "amount_won": 45000,
                "currency": "KRW",
                "mall_name": "홈플러스",
                "budget_cap_won": 40000,
                "allowed_malls": ["홈플러스"],
            },
        )
        assert budget_fail.status_code == 400
        assert budget_fail.json()["detail"]["code"] == "BUDGET_CAP_EXCEEDED"

        mall_fail = await client.post(
            "/api/v1/payments/intents",
            headers=headers,
            json={
                "request_id": "req-payment-guard-mall",
                "amount_won": 21000,
                "currency": "KRW",
                "mall_name": "쿠팡",
                "budget_cap_won": 22000,
                "allowed_malls": ["이마트몰 (SSG)", "홈플러스"],
            },
        )
        assert mall_fail.status_code == 400
        assert mall_fail.json()["detail"]["code"] == "MALL_NOT_ALLOWED"


class TestOpsAPI:
    @pytest.mark.asyncio
    async def test_online_plan_metrics_and_gate(self, client, auth):
        headers = {"Authorization": auth["Authorization"]}
        payload = {
            "items": [
                {"item_name": "우유", "quantity": 1},
                {"item_name": "계란", "size": "30구", "quantity": 1},
            ]
        }
        plan_resp = await client.post("/api/v1/online/plans/generate", headers=headers, json=payload)
        assert plan_resp.status_code in {200, 206}

        metrics_resp = await client.get("/api/v1/ops/metrics/online-plans", headers=headers)
        assert metrics_resp.status_code == 200
        metrics = metrics_resp.json()
        assert metrics["total_requests"] >= 1
        assert "latency" in metrics
        assert "p99_ms" in metrics["latency"]

        gate_resp = await client.get("/api/v1/ops/gates/online-plan-latency", headers=headers)
        assert gate_resp.status_code == 200
        gate = gate_resp.json()
        assert gate["gate_name"] == "online_plan_latency"
        assert isinstance(gate["passed"], bool)


class TestPublicDataAPI:
    @pytest.mark.asyncio
    async def test_public_catalog_sync_skips_without_credentials(self, client, auth, monkeypatch):
        headers = {"Authorization": auth["Authorization"]}
        monkeypatch.setattr(settings, "kamis_cert_key", "__SET_IN_SECRET_MANAGER__", raising=False)
        monkeypatch.setattr(settings, "kamis_cert_id", "__SET_IN_SECRET_MANAGER__", raising=False)

        resp = await client.post(
            "/api/v1/public-data/catalog/sync",
            headers=headers,
            json={"category_codes": ["100"]},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "skipped"
        assert data["reason"]
        assert data["categories"] == ["100"]

    @pytest.mark.asyncio
    async def test_public_catalog_list_returns_synced_items(self, client, auth):
        headers = {"Authorization": auth["Authorization"]}
        product_key = "상추|참가격|100g"

        store_row_cursor = await app.state.db.execute("SELECT store_id FROM store_master LIMIT 1")
        store_row = await store_row_cursor.fetchone()
        await store_row_cursor.close()
        assert store_row is not None
        store_id = str(store_row["store_id"])

        await app.state.db.execute(
            """INSERT OR REPLACE INTO product_norm
               (product_norm_key, normalized_name, brand, size_value, size_unit, size_display, category, aliases_json, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                product_key,
                "상추",
                "참가격",
                100.0,
                "g",
                "100g",
                "100",
                None,
                "2026-02-20T00:00:00+00:00",
            ),
        )
        await app.state.db.execute(
            """INSERT OR REPLACE INTO offline_price_snapshot
               (price_snapshot_key, store_id, product_norm_key, price_won, observed_at, source, notice, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                f"{store_id}|상추|2026-02-20|test",
                store_id,
                product_key,
                2890,
                "2026-02-20T00:00:00+00:00",
                "참가격",
                "테스트 데이터",
                "2026-02-20T00:00:00+00:00",
            ),
        )
        await app.state.db.commit()

        resp = await client.get(
            "/api/v1/public-data/catalog/items?limit=10&q=상추",
            headers=headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] >= 1
        assert any(item["normalized_name"] == "상추" for item in data["items"])

        await app.state.db.execute(
            "DELETE FROM offline_price_snapshot WHERE product_norm_key = ?",
            (product_key,),
        )
        await app.state.db.execute(
            "DELETE FROM product_norm WHERE product_norm_key = ?",
            (product_key,),
        )
        await app.state.db.commit()


class TestPreferencesAPI:
    @pytest.mark.asyncio
    async def test_add_remove_clear_brand(self, client, auth):
        headers = {"Authorization": auth["Authorization"]}

        await client.delete("/api/v1/preferences/brands", headers=headers)
        add_resp = await client.post(
            "/api/v1/preferences/brands",
            headers=headers,
            json={"brand": "서울우유", "type": "like"},
        )
        assert add_resp.status_code == 200
        assert "서울우유" in add_resp.json()["brands"]

        rm_resp = await client.delete(
            "/api/v1/preferences/brands/서울우유?type=like",
            headers=headers,
        )
        assert rm_resp.status_code == 200
        assert "서울우유" not in rm_resp.json()["brands"]


class TestReservationsAPI:
    @pytest.mark.asyncio
    async def test_create_update_delete_reservation(self, client, auth):
        headers = {"Authorization": auth["Authorization"]}

        created = await client.post(
            "/api/v1/reservations",
            headers=headers,
            json={
                "label": "금요일 장보기",
                "weekday": "fri",
                "time": "18:30",
                "schedule_type": "weekly",
                "timezone": "Asia/Seoul",
                "channel": "in_app",
                "planned_items": ["우유", "계란", "두부"],
            },
        )
        assert created.status_code == 200
        created_data = created.json()
        assert created_data["schedule_type"] == "weekly"
        assert created_data["next_run_at"] is not None
        assert created_data["retry_count"] == 0

        updated = await client.patch(
            f"/api/v1/reservations/{created_data['id']}",
            headers=headers,
            json={"enabled": False, "status": "paused", "time": "19:00"},
        )
        assert updated.status_code == 200
        assert updated.json()["status"] == "paused"

        deleted = await client.delete(f"/api/v1/reservations/{created_data['id']}", headers=headers)
        assert deleted.status_code == 200
        assert all(row["id"] != created_data["id"] for row in deleted.json()["reservations"])


class TestUserDataAPI:
    @pytest.mark.asyncio
    async def test_profile_and_orders(self, client, auth):
        headers = {"Authorization": auth["Authorization"]}

        profile = await client.get("/api/v1/users/me/profile", headers=headers)
        assert profile.status_code == 200
        profile_data = profile.json()

        profile_data["name"] = "프로필 수정"
        profile_data["phone"] = "010-1234-5678"
        upsert = await client.put("/api/v1/users/me/profile", headers=headers, json=profile_data)
        assert upsert.status_code == 200
        assert upsert.json()["name"] == "프로필 수정"

        order = await client.post(
            "/api/v1/users/me/orders",
            headers=headers,
            json={"id": "ORD-test-1", "martName": "이마트", "totalPrice": 12300},
        )
        assert order.status_code == 200
        listed = await client.get("/api/v1/users/me/orders", headers=headers)
        assert listed.status_code == 200
        assert any(row.get("id") == "ORD-test-1" for row in listed.json()["orders"])


class TestSTTAPI:
    @pytest.mark.asyncio
    async def test_transcribe_no_file(self, client):
        resp = await client.post("/api/v1/stt/transcribe")
        assert resp.status_code == 200
        assert resp.json()["is_stub"] is True

    @pytest.mark.asyncio
    async def test_transcribe_with_file(self, client):
        dummy_audio = b"\x00" * 1024
        resp = await client.post(
            "/api/v1/stt/transcribe",
            files={"file": ("test.wav", dummy_audio, "audio/wav")},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["is_stub"] is True
        assert data["text"]
