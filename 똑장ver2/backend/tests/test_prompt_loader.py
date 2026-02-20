from src.application.prompts.loader import PromptTemplateError, load_prompt_template, render_prompt


def test_load_analyzer_prompt_template():
    template = load_prompt_template("analyzer.system.txt")
    assert "{preferences}" in template
    assert "{basket_status}" in template
    assert '"intent": "modify"' in template


def test_render_analyzer_prompt_template():
    rendered = render_prompt(
        "analyzer.system.txt",
        preferences="선호: 없음 / 비선호: 없음",
        basket_status="계란(추천), 우유(추천)",
    )
    assert "선호: 없음 / 비선호: 없음" in rendered
    assert "계란(추천), 우유(추천)" in rendered
    assert '"intent": "modify"' in rendered


def test_render_prompt_requires_variables():
    try:
        render_prompt("analyzer.system.txt", preferences="x")
    except PromptTemplateError as exc:
        assert "basket_status" in str(exc)
    else:
        raise AssertionError("PromptTemplateError expected")
