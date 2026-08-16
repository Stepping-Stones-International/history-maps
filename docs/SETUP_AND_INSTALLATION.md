# Setup and installation

This guide explains how to download History Maps, install its dependencies,
and start it locally. You do not need to be a software developer to follow
the first sections.

## Topic tree

- [1. What you are installing](#1-what-you-are-installing)
  - [What is Git?](#what-is-git)
  - [What is a repository?](#what-is-a-repository)
- [2. Download the code](#2-download-the-code)
  - [Clone with the command line](#clone-with-the-command-line)
  - [Clone with a desktop app](#clone-with-a-desktop-app)
  - [Have an LLM clone it for you](#have-an-llm-clone-it-for-you)
- [3. Install prerequisites](#3-install-prerequisites)
- [4. Install History Maps](#4-install-history-maps)
- [5. Start the application](#5-start-the-application)
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

## 2. Download the code

### Clone with the command line

Install Git first. macOS users can install Xcode Command Line Tools with:

    xcode-select --install

Windows and Linux users can install Git from [git-scm.com](https://git-scm.com/downloads).

Then choose a folder for projects and run:

    git clone https://github.com/Stepping-Stones-International/history-maps.git
    cd history-maps

### Clone with a desktop app

You can also use a Git desktop application such as GitHub Desktop or
Sourcetree. Choose **Clone**, paste the repository URL, select a local folder,
and open the cloned project in a terminal or code editor.

### Have an LLM clone it for you

An LLM with access to your terminal can run the clone command for you. Give it
the repository URL and ask it to explain each command before running it:

> Clone the public History Maps repository from https://github.com/Stepping-Stones-International/history-maps.git into my projects folder. Before running commands, explain what each command will do. Do not delete or overwrite an existing folder, do not ask for or expose secrets, and stop if the destination already exists.

The human should approve the destination folder and review commands before
they run. Never give an LLM your GitHub password, personal access token, or
SSH private key in chat. For contribution work with an LLM, read the
[LLM contribution guide](LLM_CONTRIBUTING.md).

## 3. Install prerequisites

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

## 4. Install History Maps

From the cloned repository directory, run:

    make setup

This installs Ruby gems, installs JavaScript packages, and prepares the local
SQLite database. The equivalent individual commands are:

    bundle install
    yarn install
    bin/rails db:prepare

Local databases, temporary files, generated assets, and map data packs are not
shipped with the repository. They remain local to your installation.

## 5. Start the application

Run:

    make dev

Open [http://localhost:3000](http://localhost:3000) in your browser. Keep the
terminal running while using the application. Stop the server with `Ctrl-C`.

If you only want the Rails server and do not need the JavaScript watcher, run:

    make server

## 6. First steps

1. Open or create a topic.
2. Add nodes for events, places, sources, or other teaching notes.
3. Add layers or polygons when a historical region or territory needs to be
   shown.
4. Use the timeline to move through the selected dates.
5. Add citations and uncertainty notes so the map can be evaluated by others.

Historical data packs are separate from the application code. See
`docs/MAP_DATA.md` for the current source and provenance model.

## 7. Troubleshooting

### The command `make` is not found

Run the commands in the Makefile directly, or install the standard build tools
for your operating system.

### The Ruby or Node version is wrong

Install the versions shown in `.ruby-version` and `.node-version`, then run
`make setup` again.

### The port is already in use

Stop the other local server, or start Rails on another port:

    bin/rails server -p 3001

Then open `http://localhost:3001`.

### Dependencies appear corrupted

From the project directory, try:

    bundle install
    yarn install
    bin/rails db:prepare

Do not delete the project or database without first checking whether you need
to preserve local topics and nodes.

## 8. Getting help

For application questions, open a GitHub issue with the operating system,
versions of Ruby and Node, the command you ran, and the complete error message.
Do not include passwords, tokens, private keys, or private data in an issue.

If you want to change the application or contribute data, continue with the
[contribution guide](CONTRIBUTING.md) or the
[LLM contribution guide](LLM_CONTRIBUTING.md).

