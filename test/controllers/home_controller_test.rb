require "test_helper"

class HomeControllerTest < ActionDispatch::IntegrationTest
  test "map is reachable without signing in" do
    get root_path
    assert_response :success
    assert_select "#home-map"
  end

  test "map does not render the site header" do
    get root_path
    assert_select ".site-header", false, "the full-bleed map should have no header"
  end
end
