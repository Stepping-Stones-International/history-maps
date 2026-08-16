# What is an MCP interface?

MCP means **Model Context Protocol**. It is a common way for an LLM to connect
to an outside application and use that application’s tools and data.

Without MCP, an LLM can describe a map node in text, but it cannot necessarily
create that node in History Maps. With MCP, History Maps can expose tools that
the LLM can use to read and change the local project.

## The basic relationship

There are three parts:

- **The LLM client:** the AI application you are using;
- **The MCP server:** a small History Maps program that understands the MCP
  protocol;
- **History Maps:** the local application and database where the changes are
  saved.

The LLM sends a structured request to the MCP server. The server validates the
request, performs the permitted operation in History Maps, and returns the
result to the LLM.

## What the History Maps MCP server can do

The server can help an LLM:

- list and read topics;
- create and update topics;
- create nodes and layers;
- update dates, coordinates, descriptions, and polygon geometry;
- organize nodes under parent nodes;
- set polygon colors;
- delete nodes when explicitly requested.

The LLM should use the MCP tools instead of pretending that a change was made
through ordinary conversation. Ask it to verify the result by reading the
topic again after a write.

## Example request

You could tell your LLM:

> In my History Maps topic “Second Temple Jewish Context,” create a node titled “Cyrus’s decree and the first authorization to return.” Use an approximate date in 539 BC, add a description with the relevant sources, and place it at the historically likely location of the decree. After creating it, read the topic again and show me the saved node, including its coordinates and date.

For a polygon, be explicit about the historical interpretation:

> Add a layer for the Persian Empire in 332 BC. Use a historically reconstructed approximate boundary, include a source note, and explain that the polygon represents a maximum or approximate extent rather than a precise administrative border. Save it as a polygon layer and verify the saved geometry.

## What MCP does not do

MCP does not make historical claims true and it does not replace source
criticism. An LLM may produce plausible but unsupported dates, coordinates,
citations, or boundaries. Review every result, especially:

- historical dates and era notation;
- coordinates and place identification;
- polygon scope and uncertainty;
- source citations and licenses;
- claims that a boundary was precise when it is reconstructed.

Ask the LLM to distinguish sourced facts from estimates and interpretations.

## Safety and permissions

The human contributor remains responsible for approving changes. Do not give an
LLM passwords, GitHub tokens, SSH keys, or other secrets. Ask the LLM to show
the proposed operation before creating, updating, or deleting data, and ask it
to verify the result afterward.

If an LLM says it changed History Maps but cannot show the saved result, treat
the change as unconfirmed.

## For contributors

The local MCP server is launched from the repository with:

    ruby script/mcp_server.rb

The LLM client must be configured to connect to that server. The exact client
configuration depends on the LLM application. Keep the server and the History
Maps application pointed at the same local database and development
environment.

