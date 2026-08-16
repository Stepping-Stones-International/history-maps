# Contributing

Stepping Stones International welcomes contributions to the application, map data,
source documentation, and teaching materials.

Many contributors will work with an LLM. See
[Contributing with an LLM](LLM_CONTRIBUTING.md) for a guided fork, branch,
review, and pull-request workflow.

## Workflow

`main` is the protected integration branch. Do not push directly to it. Work
on a focused branch, push it to your fork, and open a pull request into
`Stepping-Stones-International/history-maps:main`.

The fork’s checks should pass before you request review.

Use branch prefixes such as `feature/`, `fix/`, `docs/`, and `chore/`. Do not
use tool or assistant names in branch names.

Start from the latest `main`:

    git fetch upstream
    git switch main
    git pull --ff-only upstream main
    git switch -c feature/short-description

If you have a local clone, keep the organization repository as `upstream` and
your fork as `origin`:

    git remote rename origin upstream
    git remote add origin https://github.com/YOUR-USERNAME/history-maps.git

## Development checks

Install dependencies and prepare the database with `make setup`. Run the
application with `make dev`. Before opening a pull request, run:

    make test
    make coverage
    make lint
    make build

The test suite requires at least 90% line coverage. `make coverage` writes the
HTML report to `coverage/index.html`. GitHub Actions runs the build and test
jobs for pushes and pull requests.

## Map data and historical content

Map overlays must preserve their provenance. When adding or changing data:

1. Identify the source, citation, URL, and license.
2. Keep attribution with the extracted data.
3. Put reproducible extraction scripts in `script/`.
4. Document historical uncertainty and the date represented by a geometry.
5. Distinguish maximum extent, core territory, and approximate reconstruction.

## Pull requests

Use a clear imperative commit subject, such as `Add coverage command to
Makefile`. Explain what changed, why it changed, how it was tested, and any
source or historical uncertainties. Include screenshots for visible map or
interface changes.

Before pushing, review the change with `git status`, `git diff --check`, and
`git diff main...HEAD`. Push to your fork with:

    git push -u origin feature/short-description

Keep secrets, local databases, temporary files, and generated coverage output
out of commits. Delete the working branch after its pull request is merged.
Stepping Stones International welcomes contributions to the application, map data,
source documentation, and teaching materials.

Many contributors will work with an LLM. See
[Contributing with an LLM](LLM_CONTRIBUTING.md) for a guided fork, branch,
review, and pull-request workflow.
