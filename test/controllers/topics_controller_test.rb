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

  test "new requires authentication" do
    get new_topic_path
    assert_redirected_to new_session_path
  end

  test "new renders the form when signed in" do
    sign_in_as users(:one)

    get new_topic_path
    assert_response :success
    assert_inertia_component "Topics/New"
  end

  test "create attributes the topic to the signed in user" do
    sign_in_as users(:one)

    assert_difference -> { Topic.count }, 1 do
      post topics_path, params: { title: "New Topic", description: "About it." }
    end

    assert_redirected_to topics_path
    assert_equal users(:one), Topic.order(:created_at).last.author
  end

  test "create rejects a topic without a title" do
    sign_in_as users(:one)

    assert_no_difference -> { Topic.count } do
      post topics_path, params: { title: "", description: "No title." }
    end

    assert_redirected_to new_topic_path
    follow_redirect!
    assert_includes inertia.props[:errors].values.flatten.join(" "), "blank"
  end

  test "create requires authentication" do
    assert_no_difference -> { Topic.count } do
      post topics_path, params: { title: "Sneaky" }
    end

    assert_redirected_to new_session_path
  end
end
