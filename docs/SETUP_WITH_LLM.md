# Install History Maps with an LLM

[← Setup and installation](SETUP_AND_INSTALLATION.md) · [macOS setup](SETUP_MACOS.md) · [Windows setup](SETUP_WINDOWS.md)

This guide is for people who have Docker installed but are not comfortable
using terminal or command-line commands. The LLM helps with the repository
setup; you install Docker yourself from the official Docker website.

## 1. Install Docker yourself

Install Docker Desktop from the official website:

- [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
- [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)

Open Docker Desktop and wait until it finishes starting. You may need to
approve an operating-system permission or restart your computer. Never give
your computer password to an LLM.

## 2. Give your LLM a safe instruction

Open an LLM that can access your local terminal and give it this prompt:

> Docker is already installed and running on my computer. Help me set up the Stepping Stones International History Maps project from https://github.com/Stepping-Stones-International/history-maps.git. Explain each command before running it. Clone the repository only if the destination does not already exist, then run `docker compose up --build`. Open http://localhost:3000 when it is ready. Do not delete or overwrite folders, do not ask for or expose passwords, tokens, or private keys, and stop before any destructive command.

The LLM should:

1. check that Docker is running;
2. choose or confirm a project folder;
3. clone the repository;
4. change into the repository directory;
5. run `docker compose up --build`;
6. tell you when the application is ready.

Approve the folder and commands yourself. If the LLM proposes deleting a
folder, deleting Docker volumes, or installing unrelated software, stop and
ask why before continuing.

## 3. Use the application

Open [http://localhost:3000](http://localhost:3000). The LLM can help explain
the interface, but you remain responsible for reviewing historical claims,
citations, and data sources.

## 4. Stop the application

Ask the LLM to explain and run:

    docker compose down

Do not use `docker compose down --volumes` unless you intentionally want to
remove the local database and stored topics.

## 5. If something goes wrong

Ask the LLM to diagnose the exact error and show the proposed command before
running it. You can also open an issue with your operating system, Docker
version, command, and complete error message. Never include passwords, tokens,
private keys, or private data.
