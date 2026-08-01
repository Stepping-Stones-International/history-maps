require "test_helper"

class NodeTest < ActiveSupport::TestCase
  setup { @topic = topics(:one) }

  test "is valid with a title, topic and coordinates" do
    assert Node.new(topic: @topic, title: "Ephesus", latitude: 37.94, longitude: 27.34).valid?
  end

  test "requires a title" do
    node = Node.new(topic: @topic, latitude: 0, longitude: 0)
    assert_not node.valid?
    assert_includes node.errors[:title], "can't be blank"
  end

  test "requires a topic" do
    node = Node.new(title: "Orphan", latitude: 0, longitude: 0)
    assert_not node.valid?
    assert_includes node.errors[:topic], "must exist"
  end

  test "requires coordinates" do
    node = Node.new(topic: @topic, title: "Nowhere")
    assert_not node.valid?
    assert_includes node.errors[:latitude], "can't be blank"
    assert_includes node.errors[:longitude], "can't be blank"
  end

  test "rejects out of range coordinates" do
    node = Node.new(topic: @topic, title: "Off world", latitude: 91, longitude: 181)
    assert_not node.valid?
    assert_predicate node.errors[:latitude], :any?
    assert_predicate node.errors[:longitude], :any?
  end

  test "is destroyed along with its topic" do
    assert_difference -> { Node.count }, -@topic.nodes.count do
      @topic.destroy
    end
  end

  test "is assigned a UUID primary key" do
    node = Node.create!(topic: @topic, title: "Identified", latitude: 0, longitude: 0)
    assert_match(/\A\h{8}-\h{4}-4\h{3}-[89ab]\h{3}-\h{12}\z/, node.id)
  end
end
