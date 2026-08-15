require "test_helper"
require_relative "../../../lib/christian_history_maps/mcp_server"

class ChristianHistoryMaps::McpServerTest < ActiveSupport::TestCase
  setup do
    @topic = topics(:one)
    @server = ChristianHistoryMaps::McpServer.new(env: { "MCP_USER_EMAIL" => users(:one).email_address })
  end

  test "lists topics scoped to the configured user" do
    payload = tool_payload(@server.call_tool("list_topics", {}))

    assert_equal true, payload[:ok]
    assert_equal [ @topic.id ], payload[:topics].map { |topic| topic[:id] }
  end

  test "lists create topic as an MCP tool" do
    response = capture_response do |output|
      ChristianHistoryMaps::McpServer.new(output: output).handle({
        "id" => 1,
        "method" => "tools/list"
      })
    end

    tool_names = response.dig(:result, :tools).map { |tool| tool[:name] }
    assert_includes tool_names, "create_topic"
  end

  test "creates a topic for the configured user" do
    assert_difference -> { users(:one).topics.count }, 1 do
      payload = tool_payload(@server.call_tool("create_topic", {
        "title" => "Historical Timeline of the Book of Daniel",
        "description" => "Daniel's life and visions from captivity through Persian rule.",
        "center_latitude" => "32.54",
        "center_longitude" => "44.42",
        "zoom" => "5"
      }))

      assert_equal true, payload[:ok]
      assert_equal "Historical Timeline of the Book of Daniel", payload[:topic][:title]
      assert_equal users(:one).email_address, payload[:topic][:author_email]
      assert_equal({ latitude: 32.54, longitude: 44.42, zoom: 5.0 }, payload[:topic][:default_view])
    end
  end

  test "updates a topic in the configured user's scope" do
    payload = tool_payload(@server.call_tool("update_topic", {
      "topic_id" => @topic.id,
      "title" => "The Timeline of the Captivity"
    }))

    assert_equal true, payload[:ok]
    assert_equal "The Timeline of the Captivity", payload[:topic][:title]
    assert_equal "The Timeline of the Captivity", @topic.reload.title
  end

  test "gets a topic with nodes" do
    payload = tool_payload(@server.call_tool("get_topic", { "topic_id" => @topic.id }))

    assert_equal @topic.id, payload[:id]
    assert_equal [ nodes(:one).id ], payload[:nodes].map { |node| node[:id] }
  end

  test "creates a node through Rails validations" do
    assert_difference -> { @topic.nodes.count }, 1 do
      payload = tool_payload(@server.call_tool("create_node", {
        "topic_id" => @topic.id,
        "title" => "Nicaea",
        "date_type" => "exact",
        "occurred_year" => "325",
        "occurred_month" => "5",
        "occurred_day" => "20",
        "latitude" => "40.143",
        "longitude" => "29.979"
      }))

      assert_equal true, payload[:ok]
      assert_equal "May 20, 325 AD", payload[:node][:date_display]
    end
  end

  test "creates a layer without coordinates" do
    payload = tool_payload(@server.call_tool("create_layer", {
      "topic_id" => @topic.id,
      "title" => "Judea",
      "date_type" => "none",
      "area_json" => "[[35.0,31.5],[35.4,31.5],[35.4,31.9]]"
    }))

    assert_equal true, payload[:ok]
    assert_equal true, payload[:node][:layer]
    assert_nil payload[:node][:latitude]
    assert_equal [ 35.0, 31.5 ], payload[:node][:area].first
  end

  test "updates a node in the scoped topic" do
    payload = tool_payload(@server.call_tool("update_node", {
      "topic_id" => @topic.id,
      "node_id" => nodes(:one).id,
      "title" => "Renamed Jerusalem"
    }))

    assert_equal true, payload[:ok]
    assert_equal "Renamed Jerusalem", nodes(:one).reload.title
  end

  test "deletes a node in the scoped topic" do
    node = nodes(:one)

    assert_difference -> { @topic.nodes.count }, -1 do
      payload = tool_payload(@server.call_tool("delete_node", {
        "topic_id" => @topic.id,
        "node_id" => node.id
      }))

      assert_equal true, payload[:ok]
      assert_equal node.id, payload[:node][:id]
    end
  end

  test "returns validation errors as tool errors" do
    result = @server.call_tool("create_node", {
      "topic_id" => @topic.id,
      "title" => "",
      "date_type" => "none",
      "latitude" => "0",
      "longitude" => "0"
    })
    payload = tool_payload(result)

    assert_equal true, result[:isError]
    assert_equal false, payload[:ok]
    assert_includes payload[:errors][:title], "can't be blank"
  end

  test "returns topic validation errors as tool errors" do
    result = @server.call_tool("create_topic", { "title" => "" })
    payload = tool_payload(result)

    assert_equal true, result[:isError]
    assert_equal false, payload[:ok]
    assert_includes payload[:errors][:title], "can't be blank"
  end

  test "does not expose another author's topic when scoped" do
    assert_raises ActiveRecord::RecordNotFound do
      @server.call_tool("get_topic", { "topic_id" => topics(:two).id })
    end
  end

  private
    def tool_payload(result)
      JSON.parse(result.fetch(:content).first.fetch(:text), symbolize_names: true)
    end

    def capture_response
      output = StringIO.new
      yield output
      _headers, body = output.string.split("\r\n\r\n", 2)
      JSON.parse(body, symbolize_names: true)
    end
end
