"""Resolve public OCI indexes without Docker or registry credentials."""
import json
import urllib.request
from datetime import UTC, datetime
from pathlib import Path

IMAGES = {
    "postgres": ("pgvector/pgvector", "pg18-bookworm"),
    "redis": ("library/redis", "8-bookworm"),
    "python": ("library/python", "3.13-slim-bookworm"),
    "node": ("library/node", "24-bookworm-slim"),
}

evidence = {}
for name, (repository, tag) in IMAGES.items():
    url = f"https://auth.docker.io/token?service=registry.docker.io&scope=repository:{repository}:pull"
    with urllib.request.urlopen(url, timeout=30) as response:
        token = json.load(response)["token"]
    request = urllib.request.Request(
        f"https://registry-1.docker.io/v2/{repository}/manifests/{tag}",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.list.v2+json",
        },
        method="HEAD",
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        digest = response.headers["Docker-Content-Digest"]
    image = f"{repository.removeprefix('library/')}:{tag}@{digest}"
    evidence[name] = {"image": image, "verified_at": datetime.now(UTC).isoformat()}
    print(name, image)

destination = Path(__file__).resolve().parents[1] / "infra/images.json"
destination.write_text(json.dumps(evidence, indent=2) + "\n")
