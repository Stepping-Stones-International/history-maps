require "test_helper"

class RegistrationsControllerTest < ActionDispatch::IntegrationTest
  test "new" do
    get new_registration_path
    assert_response :success
    assert_inertia_component "Registrations/New"
  end

  test "create signs the new user in" do
    assert_difference -> { User.count }, 1 do
      post registration_path, params: {
        email_address: "fresh@example.com",
        password: "secret123",
        password_confirmation: "secret123"
      }
    end

    assert_redirected_to root_url
    # Not User.last: UUID primary keys give no chronological ordering.
    assert User.exists?(email_address: "fresh@example.com")

    # Following the redirect proves the session cookie was set.
    follow_redirect!
    assert_response :success
  end

  test "create rejects mismatched password confirmation" do
    assert_no_difference -> { User.count } do
      post registration_path, params: {
        email_address: "mismatch@example.com",
        password: "secret123",
        password_confirmation: "different"
      }
    end

    assert_redirected_to new_registration_path
    follow_redirect!
    assert_includes inertia.props[:errors].keys.map(&:to_s), "password_confirmation"
  end

  test "create rejects a duplicate email address" do
    assert_no_difference -> { User.count } do
      post registration_path, params: {
        email_address: users(:one).email_address,
        password: "secret123",
        password_confirmation: "secret123"
      }
    end

    assert_redirected_to new_registration_path
    follow_redirect!
    assert_includes inertia.props[:errors].values.flatten.join(" "), "taken"
  end

  test "create rejects a malformed email address" do
    assert_no_difference -> { User.count } do
      post registration_path, params: {
        email_address: "not-an-email",
        password: "secret123",
        password_confirmation: "secret123"
      }
    end

    assert_redirected_to new_registration_path
  end
end
