require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "downcases and strips email_address" do
    user = User.new(email_address: " DOWNCASED@EXAMPLE.COM ")
    assert_equal("downcased@example.com", user.email_address)
  end

  test "requires a unique email address" do
    user = User.new(email_address: users(:one).email_address, password: "secret123")
    assert_not user.valid?
    assert_includes user.errors[:email_address], "has already been taken"
  end

  test "requires a well formed email address" do
    user = User.new(email_address: "nope", password: "secret123")
    assert_not user.valid?
    assert_includes user.errors[:email_address], "is not a valid email address"
  end

  test "authors topics" do
    user = users(:one)
    topic = user.topics.create!(title: "Authored")
    assert_equal user, topic.author
  end
end
