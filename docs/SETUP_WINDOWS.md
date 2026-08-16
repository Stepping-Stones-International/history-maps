# Install History Maps on Windows

This is the self-guided Windows installation. It uses Docker Desktop so you do
not need to install Ruby or Node.js directly.

## 1. Install Docker Desktop

Download and install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/).
Follow Docker's Windows instructions, including any WSL 2 or virtualization
requirements. Open Docker Desktop and wait until it finishes starting.

## 2. Install Git

Install [Git for Windows](https://git-scm.com/download/win). Git for Windows
includes Git Bash; you may use Git Bash or PowerShell for the commands below.

## 3. Download History Maps

Open **PowerShell** from the Start menu, or open Git Bash, and run:

    git clone https://github.com/Stepping-Stones-International/history-maps.git
    cd history-maps

## 4. Start the application

Run:

    docker compose up --build

Open [http://localhost:3000](http://localhost:3000) in your browser. Keep the
PowerShell or Git Bash window open while using the application. Press
`Control-C` to stop it.

To run it in the background:

    docker compose up --build -d

Stop background services with:

    docker compose down

Do not use `docker compose down --volumes` unless you intend to remove your
local database and stored topics.

## 5. If something goes wrong

Make sure Docker Desktop is open and that WSL 2 or virtualization is enabled
if Docker requests it. Then try:

    docker compose build --no-cache
    docker compose up

If port 3000 is already in use, change `3000:3000` in `docker-compose.yml` to
`3001:3000` and open `http://localhost:3001`.

