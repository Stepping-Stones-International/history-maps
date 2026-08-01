require "test_helper"

class TopicTest < ActiveSupport::TestCase
  test "is valid with a title and an author" do
    assert Topic.new(title: "Valid", author: users(:one)).valid?
  end

  test "requires a title" do
    topic = Topic.new(author: users(:one))
    assert_not topic.valid?
    assert_includes topic.errors[:title], "can't be blank"
  end

  test "requires an author" do
    topic = Topic.new(title: "Orphan")
    assert_not topic.valid?
    assert_includes topic.errors[:author], "must exist"
  end

  test "author is a user" do
    assert_instance_of User, topics(:one).author
  end

  test "is destroyed along with its author" do
    author = users(:one)
    assert_difference -> { Topic.count }, -author.topics.count do
      author.destroy
    end
  end
end
