import hashlib
import json
from pathlib import Path
from uuid import UUID

from pydantic import TypeAdapter

from educationos.contracts import AgeBand, PublishedMission


class Curriculum:
    """Reviewed public material only. Published versions are immutable by content digest."""

    def __init__(self, path: Path):
        raw = path.read_bytes()
        self.missions = TypeAdapter(list[PublishedMission]).validate_json(raw)
        self.by_id = {mission.id: mission for mission in self.missions}
        if len(self.by_id) != len(self.missions):
            raise ValueError("Duplicate curriculum version ID")
        self.digest = hashlib.sha256(raw).hexdigest()

    def list(self, age_band: AgeBand | None = None) -> list[PublishedMission]:
        return [m for m in self.missions if age_band is None or m.age_band == age_band]

    def get(self, version_id: UUID) -> PublishedMission | None:
        return self.by_id.get(version_id)

    @staticmethod
    def version_digest(mission: PublishedMission) -> str:
        canonical = json.dumps(mission.model_dump(mode="json", by_alias=True), sort_keys=True)
        return hashlib.sha256(canonical.encode()).hexdigest()
