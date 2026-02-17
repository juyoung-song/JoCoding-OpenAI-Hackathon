from __future__ import annotations

import importlib.util
import sys
from pathlib import Path


def _load_module():
    script_path = Path(__file__).resolve().parent.parent / "scripts" / "sync_kamis_prices.py"
    spec = importlib.util.spec_from_file_location("sync_kamis_prices", script_path)
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    sys.modules["sync_kamis_prices"] = module
    spec.loader.exec_module(module)
    return module


def test_parse_price() -> None:
    module = _load_module()
    assert module._parse_price("1,234") == 1234
    assert module._parse_price("0") is None
    assert module._parse_price("-") is None


def test_parse_unit() -> None:
    module = _load_module()
    value, unit, display = module._parse_unit("1kg")
    assert value == 1.0
    assert unit == "kg"
    assert display == "1kg"

    value2, unit2, display2 = module._parse_unit("30개")
    assert value2 == 30.0
    assert unit2 == "ea"
    assert display2 == "30개"


def test_extract_items() -> None:
    module = _load_module()
    payload = {
        "data": {
            "error_code": "000",
            "item": [
                {"item_name": "배추", "unit": "1포기", "dpr1": "3,200"},
                {"item_name": "무", "unit": "1개", "price": "2,100"},
                {"item_name": "빈값", "unit": "1개", "price": "-"},
            ],
        },
    }
    items = module._extract_items(payload, "100")
    assert len(items) == 2
    assert items[0].item_name == "배추"
    assert items[0].price_won == 3200
