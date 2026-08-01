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

  test "is assigned a version 4 UUID primary key" do
    topic = Topic.create!(title: "Identified", author: users(:one))

    assert_match(
      /\A\h{8}-\h{4}-4\h{3}-[89ab]\h{3}-\h{12}\z/,
      topic.id,
      "expected a v4 UUID, got #{topic.id.inspect}"
    )
  end

  test "does not reuse or increment identifiers" do
    ids = 3.times.map { Topic.create!(title: "Repeated", author: users(:one)).id }

    assert_equal 3, ids.uniq.size
    assert_empty ids.grep(/\A\d+\z/), "ids should not be sequential integers"
  end

  test "is destroyed along with its author" do
    author = users(:one)
    assert_difference -> { Topic.count }, -author.topics.count do
      author.destroy
    end
  end
end
