# Contributing with an LLM

Stepping Stones International expects many contributors to use an LLM as a
coding assistant. An LLM can help inspect the repository, make a focused
change, run checks, and prepare a pull request. The human contributor remains
responsible for the account, the sources, the historical interpretation, and
the final review.

## Start with the repository instructions

Give your LLM these files before asking it to change code:

- `README.md`
- `docs/CONTRIBUTING.md`
- this guide
- the specific files related to your proposed change

Ask the LLM to summarize the relevant instructions and identify ambiguity
before it edits files.

## A safe starting prompt

You can begin with:

> You are helping me contribute to the Stepping Stones International history-maps repository. Read `README.md`, `docs/CONTRIBUTING.md`, and `docs/LLM_CONTRIBUTING.md` first. Work only on the requested change. Do not push to `main`, rewrite history, delete data, or expose secrets. Use a descriptive `feature/`, `fix/`, `docs/`, or `chore/` branch. Inspect existing code before editing, use the repository’s patterns, run relevant tests, and report the files changed and checks run.

Then state the change in one or two sentences.

## Fork and branch setup

The human contributor should create the fork and authenticate GitHub access.
Never paste a password, personal access token, SSH private key, or other
secret into the LLM conversation.

After the fork exists, ask the LLM to inspect the remotes. The usual setup is:

    git remote -v
    git remote rename origin upstream
    git remote add origin https://github.com/YOUR-USERNAME/history-maps.git

Create a branch from the current organization `main`:

    git fetch upstream
    git switch main
    git pull --ff-only upstream main
    git switch -c feature/short-description

Use `fix/`, `docs/`, or `chore/` when appropriate. Never use a tool, model,
or assistant name in a branch name.

## Ask the LLM to work in small steps

For each change, ask the LLM to:

1. inspect the relevant files and tests;
2. explain its proposed approach;
3. make the smallest useful edit;
4. show the diff;
5. run the relevant checks;
6. stop for human review before pushing or opening a pull request.

An LLM should not make broad refactors, rewrite history, delete files, alter
production configuration, or change historical content without approval.

## Historical and map-data review

LLMs can produce plausible but unsupported historical claims. For every new
node, layer, polygon, date, or source description, ask the LLM to identify:

- the primary or scholarly source;
- the exact citation or URL;
- the date and geographic scope;
- whether the geometry is a maximum extent, core territory, or approximation;
- what is uncertain or disputed;
- the data license and attribution requirements.

The contributor must verify those claims against the source. Do not accept an
LLM citation merely because it sounds authoritative.

## Testing and review

Ask the LLM to run the checks that match the change:

    make test
    make coverage
    make lint
    make build

The test suite requires at least 90% line coverage. Review the generated diff
yourself, especially migrations, controllers, permissions, map geometries,
source citations, and code that handles user input.

Before pushing, ask the LLM to run:

    git status
    git diff --check
    git diff main...HEAD

The contributor should inspect the final diff and commit message before
allowing a push.

## Pull request handoff

Push only the feature branch to the contributor’s fork:

    git push -u origin feature/short-description

Open a pull request from the fork into
`Stepping-Stones-International/history-maps:main`. Include a summary, reason
for the change, checks that passed, source and license notes, and screenshots
for visible interface changes.

The LLM may draft the pull request description, but the human contributor must
verify it. Never let an LLM merge its own pull request or bypass branch
protection.

