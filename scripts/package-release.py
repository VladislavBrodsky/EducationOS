"""Package committed, reviewed sources only. No Git history, env, database or local artifacts."""
import argparse
import hashlib
import subprocess
from pathlib import Path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    status = subprocess.check_output(['git', 'status', '--porcelain'], cwd=root, text=True)
    if status.strip():
        raise SystemExit('Commit reviewed changes before packaging')
    output = args.output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ['git', 'archive', '--format=zip', '--prefix=EducationOS-v0.6.0/',
         '-o', str(output), 'HEAD'], cwd=root, check=True,
    )
    digest = hashlib.sha256(output.read_bytes()).hexdigest()
    output.with_suffix('.sha256').write_text(f'{digest}  {output.name}\n')
    print(f'{output}\nSHA-256 {digest}')


if __name__ == '__main__':
    main()
