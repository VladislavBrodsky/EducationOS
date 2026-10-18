"""Read-only stdio MCP. Public reviewed curriculum only; no private database dependency."""

from uuid import UUID

from mcp.server import MCPServer
from mcp.types import ToolAnnotations

from educationos.config import Settings
from educationos.contracts import AgeBand
from educationos.curriculum import Curriculum

mcp = MCPServer(
    "EducationOS curriculum",
    version="0.6.0",
    instructions=(
        "Read-only reviewed public curriculum. No identities, learner evidence, enrollment, "
        "live AI, network retrieval, or mutation tools are available."
    ),
)
curriculum = Curriculum(Settings().curriculum_path)
_READ_ONLY = ToolAnnotations(
    readOnlyHint=True, destructiveHint=False, idempotentHint=True, openWorldHint=False
)


@mcp.tool(annotations=_READ_ONLY)
def list_missions(age_band: AgeBand | None = None) -> list[dict]:
    """List public immutable mission versions, optionally by age band."""
    return [mission.model_dump(mode="json", by_alias=True) for mission in curriculum.list(age_band)]


@mcp.tool(annotations=_READ_ONLY)
def get_mission(version_id: UUID) -> dict:
    """Read one public mission version and its adult guidance."""
    mission = curriculum.get(version_id)
    if mission is None:
        raise ValueError("Unknown mission version")
    return mission.model_dump(mode="json", by_alias=True)


if __name__ == "__main__":
    mcp.run(transport="stdio")
