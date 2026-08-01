require "test_helper"

class TopicsControllerTest < ActionDispatch::IntegrationTest
  setup { @topic = topics(:one) }

  test "index is reachable without signing in" do
    get topics_path
    assert_response :success
  end

  test "index lists topics with their author" do
    get topics_path
    assert_select ".topic__title", text: @topic.title
    assert_select ".topic__author", text: /#{@topic.author.email_address}/
  end

  test "index orders topics by title" do
    Topic.destroy_all
    author = users(:one)
    Topic.create!(title: "Beta", author: author)
    Topic.create!(title: "Alpha", author: author)

    get topics_path
    titles = css_select(".topic__title").map(&:text)
    assert_equal [ "Alpha", "Beta" ], titles
  end

  test "index renders the site header with signed-out links" do
    get topics_path
    assert_select ".site-header__brand", text: "BibleMind"
    assert_select ".site-header a[href=?]", new_session_path
    assert_select ".site-header a[href=?]", new_registration_path
  end

  test "index shows the current user and a log out button when signed in" do
    sign_in_as users(:one)

    get topics_path
    assert_select ".site-header__user", text: users(:one).email_address
    assert_select ".site-header form[action=?]", session_path
  end

  test "index shows a large add button linking to the new topic form" do
    get topics_path
    assert_select "a.icon-button--large[href=?]", new_topic_path do
      assert_select "svg.icon-button__glyph"
    end
  end

  test "new requires authentication" do
    get new_topic_path
    assert_redirected_to new_session_path
  end

  test "new renders the form when signed in" do
    sign_in_as users(:one)

    get new_topic_path
    assert_response :success
    assert_select "form[action=?]", topics_path
  end

  test "create attributes the topic to the signed in user" do
    sign_in_as users(:one)

    assert_difference -> { Topic.count }, 1 do
      post topics_path, params: { topic: { title: "New Topic", description: "About it." } }
    end

    assert_redirected_to topics_path
    assert_equal users(:one), Topic.order(:created_at).last.author
  end

  test "create rejects a topic without a title" do
    sign_in_as users(:one)

    assert_no_difference -> { Topic.count } do
      post topics_path, params: { topic: { title: "", description: "No title." } }
    end

    assert_response :unprocessable_entity
    assert_select ".flash--alert"
  end

  test "create requires authentication" do
    assert_no_difference -> { Topic.count } do
      post topics_path, params: { topic: { title: "Sneaky" } }
    end

    assert_redirected_to new_session_path
  end

  test "index shows an empty state when there are no topics" do
    Topic.destroy_all

    get topics_path
    assert_select ".page__empty"
  end
end
