"""챗봇 장바구니 파싱 로직 단위 테스트."""
from langchain_core.messages import HumanMessage

from src.application.graph import _build_item_followup, _parse_modify_intent


def test_parse_context_followup_uses_previous_item():
    messages = [
        HumanMessage(content="삼겹살"),
        HumanMessage(content="원산지는 어디든 딱히 상관없고 냉동으로 싼거 1kg 추가해줘"),
    ]

    action, item_name, quantity, _, size, needs_followup, _ = _parse_modify_intent(
        messages[-1].content, messages
    )

    assert action == "add"
    assert item_name == "삼겹살"
    assert quantity == 1
    assert size == "1kg"
    assert needs_followup is False


def test_parse_tofu_one_mo():
    message = "두부 한 모 담아줘"
    action, item_name, quantity, _, size, needs_followup, _ = _parse_modify_intent(
        message, [HumanMessage(content=message)]
    )

    assert action == "add"
    assert item_name == "두부"
    assert quantity == 1
    assert size == "1모"
    assert needs_followup is False


def test_parse_multiple_items_in_one_message():
    message = "우유, 계란, 두부 담아줘"
    action, item_name, quantity, _, _, needs_followup, extras = _parse_modify_intent(
        message, [HumanMessage(content=message)]
    )

    parsed_names = [item_name, *[item[0] for item in extras]]
    assert action == "add"
    assert quantity == 1
    assert needs_followup is False
    assert parsed_names == ["우유", "계란", "두부"]


def test_vita500_followup_uses_ml_example():
    message = "비타500"
    action, item_name, _, _, _, needs_followup, _ = _parse_modify_intent(
        message, [HumanMessage(content=message)]
    )

    assert action == "add"
    assert item_name == "비타500"
    assert needs_followup is True
    assert "100ml" in _build_item_followup("비타500")

