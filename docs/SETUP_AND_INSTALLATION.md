# Setup and installation

History Maps runs locally in Docker. Docker is the supported cross-platform
installation for macOS, Windows, and Linux, so users do not need to install
Ruby or Node.js directly.

## Topic tree

- [Understand the project](#understand-the-project)
  - [What is Git?](#what-is-git)
  - [What is a repository?](#what-is-a-repository)
  - [What is Docker?](#what-is-docker)
  - [What are Ruby and Ruby on Rails?](#what-are-ruby-and-ruby-on-rails)
  - [What is Node.js?](#what-is-nodejs)
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

Git is a tool that lets developers—and anyone working with code—download and
work with code projects. It keeps a history of changes so you can create
branches for your own contributions, collaborate safely, and roll back to an
earlier state if you make a mistake.

GitHub is a website that hosts Git repositories and makes collaboration easier.
Cloning means downloading a local working copy of a repository to your
computer.

### What is a repository?

A repository, or repo, is the project folder plus its Git history. The public
repository is:

    https://github.com/Stepping-Stones-International/history-maps

### What is Docker?

Docker is a tool that packages an application and the software it needs into
an isolated environment called a container. It gives us a uniform runtime, so
the installation works consistently whether someone is running History Maps
from Windows, macOS, or Linux.

History Maps uses Docker to keep the same Ruby, Rails, Node.js, database, and
system libraries together instead of asking every user to install and
configure them separately.

On Windows, Docker Desktop may require the Windows Subsystem for Linux (WSL 2)
and hardware virtualization. See Microsoft's official
[Install WSL guide](https://learn.microsoft.com/en-us/windows/wsl/install).

Docker is not a programming language and it does not replace your operating
system. Docker Desktop is the application that runs containers on Windows and
macOS. On Linux, Docker Engine provides the container runtime.

### What are Ruby and Ruby on Rails?

Ruby is a programming language. Ruby on Rails, usually called Rails, is a web
application framework written in Ruby. Rails provides the server-side parts
of History Maps: users, topics, nodes, database records, validation, routes,
and API responses.

You do not need to install Ruby directly when using Docker. The development
container already includes the project’s required Ruby version.

### What is Node.js?

Node.js is a runtime that lets JavaScript tools run outside a web browser.
History Maps uses Node.js and Yarn to install JavaScript packages and build
the map interface. The browser displays the finished interface; Node.js helps
prepare it during development.

You do not need to install Node.js directly when using Docker. The development
container includes the project’s required Node.js and Yarn versions.

## Choose a setup path

Everyone should install Docker from the official Docker website first. Then
choose one of these paths:

Windows users who have never used Docker may also need to enable WSL 2 and
hardware virtualization during Docker Desktop's first-time setup.

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
