# v0.6.0 source release and GitHub handoff

Python-first v0.6.0 supersedes the unfinished v0.5 TypeScript backend plan. [CHANGELOG.md](../CHANGELOG.md) describes changes; [TESTING.md](TESTING.md) records verification. Real enrollment/AI are closed, and no hosting deployment is claimed.

The user's repository is `VladislavBrodsky/EducationOS`. Read metadata succeeded on 2026-10-18, but connector branch creation returned `403 Resource not accessible by integration` despite metadata reporting push permissions. A default-sandbox CLI check also appeared invalid; repeating with network access confirmed a valid keyring session and readable main. The connector failure is an integration limitation, not proof of missing repository rights. The canonical branch was subsequently pushed successfully through the CLI, and [draft PR #2](https://github.com/VladislavBrodsky/EducationOS/pull/2) was created and attached to the active chat. No credentials were modified, and no deployment is claimed.

This source is on branch `codex/python-first-foundation`, tracking the verified remote branch. PR #2 is the canonical Python-first review; the separate earlier frontend PR overlaps files and should not be merged independently without reconciliation. The network-enabled CLI keyring session is valid. If continuing manually, inspect the current remote/PR and source diff before executing:

```sh
git status --short
git log -1 --oneline
git push -u origin codex/python-first-foundation
gh pr create --draft --base main --head codex/python-first-foundation --title "Build Python-first EducationOS foundation" --body-file docs/PR_BODY.md
```

Do not force push. Fetch and compare the remote before pushing if other work has landed. The supplied source bundle contains no credentials, dependency directories, private founder material or real learner records. Public historical documentation and superseded implementation are preserved under `reference/`. Attach a successfully created PR to the active Codex chat; do not describe these commands as a PR creation result.

For a fresh local checkout from the source archive, run `git init`, add the user's origin, fetch the current main, inspect differences and create a review branch based on that main. Prefer the included Git bundle when available because it preserves the exact baseline and source commit. Do not overwrite a newer main with this snapshot.
