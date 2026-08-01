require "test_helper"

class RegistrationsControllerTest < ActionDispatch::IntegrationTest
  test "new" do
    get new_registration_path
    assert_response :success
    assert_select "form[action=?]", registration_path
  end

  test "create signs the new user in" do
    assert_difference -> { User.count }, 1 do
      post registration_path, params: { user: {
        email_address: "fresh@example.com",
        password: "secret123",
        password_confirmation: "secret123"
      } }
    end

    assert_redirected_to root_url
    assert_equal "fresh@example.com", User.last.email_address

    # Following the redirect proves the session cookie was set.
    follow_redirect!
    assert_response :success
  end

  test "create rejects mismatched password confirmation" do
    assert_no_difference -> { User.count } do
      post registration_path, params: { user: {
        email_address: "mismatch@example.com",
        password: "secret123",
        password_confirmation: "different"
      } }
    end

    assert_response :unprocessable_entity
    assert_select ".flash--alert"
  end

  test "create rejects a duplicate email address" do
    assert_no_difference -> { User.count } do
      post registration_path, params: { user: {
        email_address: users(:one).email_address,
        password: "secret123",
        password_confirmation: "secret123"
      } }
    end

    assert_response :unprocessable_entity
    assert_select ".flash--alert", text: /taken/
  end

  test "create rejects a malformed email address" do
    assert_no_difference -> { User.count } do
      post registration_path, params: { user: {
        email_address: "not-an-email",
        password: "secret123",
        password_confirmation: "secret123"
      } }
    end

    assert_response :unprocessable_entity
  end
end
