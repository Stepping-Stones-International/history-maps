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

  test "index shows an empty state when there are no topics" do
    Topic.destroy_all

    get topics_path
    assert_select ".page__empty"
  end
end
