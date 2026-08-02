require "test_helper"

class TopicsControllerTest < ActionDispatch::IntegrationTest
  setup { @topic = topics(:one) }

  test "index is reachable without signing in" do
    get topics_path
    assert_response :success
    assert_inertia_component "Topics/Index"
  end

  test "the root path is the topics list" do
    get root_path
    assert_response :success
    assert_inertia_component "Topics/Index"
  end

  test "edit renders the map for the topic" do
    sign_in_as users(:one)

    get edit_topic_path(@topic)
    assert_response :success
    assert_inertia_component "Topics/Edit"
    assert_equal @topic.title, inertia.props[:topic][:title]
  end

  test "update renames a topic and changes its description" do
    sign_in_as users(:one)

    patch topic_path(@topic), params: { title: "Renamed", description: "New words." }

    @topic.reload
    assert_equal "Renamed", @topic.title
    assert_equal "New words.", @topic.description
    assert_redirected_to edit_topic_path(@topic)
  end

  test "update turns a map pack on and off" do
    sign_in_as users(:one)

    patch topic_path(@topic), params: { title: @topic.title, map_packs: [ "roman_roads" ] }
    assert_equal [ "roman_roads" ], @topic.reload.map_packs

    # Unticking the only box posts an empty array, or a blank in browsers that
    # send the box's own value.
    patch topic_path(@topic), params: { title: @topic.title, map_packs: [] }
    assert_empty @topic.reload.map_packs

    patch topic_path(@topic), params: { title: @topic.title, map_packs: [ "roman_roads" ] }
    patch topic_path(@topic), params: { title: @topic.title, map_packs: [ "" ] }
    assert_empty @topic.reload.map_packs
  end

  test "update rejects a map pack that does not exist" do
    sign_in_as users(:one)

    patch topic_path(@topic), params: { title: @topic.title, map_packs: [ "moon_bases" ] }

    assert_empty @topic.reload.map_packs
    assert_redirected_to edit_topic_path(@topic)
  end

  test "the map is sent the packs it draws and the ones on offer" do
    sign_in_as users(:one)
    @topic.update!(map_packs: [ "roman_roads" ])

    get edit_topic_path(@topic)

    assert_equal [ "roman_roads" ], inertia.props[:topic][:map_packs]
    assert_equal [ "roman_roads" ], inertia.props[:mapPacks].map { |pack| pack[:value] }
    pack = inertia.props[:mapPacks].first
    assert_equal "Roman roads", pack[:label]
    # The tooltip's copy, so the form never has to describe a pack itself.
    assert_match(/Italy and Sicily/, pack[:covers])
    assert_match(/AD 150/, pack[:years])
  end

  test "update rejects a blank title" do
    sign_in_as users(:one)
    original = @topic.title

    patch topic_path(@topic), params: { title: "" }

    assert_equal original, @topic.reload.title
    assert_redirected_to edit_topic_path(@topic)
    follow_redirect!
    assert_includes inertia.props[:errors].values.flatten.join(" "), "blank"
  end

  test "update stores an opening view" do
    sign_in_as users(:one)

    patch topic_path(@topic), params: {
      title: @topic.title, center_latitude: "31.2001", center_longitude: "29.9187", zoom: "6.5"
    }

    @topic.reload
    assert_in_delta 31.2001, @topic.center_latitude, 0.0001
    assert_in_delta 29.9187, @topic.center_longitude, 0.0001
    assert_in_delta 6.5, @topic.zoom, 0.01
  end

  test "the map is sent the opening view" do
    sign_in_as users(:one)
    @topic.update!(center_latitude: 31.2, center_longitude: 29.9, zoom: 6.5)

    get edit_topic_path(@topic)

    assert_in_delta 31.2, inertia.props[:topic][:default_view][:latitude], 0.001
    assert_in_delta 6.5, inertia.props[:topic][:default_view][:zoom], 0.01
  end

  test "the map is sent no view when none is set" do
    sign_in_as users(:one)

    get edit_topic_path(@topic)
    assert_nil inertia.props[:topic][:default_view]
  end

  test "update rejects half an opening view" do
    sign_in_as users(:one)

    patch topic_path(@topic), params: { title: @topic.title, center_latitude: "31.2" }

    assert_nil @topic.reload.center_latitude
    assert_redirected_to edit_topic_path(@topic)
    follow_redirect!
    assert_includes inertia.props[:errors].values.flatten.join(" "), "centre and a zoom"
  end

  test "update requires authentication" do
    patch topic_path(@topic), params: { title: "Renamed" }

    assert_redirected_to new_session_path
    assert_not_equal "Renamed", @topic.reload.title
  end

  test "update does not touch another user's topic" do
    sign_in_as users(:two)
    original = @topic.title

    patch topic_path(@topic), params: { title: "Hijacked" }

    assert_response :not_found
    assert_equal original, @topic.reload.title
  end

  test "edit requires authentication" do
    get edit_topic_path(@topic)
    assert_redirected_to new_session_path
  end

  test "edit does not expose another user's topic" do
    sign_in_as users(:two)

    get edit_topic_path(topics(:one))
    assert_response :not_found
  end

  test "index lists topics with their author" do
    get topics_path

    listed = inertia.props[:topics].find { |topic| topic[:id] == @topic.id }
    assert_equal @topic.title, listed[:title]
    assert_equal @topic.author.email_address, listed[:author_email]
  end

  test "index orders topics by title" do
    Topic.destroy_all
    author = users(:one)
    Topic.create!(title: "Beta", author: author)
    Topic.create!(title: "Alpha", author: author)

    get topics_path
    assert_equal [ "Alpha", "Beta" ], inertia.props[:topics].map { |topic| topic[:title] }
  end

  test "index shares no current user when signed out" do
    get topics_path
    assert_nil inertia.props[:currentUser]
  end

  test "index shares the current user when signed in" do
    sign_in_as users(:one)

    get topics_path
    assert_equal users(:one).email_address, inertia.props[:currentUser][:email_address]
  end

  test "index sends an empty list when there are no topics" do
    Topic.destroy_all

    get topics_path
    assert_empty inertia.props[:topics]
  end

  test "create attributes the topic to the signed in user" do
    sign_in_as users(:one)

    assert_difference -> { Topic.count }, 1 do
      post topics_path, params: { title: "New Topic", description: "About it." }
    end

    assert_equal users(:one), Topic.find_by!(title: "New Topic").author
  end

  test "create sends you to the new topic's map" do
    sign_in_as users(:one)

    post topics_path, params: { title: "New Topic", description: "About it." }

    assert_redirected_to edit_topic_path(Topic.find_by!(title: "New Topic"))
    follow_redirect!
    assert_inertia_component "Topics/Edit"
  end

  test "create returns to the list with errors so the modal can show them" do
    sign_in_as users(:one)

    assert_no_difference -> { Topic.count } do
      post topics_path, params: { title: "", description: "No title." }
    end

    assert_redirected_to topics_path
    follow_redirect!
    assert_inertia_component "Topics/Index"
    assert_includes inertia.props[:errors].values.flatten.join(" "), "blank"
  end

  test "create requires authentication" do
    assert_no_difference -> { Topic.count } do
      post topics_path, params: { title: "Sneaky" }
    end

    assert_redirected_to new_session_path
  end
end
