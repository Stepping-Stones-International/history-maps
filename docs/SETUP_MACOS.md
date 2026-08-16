# Install History Maps on macOS

[← Setup and installation](SETUP_AND_INSTALLATION.md) · [Windows setup](SETUP_WINDOWS.md) · [LLM-assisted setup](SETUP_WITH_LLM.md)

This is the self-guided macOS installation. It uses Docker so you do not need
to install Ruby or Node.js directly.

## 1. Install Docker Desktop

Download and install [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/).
Choose the installer that matches your Mac, open Docker Desktop, and wait until
Docker finishes starting.

## 2. Install Git

Install Git from [git-scm.com](https://git-scm.com/download/mac), or install
Apple's Command Line Tools by opening Terminal and running:

    xcode-select --install

## 3. Download History Maps

Open **Terminal** from Applications and run:

    git clone https://github.com/Stepping-Stones-International/history-maps.git
    cd history-maps

## 4. Start the application

Run:

    docker compose up --build

Open [http://localhost:3000](http://localhost:3000) in your browser. Keep the
Terminal window open while using the application. Press `Control-C` to stop it.

To run it in the background:

    docker compose up --build -d

Stop background services with:

    docker compose down

Do not use `docker compose down --volumes` unless you intend to remove your
local database and stored topics.

## 5. If something goes wrong

Make sure Docker Desktop is open. Then try:

    docker compose build --no-cache
    docker compose up

If port 3000 is already in use, change `3000:3000` in `docker-compose.yml` to
`3001:3000` and open `http://localhost:3001`.
