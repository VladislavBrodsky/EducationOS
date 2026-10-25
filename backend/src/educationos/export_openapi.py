"""Export reproducibly; run from backend: uv run python -m educationos.export_openapi."""

import argparse
import json
from pathlib import Path

from educationos.main import app


def main():
    path = Path(__file__).resolve().parents[2] / "openapi.json"
    rendered = json.dumps(app.openapi(), indent=2, sort_keys=True) + "\n"
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    if parser.parse_args().check:
        if not path.exists() or path.read_text() != rendered:
            raise SystemExit("OpenAPI export is out of date")
    else:
        path.write_text(rendered)
    print(path)


if __name__ == "__main__":
    main()
