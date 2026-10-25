from datetime import UTC, datetime
from enum import StrEnum
from typing import Annotated, Literal
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    StringConstraints,
    field_validator,
    model_validator,
)
from pydantic.alias_generators import to_camel

CONTRACT_VERSION = "2026-10-18.v1"
STEPS = ("notice", "contradiction", "imagine", "hypothesis", "experiment", "reflect", "transfer")
Text1200 = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=1200)]


class Contract(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="forbid",
        from_attributes=True,
        str_strip_whitespace=True,
    )

    @field_validator("*", mode="after")
    @classmethod
    def normalize_datetimes(cls, value):
        if isinstance(value, datetime) and value.tzinfo is None:
            return value.replace(tzinfo=UTC)
        return value


class AgeBand(StrEnum):
    EXPLORERS = "5-6"
    BUILDERS = "7-9"
    MAKERS = "10-12"
    CREATORS = "13-15"
    LAUNCHERS = "16-17"


StepKind = Literal[
    "notice", "contradiction", "imagine", "hypothesis", "experiment", "reflect", "transfer"
]


class MissionStep(Contract):
    kind: StepKind
    title: str = Field(min_length=1, max_length=80)
    prompt: str = Field(min_length=1, max_length=1600)


class MissionContent(Contract):
    summary: str = Field(min_length=1, max_length=600)
    materials: list[Annotated[str, Field(min_length=1, max_length=100)]] = Field(
        min_length=1, max_length=12
    )
    adult_guidance: Text1200
    steps: list[MissionStep] = Field(min_length=7, max_length=7)

    @model_validator(mode="after")
    def ordered_steps(self):
        if tuple(step.kind for step in self.steps) != STEPS:
            raise ValueError("Seven TRIZ steps must appear once in the documented order")
        return self


class PublishedMission(Contract):
    id: UUID
    mission_id: UUID
    version: int = Field(ge=1)
    title: str = Field(min_length=1, max_length=120)
    age_band: AgeBand
    world: Literal[
        "curiosity-grove", "builder-harbor", "orbit-lab", "future-city", "frontier-studio"
    ]
    published_at: datetime
    content: MissionContent


class MissionList(Contract):
    items: list[PublishedMission]


class StartAttempt(Contract):
    learner_id: UUID
    mission_version_id: UUID


class Attempt(Contract):
    id: UUID
    learner_id: UUID
    mission_version_id: UUID
    status: Literal["active", "complete"]
    created_at: datetime


class TextEvidence(Contract):
    kind: Literal["idea", "observation", "reflection"]
    text: Text1200


class MeasurementEvidence(Contract):
    kind: Literal["measurement"]
    label: str = Field(min_length=1, max_length=80)
    value: float = Field(ge=0, le=10000, allow_inf_nan=False)
    unit: Literal["coins", "grams", "centimeters", "seconds"]


EvidencePayload = Annotated[TextEvidence | MeasurementEvidence, Field(discriminator="kind")]


class CreateEvidence(Contract):
    attempt_id: UUID
    step: StepKind
    payload: EvidencePayload


class Evidence(CreateEvidence):
    id: UUID
    learner_id: UUID
    created_at: datetime
    retention_until: datetime


class EvidenceList(Contract):
    items: list[Evidence]


class ErrorDetail(Contract):
    code: str
    message: str


class ErrorResponse(Contract):
    error: ErrorDetail


class Health(Contract):
    status: Literal["ok", "unavailable"]
    mode: Literal["synthetic-only"] = "synthetic-only"


class SessionInfo(Contract):
    principal_kind: Literal["adult", "learner"]
    tenant_id: UUID
    subject_id: UUID
    synthetic: Literal[True] = True


class DeleteResult(Contract):
    deleted: Literal[True] = True
