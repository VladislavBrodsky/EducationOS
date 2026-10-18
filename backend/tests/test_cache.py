import copy
import json

import pytest

from educationos.cache import PublicCatalogCache


class MemoryRedis:
    def __init__(self, value):
        self.value = value
        self.writes = []

    async def get(self, key):
        return self.value

    async def set(self, key, value, *, ex):
        self.writes.append((key, value, ex))
        self.value = value


@pytest.mark.parametrize("corruption", ["changed_prompt", "malformed_json"])
async def test_cache_cannot_replace_reviewed_curriculum(fixture_app, corruption):
    curriculum = fixture_app.state.curriculum
    reviewed = [mission.model_dump(mode="json", by_alias=True) for mission in curriculum.missions]
    altered = copy.deepcopy(reviewed)
    altered[0]["content"]["steps"][0]["prompt"] = "Unreviewed instructions with a valid schema."
    cached = json.dumps(altered) if corruption == "changed_prompt" else b"{invalid JSON"
    redis = MemoryRedis(cached)
    result = await PublicCatalogCache(redis).catalog(curriculum.digest, reviewed)
    assert result == reviewed
    assert json.loads(redis.value) == reviewed
    assert redis.writes[0][0] == f"educationos:public:catalog:{curriculum.digest}"
    assert redis.writes[0][2] == 300


async def test_verified_cache_entry_returns_reviewed_source(fixture_app):
    curriculum = fixture_app.state.curriculum
    reviewed = [mission.model_dump(mode="json", by_alias=True) for mission in curriculum.missions]
    redis = MemoryRedis(json.dumps(reviewed))
    result = await PublicCatalogCache(redis).catalog(curriculum.digest, reviewed)
    assert result is reviewed
    assert redis.writes == []
