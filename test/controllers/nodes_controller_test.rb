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

  test "create accepts an approximate date with only a year" do
    sign_in_as users(:one)

    post topic_nodes_path(@topic), params: node_params(
      date_type: "approximate", occurred_year: "325", occurred_month: "", occurred_day: ""
    )

    node = Node.find_by!(title: "Ephesus")
    assert_equal 325, node.occurred_year
    assert_nil node.occurred_month
    assert_equal "c. 325 AD", node.date_display
  end

  test "create rejects an approximate date with no year" do
    sign_in_as users(:one)

    assert_no_difference -> { Node.count } do
      post topic_nodes_path(@topic), params: node_params(
        date_type: "approximate", occurred_year: "", occurred_month: "", occurred_day: ""
      )
    end

    assert_redirected_to edit_topic_path(@topic)
  end

  test "create rejects an exact date missing its month and day" do
    sign_in_as users(:one)

    assert_no_difference -> { Node.count } do
      post topic_nodes_path(@topic), params: node_params(occurred_month: "", occurred_day: "")
    end

    assert_redirected_to edit_topic_path(@topic)
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

    node = Node.find_by!(title: "Ephesus")
    assert_equal [ 336, 12, 25 ], [ node.occurred_year, node.occurred_month, node.occurred_day ]
  end

  test "create accepts a one digit year" do
    sign_in_as users(:one)

    post topic_nodes_path(@topic), params: node_params(
      occurred_month: "1", occurred_day: "1", occurred_year: "1"
    )

    assert_equal 1, Node.find_by!(title: "Ephesus").occurred_year
  end

  test "create rejects a year past the supported range" do
    sign_in_as users(:one)

    assert_no_difference -> { Node.count } do
      post topic_nodes_path(@topic), params: node_params(
        occurred_month: "1", occurred_day: "1", occurred_year: "4001"
      )
    end

    assert_redirected_to edit_topic_path(@topic)
  end

  test "the map sends dates back written out" do
    sign_in_as users(:one)

    get edit_topic_path(@topic)
    listed = inertia.props[:nodes].find { |node| node[:id] == nodes(:one).id }

    assert_equal "July 16, 1054 AD", listed[:date_display]
  end

  test "the map marks approximate dates with c." do
    sign_in_as users(:one)
    nodes(:one).update!(date_type: "approximate", occurred_month: nil, occurred_day: nil)

    get edit_topic_path(@topic)
    listed = inertia.props[:nodes].find { |node| node[:id] == nodes(:one).id }

    assert_equal "c. 1054 AD", listed[:date_display]
  end

  test "create stores the chosen era" do
    sign_in_as users(:one)

    post topic_nodes_path(@topic), params: node_params(
      occurred_month: "3", occurred_day: "15", occurred_year: "44", era: "BC"
    )

    node = Node.find_by!(title: "Ephesus")
    assert_equal "BC", node.era
    assert_equal [ 44, 3, 15 ], [ node.occurred_year, node.occurred_month, node.occurred_day ]
  end

  test "create defaults the era to AD" do
    sign_in_as users(:one)

    post topic_nodes_path(@topic), params: node_params
    assert_equal "AD", Node.find_by!(title: "Ephesus").era
  end

  test "the map is sent the era options" do
    sign_in_as users(:one)

    get edit_topic_path(@topic)
    assert_equal [ "AD", "BC" ], inertia.props[:eras]
  end

  test "create reports success for the toast" do
    sign_in_as users(:one)

    post topic_nodes_path(@topic), params: node_params
    follow_redirect!

    assert_equal "Node added.", inertia.props[:flash][:notice]
  end

  test "create reports failure for the toast" do
    sign_in_as users(:one)

    post topic_nodes_path(@topic), params: node_params(title: "")
    follow_redirect!

    assert_equal "That node could not be saved.", inertia.props[:flash][:alert]
  end

  test "update reports success for the toast" do
    sign_in_as users(:one)

    patch topic_node_path(@topic, nodes(:one)), params: node_params(title: "Renamed")
    follow_redirect!

    assert_equal "Node updated.", inertia.props[:flash][:notice]
  end

  test "update requires authentication" do
    patch topic_node_path(@topic, nodes(:one)), params: node_params(title: "Renamed")

    assert_redirected_to new_session_path
    assert_equal "Jerusalem", nodes(:one).reload.title
  end

  test "update changes the node" do
    sign_in_as users(:one)

    patch topic_node_path(@topic, nodes(:one)), params: node_params(
      title: "Renamed", occurred_month: "5", occurred_day: "6", occurred_year: "70", era: "AD"
    )

    node = nodes(:one).reload
    assert_equal "Renamed", node.title
    assert_equal [ 70, 5, 6 ], [ node.occurred_year, node.occurred_month, node.occurred_day ]
    assert_redirected_to edit_topic_path(@topic)
  end

  test "update can clear the date when the type stops needing one" do
    sign_in_as users(:one)

    patch topic_node_path(@topic, nodes(:one)), params: node_params(
      date_type: "range", occurred_month: "", occurred_day: "", occurred_year: ""
    )

    assert_nil nodes(:one).reload.occurred_year
  end

  test "update rejects invalid changes" do
    sign_in_as users(:one)

    patch topic_node_path(@topic, nodes(:one)), params: node_params(title: "")

    assert_equal "Jerusalem", nodes(:one).reload.title
    assert_redirected_to edit_topic_path(@topic)
    follow_redirect!
    assert_includes inertia.props[:errors].values.flatten.join(" "), "blank"
  end

  test "update does not touch another user's node" do
    sign_in_as users(:two)

    patch topic_node_path(@topic, nodes(:one)), params: node_params(title: "Hijacked")

    assert_response :not_found
    assert_equal "Jerusalem", nodes(:one).reload.title
  end

  test "the map sends nodes with their date split for editing" do
    sign_in_as users(:one)

    get edit_topic_path(@topic)
    listed = inertia.props[:nodes].find { |node| node[:id] == nodes(:one).id }

    assert_equal "7", listed[:occurred_month]
    assert_equal "16", listed[:occurred_day]
    assert_equal "1054", listed[:occurred_year]
    assert_equal "AD", listed[:era]
  end

  test "the map sends blank date fields for an undated node" do
    sign_in_as users(:one)
    nodes(:one).update!(date_type: "range", occurred_year: nil, occurred_month: nil, occurred_day: nil)

    get edit_topic_path(@topic)
    listed = inertia.props[:nodes].find { |node| node[:id] == nodes(:one).id }

    assert_equal "", listed[:occurred_month]
    assert_equal "", listed[:occurred_year]
  end

  test "the sidebar receives nodes oldest first" do
    sign_in_as users(:one)
    @topic.nodes.destroy_all
    @topic.nodes.create!(title: "Later", date_type: "exact",
      occurred_year: 800, occurred_month: 1, occurred_day: 1, latitude: 0, longitude: 0)
    @topic.nodes.create!(title: "Undated", date_type: "range", latitude: 0, longitude: 0)
    @topic.nodes.create!(title: "Earlier", date_type: "approximate",
      occurred_year: 44, era: "BC", latitude: 0, longitude: 0)

    get edit_topic_path(@topic)

    assert_equal [ "Earlier", "Later", "Undated" ],
      inertia.props[:nodes].map { |node| node[:title] }
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
      { title: "Ephesus", description: "A city.", latitude: 37.94, longitude: 27.34,
        date_type: "exact", occurred_year: "325", occurred_month: "3", occurred_day: "5" }.merge(overrides)
    end
end
