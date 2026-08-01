require "test_helper"

class NodesControllerTest < ActionDispatch::IntegrationTest
  setup { @topic = topics(:one) }

  test "create requires authentication" do
    assert_no_difference -> { Node.count } do
      post topic_nodes_path(@topic), params: node_params
    end

    assert_redirected_to new_session_path
  end

  test "create adds a node at the clicked coordinates" do
    sign_in_as users(:one)

    assert_difference -> { Node.count }, 1 do
      post topic_nodes_path(@topic), params: node_params
    end

    node = Node.find_by!(title: "Ephesus")
    assert_equal @topic, node.topic
    assert_in_delta 37.94, node.latitude, 0.001
    assert_in_delta 27.34, node.longitude, 0.001
    assert_redirected_to edit_topic_path(@topic)
  end

  test "create rejects a node without a title" do
    sign_in_as users(:one)

    assert_no_difference -> { Node.count } do
      post topic_nodes_path(@topic), params: node_params(title: "")
    end

    assert_redirected_to edit_topic_path(@topic)
    follow_redirect!
    assert_includes inertia.props[:errors].values.flatten.join(" "), "blank"
  end

  test "create rejects coordinates outside the world" do
    sign_in_as users(:one)

    assert_no_difference -> { Node.count } do
      post topic_nodes_path(@topic), params: node_params(latitude: 120)
    end

    assert_redirected_to edit_topic_path(@topic)
  end

  test "create does not add nodes to another user's topic" do
    sign_in_as users(:two)

    assert_no_difference -> { Node.count } do
      post topic_nodes_path(@topic), params: node_params
    end

    assert_response :not_found
  end

  test "create stores the chosen date type" do
    sign_in_as users(:one)

    post topic_nodes_path(@topic), params: node_params(date_type: "disputed")

    assert_equal "disputed", Node.find_by!(title: "Ephesus").date_type
  end

  test "create rejects an unknown date type" do
    sign_in_as users(:one)

    assert_no_difference -> { Node.count } do
      post topic_nodes_path(@topic), params: node_params(date_type: "someday")
    end

    assert_redirected_to edit_topic_path(@topic)
  end

  test "create stores a date sent as separate month, day and year fields" do
    sign_in_as users(:one)

    post topic_nodes_path(@topic), params: node_params(
      date_type: "exact", occurred_month: "12", occurred_day: "25", occurred_year: "336"
    )

    assert_equal Date.new(336, 12, 25), Node.find_by!(title: "Ephesus").occurred_on
  end

  test "create accepts a one digit year" do
    sign_in_as users(:one)

    post topic_nodes_path(@topic), params: node_params(
      occurred_month: "1", occurred_day: "1", occurred_year: "1"
    )

    assert_equal 1, Node.find_by!(title: "Ephesus").occurred_on.year
  end

  test "create rejects a year past the supported range" do
    sign_in_as users(:one)

    assert_no_difference -> { Node.count } do
      post topic_nodes_path(@topic), params: node_params(
        occurred_month: "1", occurred_day: "1", occurred_year: "4001"
      )
    end

    assert_redirected_to edit_topic_path(@topic)
    follow_redirect!
    assert_includes inertia.props[:errors].values.flatten.join(" "), "between 1 and 4000"
  end

  test "the map sends dates back formatted MM-DD-YYYY" do
    sign_in_as users(:one)
    nodes(:one).update!(occurred_on: Date.new(1054, 7, 16))

    get edit_topic_path(@topic)
    listed = inertia.props[:nodes].find { |node| node[:id] == nodes(:one).id }

    assert_equal "07-16-1054", listed[:occurred_on]
  end

  test "the map is sent the date type options" do
    sign_in_as users(:one)

    get edit_topic_path(@topic)
    offered = inertia.props[:dateTypes]

    assert_equal Node::DATE_TYPES.keys, offered.map { |option| option[:value] }
    assert_includes offered.map { |option| option[:label] }, "Exact Date (Point in Time)"
  end

  test "the topic's map lists its nodes" do
    sign_in_as users(:one)

    get edit_topic_path(@topic)
    listed = inertia.props[:nodes]

    assert_equal @topic.nodes.count, listed.size
    assert_equal nodes(:one).title, listed.first[:title]
    assert_in_delta nodes(:one).latitude, listed.first[:latitude], 0.001
  end

  private
    def node_params(overrides = {})
      { title: "Ephesus", description: "A city.", latitude: 37.94, longitude: 27.34 }.merge(overrides)
    end
end
