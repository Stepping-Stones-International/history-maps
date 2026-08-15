#!/usr/bin/env ruby

ENV["RAILS_ENV"] ||= "development"

require_relative "../config/environment"
require_relative "../lib/christian_history_maps/mcp_server"

ChristianHistoryMaps::McpServer.new.run
