require "json"

module ChristianHistoryMaps
  class McpServer
    PROTOCOL_VERSION = "2024-11-05"

    NODE_KEYS = %w[
      title description latitude longitude parent_id position marker
      date_type occurred_month occurred_day occurred_year era
      starts_type starts_month starts_day starts_year starts_era
      ends_type ends_month ends_day ends_year ends_era
      layer area_json polygon_color
    ].freeze

    TOPIC_KEYS = %w[
      title description center_latitude center_longitude zoom map_packs
    ].freeze

    TOPIC_PROPERTIES = {
      title: { type: "string" },
      description: { type: "string" },
      center_latitude: { type: [ "number", "string", "null" ] },
      center_longitude: { type: [ "number", "string", "null" ] },
      zoom: { type: [ "number", "string", "null" ] },
      map_packs: { type: "array", items: { type: "string", enum: Topic::MAP_PACKS.keys } },
      author_email: { type: "string" }
    }.freeze

    NODE_PROPERTIES = {
      title: { type: "string" },
      description: { type: "string" },
      latitude: { type: [ "number", "string", "null" ] },
      longitude: { type: [ "number", "string", "null" ] },
      parent_id: { type: [ "string", "null" ] },
      position: { type: [ "integer", "string", "null" ] },
      marker: { type: "string" },
      date_type: { type: "string", enum: Node::DATE_TYPES.keys },
      occurred_month: { type: [ "integer", "string", "null" ] },
      occurred_day: { type: [ "integer", "string", "null" ] },
      occurred_year: { type: [ "integer", "string", "null" ] },
      era: { type: "string", enum: Node::ERAS },
      starts_type: { type: "string", enum: Node::RANGE_TYPES.keys },
      starts_month: { type: [ "integer", "string", "null" ] },
      starts_day: { type: [ "integer", "string", "null" ] },
      starts_year: { type: [ "integer", "string", "null" ] },
      starts_era: { type: "string", enum: Node::ERAS },
      ends_type: { type: "string", enum: Node::RANGE_TYPES.keys },
      ends_month: { type: [ "integer", "string", "null" ] },
      ends_day: { type: [ "integer", "string", "null" ] },
      ends_year: { type: [ "integer", "string", "null" ] },
      ends_era: { type: "string", enum: Node::ERAS },
      area_json: { type: "string" },
      polygon_color: { type: "string" }
    }.freeze

    TOOL_SCHEMAS = {
      "list_topics" => {
        description: "List topics, optionally scoped to one author's email address.",
        inputSchema: {
          type: "object",
          properties: {
            author_email: { type: "string" }
          }
        }
      },
      "create_topic" => {
        description: "Create a topic for the configured or explicitly supplied author.",
        inputSchema: {
          type: "object",
          properties: TOPIC_PROPERTIES,
          required: [ "title" ]
        }
      },
      "update_topic" => {
        description: "Update a topic's title, description, default view, or map packs.",
        inputSchema: {
          type: "object",
          properties: TOPIC_PROPERTIES.merge(topic_id: { type: "string" }),
          required: [ "topic_id" ]
        }
      },
      "get_topic" => {
        description: "Get a topic and its nodes.",
        inputSchema: {
          type: "object",
          properties: {
            topic_id: { type: "string" },
            author_email: { type: "string" }
          },
          required: [ "topic_id" ]
        }
      },
      "create_node" => {
        description: "Create a waypoint node in a topic.",
        inputSchema: {
          type: "object",
          properties: NODE_PROPERTIES.merge(
            topic_id: { type: "string" },
            author_email: { type: "string" }
          ),
          required: [ "topic_id", "title" ]
        }
      },
      "update_node" => {
        description: "Update a node or layer in a topic.",
        inputSchema: {
          type: "object",
          properties: NODE_PROPERTIES.merge(
            topic_id: { type: "string" },
            node_id: { type: "string" },
            author_email: { type: "string" }
          ),
          required: [ "topic_id", "node_id" ]
        }
      },
      "delete_node" => {
        description: "Delete a node or layer from a topic.",
        inputSchema: {
          type: "object",
          properties: {
            topic_id: { type: "string" },
            node_id: { type: "string" },
            author_email: { type: "string" }
          },
          required: [ "topic_id", "node_id" ]
        }
      },
      "create_layer" => {
        description: "Create a layer node in a topic. Coordinates are optional because layers can be placeless.",
        inputSchema: {
          type: "object",
          properties: NODE_PROPERTIES.merge(
            topic_id: { type: "string" },
            author_email: { type: "string" }
          ),
          required: [ "topic_id", "title" ]
        }
      }
    }.freeze

    def initialize(input: STDIN, output: STDOUT, env: ENV)
      @input = input
      @output = output
      @env = env
    end

    def run
      while (message = read_message)
        handle(message)
      end
    end

    def handle(message)
      case message["method"]
      when "initialize"
        respond(message["id"], {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: { tools: {} },
          serverInfo: { name: "christian-history-maps", version: "0.1.0" }
        })
      when "tools/list"
        respond(message["id"], {
          tools: TOOL_SCHEMAS.map { |name, schema| schema.merge(name: name) }
        })
      when "tools/call"
        call = message.fetch("params", {})
        result = call_tool(call["name"], call["arguments"] || {})
        respond(message["id"], result)
      when /^notifications\//
        nil
      else
        respond_error(message["id"], -32601, "Unknown method: #{message['method']}")
      end
    rescue ActiveRecord::RecordNotFound => error
      respond_error(message["id"], -32004, error.message)
    rescue KeyError => error
      respond_error(message["id"], -32602, error.message)
    rescue JSON::ParserError => error
      respond_error(message["id"], -32700, error.message)
    rescue StandardError => error
      respond_error(message["id"], -32603, "#{error.class}: #{error.message}")
    end

    def call_tool(name, arguments)
      payload = case name
      when "list_topics" then list_topics(arguments)
      when "create_topic" then create_topic(arguments)
      when "update_topic" then update_topic(arguments)
      when "get_topic" then serialize_topic(topic_scope(arguments).find(fetch_arg(arguments, "topic_id")), include_nodes: true)
      when "create_node" then create_node(arguments, layer: false)
      when "create_layer" then create_node(arguments, layer: true)
      when "update_node" then update_node(arguments)
      when "delete_node" then delete_node(arguments)
      else
        raise KeyError, "Unknown tool: #{name}"
      end

      json_content(payload)
    rescue ActiveRecord::RecordInvalid => error
      json_content({ ok: false, errors: error.record.errors.to_hash }, is_error: true)
    end

    private
      attr_reader :input, :output, :env

      def list_topics(arguments)
        topics = topic_scope(arguments).includes(:author).order(:title)
        { ok: true, topics: topics.map { |topic| serialize_topic(topic) } }
      end

      def create_topic(arguments)
        author = user_for(arguments)
        topic = author.topics.create!(topic_attributes(arguments))

        { ok: true, topic: serialize_topic(topic.reload) }
      end

      def update_topic(arguments)
        topic = topic_scope(arguments).find(fetch_arg(arguments, "topic_id"))
        topic.update!(topic_attributes(arguments))

        { ok: true, topic: serialize_topic(topic.reload) }
      end

      def create_node(arguments, layer:)
        topic = topic_scope(arguments).find(fetch_arg(arguments, "topic_id"))
        node = topic.nodes.create!(node_attributes(arguments).merge(layer: layer))

        { ok: true, node: serialize_node(node.reload) }
      end

      def update_node(arguments)
        topic = topic_scope(arguments).find(fetch_arg(arguments, "topic_id"))
        node = topic.nodes.find(fetch_arg(arguments, "node_id"))
        node.update!(node_attributes(arguments))

        { ok: true, node: serialize_node(node.reload) }
      end

      def delete_node(arguments)
        topic = topic_scope(arguments).find(fetch_arg(arguments, "topic_id"))
        node = topic.nodes.find(fetch_arg(arguments, "node_id"))
        serialized = serialize_node(node)
        node.destroy!

        { ok: true, node: serialized }
      end

      def topic_scope(arguments)
        user_for(arguments)&.topics || Topic.all
      end

      def user_for(arguments)
        email = arguments["author_email"].presence || env["MCP_USER_EMAIL"].presence
        return unless email

        User.find_by!(email_address: email.strip.downcase)
      end

      def topic_attributes(arguments)
        arguments.slice(*TOPIC_KEYS).compact
      end

      def node_attributes(arguments)
        # Preserve explicit nulls so MCP updates can clear optional coordinates,
        # parents, or area data without affecting fields that were omitted.
        arguments.slice(*NODE_KEYS)
      end

      def fetch_arg(arguments, key)
        arguments.fetch(key).presence || raise(KeyError, "Missing required argument: #{key}")
      end

      def serialize_topic(topic, include_nodes: false)
        result = {
          id: topic.id,
          title: topic.title,
          description: topic.description,
          author_email: topic.author.email_address,
          default_view: topic.default_view,
          map_packs: topic.map_packs
        }
        result[:nodes] = topic.nodes.order(:created_at).map { |node| serialize_node(node) } if include_nodes
        result
      end

      def serialize_node(node)
        {
          id: node.id,
          topic_id: node.topic_id,
          title: node.title,
          description: node.sanitized_description_html,
          marker: node.marker,
          layer: node.layer,
          parent_id: node.parent_id,
          position: node.position,
          date_type: node.date_type,
          date_display: node.date_display,
          occurred_month: node.occurred_month,
          occurred_day: node.occurred_day,
          occurred_year: node.occurred_year,
          era: node.era,
          starts_type: node.starts_type,
          starts_month: node.starts_month,
          starts_day: node.starts_day,
          starts_year: node.starts_year,
          starts_era: node.starts_era,
          ends_type: node.ends_type,
          ends_month: node.ends_month,
          ends_day: node.ends_day,
          ends_year: node.ends_year,
          ends_era: node.ends_era,
          latitude: node.latitude,
          longitude: node.longitude,
          area: node.area,
          area_json: node.area_json,
          polygon_color: node.polygon_color
        }
      end

      def json_content(payload, is_error: false)
        {
          content: [ { type: "text", text: JSON.pretty_generate(payload) } ],
          isError: is_error
        }
      end

      def respond(id, result)
        return if id.nil?

        write_message({ jsonrpc: "2.0", id: id, result: result })
      end

      def respond_error(id, code, message)
        write_message({ jsonrpc: "2.0", id: id, error: { code: code, message: message } })
      end

      def read_message
        first = input.gets
        return unless first

        if first.start_with?("Content-Length:")
          length = first.split(":", 2).last.to_i
          loop do
            line = input.gets
            break if line.nil? || line.strip.empty?
          end
          JSON.parse(input.read(length))
        else
          JSON.parse(first)
        end
      end

      def write_message(message)
        body = JSON.generate(message)
        output.write("Content-Length: #{body.bytesize}\r\n\r\n#{body}")
        output.flush
      end
  end
end
