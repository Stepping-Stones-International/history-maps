# User and developer guide

[← Setup and installation](SETUP_AND_INSTALLATION.md) · [Map data and sources](MAP_DATA.md) · [Report an issue](REPORTING_ISSUES.md)

## Set up a development copy

The application is a Rails project with a JavaScript map interface. Install
Ruby and Node.js, then run:

    make setup

This installs dependencies and prepares the development database. Start the
local application with:

    make dev

Then open `http://localhost:3000`.

## Use the application

Create or open a topic to work with nodes, layers, dates, descriptions, source
notes, and map geometries. Timeline controls can be used to study events and
territories in historical sequence.

Useful commands:

| Command | Purpose |
|---|---|
| `make dev` | Start the Rails server and JavaScript watcher |
| `make server` | Start only the Rails server |
| `make build` | Build JavaScript assets once |
| `make test` | Run the test suite |
| `make coverage` | Run tests and open the HTML coverage report |
| `make lint` | Run RuboCop |
