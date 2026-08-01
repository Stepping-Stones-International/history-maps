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
