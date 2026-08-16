# Setup and installation

History Maps runs locally in Docker. Docker is the supported cross-platform
installation for macOS, Windows, and Linux, so users do not need to install
Ruby or Node.js directly.

## Topic tree

- [Understand the project](#understand-the-project)
  - [What is Git?](#what-is-git)
  - [What is a repository?](#what-is-a-repository)
- [Choose a setup path](#choose-a-setup-path)
  - [Do it yourself on macOS](SETUP_MACOS.md)
  - [Do it yourself on Windows](SETUP_WINDOWS.md)
  - [Have an LLM guide the setup](SETUP_WITH_LLM.md)
- [After installation](#after-installation)
- [Contributing](#contributing)

## Understand the project

History Maps is a local web application. The code runs on your computer and
you open it in a web browser at `http://localhost:3000`.

### What is Git?

Git is software that keeps a history of changes to files. GitHub is a website
that hosts Git repositories. Cloning means making a local copy of a repository
on your computer.

### What is a repository?

A repository, or repo, is the project folder plus its Git history. The public
repository is:

    https://github.com/Stepping-Stones-International/history-maps

## Choose a setup path

Everyone should install Docker from the official Docker website first. Then
choose one of these paths:

- [Do it yourself on macOS](SETUP_MACOS.md)
- [Do it yourself on Windows](SETUP_WINDOWS.md)
- [Have an LLM guide the setup](SETUP_WITH_LLM.md)

The self-guided paths explain Docker, Git, cloning, and starting the app for
each platform. The LLM path assumes Docker is already installed and asks the
LLM to guide the command-line setup.

## After installation

Open [http://localhost:3000](http://localhost:3000). Create or open a topic to
work with nodes, layers, dates, descriptions, source notes, and map geometries.
Use the timeline to move through the selected dates.

The Docker Compose setup stores the local database, uploaded storage, and
generated assets in Docker volumes. Historical data packs are separate from
the application code.

## Contributing

For code, data, or documentation contributions, see the
[contribution guide](CONTRIBUTING.md). If an LLM will help with contribution
work, also read the [LLM contribution guide](LLM_CONTRIBUTING.md).
