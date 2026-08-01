require "test_helper"

class HomeControllerTest < ActionDispatch::IntegrationTest
  test "map is reachable without signing in" do
    get root_path
    assert_response :success
    assert_inertia_component "Home/Index"
  end
end
