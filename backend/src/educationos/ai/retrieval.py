import math
import re
from collections.abc import Sequence
from dataclasses import dataclass
from typing import Protocol
from uuid import UUID

from educationos.contracts import AgeBand
from educationos.curriculum import Curriculum


@dataclass(frozen=True)
class Chunk:
    source_uri: str
    source_digest: str
    ordinal: int
    text: str
    age_band: AgeBand
    start: int
    end: int


@dataclass(frozen=True)
class Citation:
    source_uri: str
    source_digest: str
    ordinal: int
    start: int
    end: int
    excerpt: str


class Embedder(Protocol):
    """Provider adapter must preserve provenance; production adapter intentionally absent."""

    model_id: str
    dimensions: int

    async def embed(self, texts: Sequence[str]) -> Sequence[Sequence[float]]: ...


def validate_embeddings(values: Sequence[Sequence[float]], count: int, dimensions: int = 384):
    if len(values) != count:
        raise ValueError("Embedding count mismatch")
    for vector in values:
        if len(vector) != dimensions or not all(math.isfinite(v) for v in vector):
            raise ValueError("Embedding dimensions or values invalid")


def chunks(curriculum: Curriculum, window: int = 600, overlap: int = 100) -> list[Chunk]:
    if not 0 <= overlap < window <= 1600:
        raise ValueError("Invalid chunk bounds")
    result = []
    for mission in curriculum.missions:
        source_digest = curriculum.version_digest(mission)
        ordinal = 0
        for step in mission.content.steps:
            text = step.prompt
            for start in range(0, len(text), window - overlap):
                end = min(start + window, len(text))
                result.append(
                    Chunk(
                        f"curriculum://{mission.id}/steps/{step.kind}",
                        source_digest,
                        ordinal,
                        text[start:end],
                        mission.age_band,
                        start,
                        end,
                    )
                )
                ordinal += 1
                if end == len(text):
                    break
    return result


def tokens(text: str) -> set[str]:
    return set(re.findall(r"[a-z]{3,}", text.casefold()))


def retrieve(
    curriculum: Curriculum,
    query: str,
    age_band: AgeBand,
    mission_version_id: UUID | None = None,
    limit: int = 3,
) -> list[Citation]:
    """Deterministic lexical baseline, not semantic search or generated advice."""
    if not 1 <= len(query.strip()) <= 160 or not 1 <= limit <= 5:
        raise ValueError("Retrieval query or limit out of bounds")
    query_tokens = tokens(query)
    candidates = [chunk for chunk in chunks(curriculum) if chunk.age_band == age_band]
    if mission_version_id:
        candidates = [
            c for c in candidates if c.source_uri.startswith(f"curriculum://{mission_version_id}/")
        ]
    ranked = sorted(
        candidates, key=lambda c: (-len(query_tokens & tokens(c.text)), c.source_uri, c.ordinal)
    )
    return [
        Citation(c.source_uri, c.source_digest, c.ordinal, c.start, c.end, c.text)
        for c in ranked
        if query_tokens & tokens(c.text)
    ][:limit]
