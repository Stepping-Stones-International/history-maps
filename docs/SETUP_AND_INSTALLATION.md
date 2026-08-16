# Setup and installation

This guide explains how to download History Maps and start it locally. Docker
Compose is the recommended installation for Windows, macOS, and Linux. You do
not need to install Ruby or Node.js directly when using Docker.

## Topic tree

- [1. What you are installing](#1-what-you-are-installing)
  - [What is Git?](#what-is-git)
  - [What is a repository?](#what-is-a-repository)
- [2. Choose a setup workflow](#2-choose-a-setup-workflow)
  - [Workflow A: Do it yourself](#workflow-a-do-it-yourself)
  - [Workflow B: Have an LLM set it up](#workflow-b-have-an-llm-set-it-up)
- [3. Install Docker](#3-install-docker)
  - [If you are not comfortable using the command line](#if-you-are-not-comfortable-using-the-command-line)
  - [Install Docker yourself](#install-docker-yourself)
- [4. Start History Maps with Docker](#4-start-history-maps-with-docker)
- [5. Native setup for advanced contributors](#5-native-setup-for-advanced-contributors)
- [6. First steps](#6-first-steps)
- [7. Troubleshooting](#7-troubleshooting)
- [8. Getting help](#8-getting-help)

## 1. What you are installing

History Maps is a local web application. The code runs on your computer, and
you open it in a web browser at `http://localhost:3000`.

### What is Git?

Git is software that keeps a history of changes to files. It lets you download
a project, update it, experiment safely on a branch, and return to an earlier
version if necessary.

GitHub is a website that hosts Git repositories. GitHub is not Git itself;
Git is the program on your computer that communicates with GitHub.

### What is a repository?

A repository, or repo, is the project folder plus its Git history. This project
has a public repository at:

    https://github.com/Stepping-Stones-International/history-maps

Cloning means making a local copy of that repository on your computer.

## 2. Choose a setup workflow

There are two supported ways to install History Maps. Choose the one that
matches how you prefer to work. Both workflows produce the same local
application.

### Workflow A: Do it yourself

Follow this path if you want to run each command and understand each step.

#### Clone with the command line

Install Git first. macOS users can install Xcode Command Line Tools with:

    xcode-select --install

Windows and Linux users can install Git from [git-scm.com](https://git-scm.com/downloads).

Then choose a folder for projects and run:

    git clone https://github.com/Stepping-Stones-International/history-maps.git
    cd history-maps

#### Clone with a desktop app

You can also use a Git desktop application such as GitHub Desktop or
Sourcetree. Choose **Clone**, paste the repository URL, select a local folder,
and open the cloned project in a terminal or code editor.

### Workflow B: Have an LLM set it up

An LLM with access to your terminal can clone the repository, check your
prerequisites, run setup, and start the application. Give it the repository
URL and ask it to explain each command before running it:

> Set up History Maps locally from https://github.com/Stepping-Stones-International/history-maps.git. First inspect my environment and explain what you need to do. Clone it into my projects folder only if the destination does not already exist. Check that Docker is installed, then run `docker compose up --build`, report any errors, and open the app only after I approve. Do not delete or overwrite folders, do not ask for or expose secrets, and stop before any destructive command.

The human should approve the destination folder, review commands, and confirm
when the app should start. Never give an LLM your GitHub password, personal
access token, or SSH private key in chat. For contribution work with an LLM,
read the [LLM contribution guide](LLM_CONTRIBUTING.md).

## 3. Install Docker

Docker is the software that creates and runs the History Maps container. On
Windows and macOS, this usually means installing Docker Desktop. On Linux, it
means installing Docker Engine and the Docker Compose plugin.

### Install Docker from the official website

Everyone should install Docker from the official instructions. Do not ask an
LLM to download or install Docker from an unofficial source:

- [Docker Desktop for Windows and macOS](https://www.docker.com/products/docker-desktop/)
- [Docker Engine for Linux](https://docs.docker.com/engine/install/)

After installation, open Docker Desktop or start the Docker service. Wait for
it to finish starting before continuing. You may need to click through an
operating-system security dialog, accept a license, enter your computer
password, or restart the computer yourself. Never give your password to an
LLM.

### If you are not comfortable using the command line

Once Docker is installed and running, you can ask your LLM to guide you
through the remaining commands. The LLM is helping with the command-line
workflow; it is not installing Docker.

Copy and paste this prompt into your LLM:

> Docker is already installed and running on my computer. Help me set up the Stepping Stones International History Maps project from https://github.com/Stepping-Stones-International/history-maps.git. Explain each terminal command before running it. Clone the repository only if the destination does not already exist, then run `docker compose up --build`. Do not delete or overwrite folders, do not ask for or expose passwords, tokens, or private keys, and stop before any destructive command.

The LLM may be able to open a terminal and run the commands, but you should
approve the destination folder and review the commands first.

### Verify Docker

These commands are checks to run after Docker has been installed; they are not
installation commands. Open a terminal:

- macOS: open **Terminal** from Applications;
- Windows: open **PowerShell** from the Start menu;
- Linux: open your preferred terminal application.

Then run:

    docker --version
    docker compose version

You should see a Docker version and a Docker Compose version. If either command
says that it cannot be found, ask your LLM to diagnose the installation rather
than downloading random command-line files from the internet.

## 4. Start History Maps with Docker

From the cloned repository directory, run:

    docker compose up --build

Open [http://localhost:3000](http://localhost:3000) in your browser. Keep the
terminal running while using the application. Stop it with `Ctrl-C`.

The Compose setup persists the local SQLite database, uploaded storage, Ruby
gems, JavaScript packages, and generated assets in Docker volumes. It does not
ship historical data packs with the application.

To run in the background:

    docker compose up --build -d

To stop the background services:

    docker compose down

## 5. Native setup for advanced contributors

Docker is the recommended path. Contributors who specifically want a native
Ruby and Node.js environment can use the versions listed in `.ruby-version`
and `.node-version`:

History Maps currently expects:

- Ruby `3.2.2`;
- Node.js `22.19.0`;
- Yarn;
- Git.

Ruby and Node version managers such as `rbenv`, `asdf`, or `mise` can install
the versions listed in `.ruby-version` and `.node-version`. After installing
Node.js, enable Yarn if your installation does not already provide it.

Check your tools:

    ruby --version
    node --version
    yarn --version
    git --version

From the repository directory, install the application with:

    make setup

Start it with:

    make dev

## 6. First steps

Create or open a topic to work with nodes, layers, dates, descriptions, source
notes, and map geometries. Use the timeline to move through the selected
dates.

Historical data packs are separate from the application code. See
`docs/MAP_DATA.md` for the current source and provenance model.

## 7. Troubleshooting

### Docker does not start

Start Docker Desktop or the Docker service, then run:

    docker compose up --build

### The port is already in use

Stop the other local server, or change the left side of `3000:3000` in
`docker-compose.yml` to another port such as `3001:3000`.

### Dependencies appear corrupted

Rebuild the image without using its build cache:

    docker compose build --no-cache
    docker compose up

Do not run `docker compose down --volumes` unless you intend to remove the
local database and stored topics.

## 8. Getting help

For application questions, open a GitHub issue with the operating system,
Docker version, the command you ran, and the complete error message. Do not
include passwords, tokens, private keys, or private data in an issue.

If you want to change the application or contribute data, continue with the
[contribution guide](CONTRIBUTING.md) or the
[LLM contribution guide](LLM_CONTRIBUTING.md).
