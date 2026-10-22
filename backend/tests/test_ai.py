from uuid import UUID

import pytest

from educationos.ai.evaluation import ADVERSARIAL_FIXTURES, evaluate
from educationos.ai.policy import PROMPTS, moderate_offline_query, require_live_ai_access
from educationos.ai.retrieval import chunks, retrieve, validate_embeddings
from educationos.contracts import AgeBand
from educationos.errors import DomainError


def test_reviewed_retrieval_carries_verifiable_provenance(fixture_app):
    curriculum = fixture_app.state.curriculum
    citations = retrieve(curriculum, "shape paper bridge", AgeBand.MAKERS)
    assert 1 <= len(citations) <= 3
    for citation in citations:
        source_id, step = citation.source_uri.removeprefix("curriculum://").split("/steps/")
        mission = next(m for m in curriculum.missions if str(m.id) == source_id)
        prompt = next(s.prompt for s in mission.content.steps if s.kind == step)
        assert citation.source_digest == curriculum.version_digest(mission)
        assert prompt[citation.start : citation.end] == citation.excerpt
        assert mission.age_band == AgeBand.MAKERS
    assert all(evaluate(curriculum).values())


def test_chunking_and_embedding_contracts(fixture_app):
    assert all(
        len(c.text) <= 600 and c.end - c.start == len(c.text)
        for c in chunks(fixture_app.state.curriculum)
    )
    validate_embeddings([[0.0] * 384], count=1)
    for values in ([[0.0] * 12], [[float("nan")] * 384], []):
        with pytest.raises(ValueError):
            validate_embeddings(values, count=1)


def test_moderation_fixtures_and_provider_gate():
    assert all(not moderate_offline_query(q).allowed for q in ADVERSARIAL_FIXTURES)
    assert moderate_offline_query("Why do folds strengthen paper?").allowed
    assert len(PROMPTS["curriculum_hint.v1"].digest) == 64
    with pytest.raises(TypeError):
        PROMPTS["new"] = "override"
    with pytest.raises(DomainError) as caught:
        require_live_ai_access()
    assert caught.value.status == 503


def test_mcp_tools_expose_only_public_curriculum():
    from educationos.mcp_server import get_mission, list_missions

    items = list_missions(AgeBand.MAKERS)
    assert len(items) == 1
    assert get_mission(UUID(items[0]["id"])) == items[0]
    assert "learnerId" not in str(items)


async def test_mcp_stdio_handshake_and_tool_allowlist():
    import sys

    from mcp import ClientSession
    from mcp.client.stdio import StdioServerParameters, stdio_client

    parameters = StdioServerParameters(
        command=sys.executable, args=["-m", "educationos.mcp_server"]
    )
    async with stdio_client(parameters) as streams:
        async with ClientSession(*streams) as session:
            await session.initialize()
            result = await session.list_tools()
            assert {tool.name for tool in result.tools} == {"list_missions", "get_mission"}
            assert all(tool.annotations.read_only_hint for tool in result.tools)
            response = await session.call_tool("list_missions", {"age_band": "10-12"})
            assert not response.is_error
            assert "adultGuidance" in str(response.content)
