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

  test "defaults to an exact date type" do
    node = Node.create!(topic: @topic, title: "Dated", latitude: 0, longitude: 0)
    assert_equal "exact", node.date_type
  end

  test "accepts every offered date type" do
    Node::DATE_TYPES.each_key do |value|
      node = Node.new(topic: @topic, title: "Dated", latitude: 0, longitude: 0, date_type: value)
      assert node.valid?, "expected #{value} to be a valid date type"
    end
  end

  test "rejects an unknown date type" do
    node = Node.new(topic: @topic, title: "Dated", latitude: 0, longitude: 0, date_type: "someday")
    assert_not node.valid?
    assert_predicate node.errors[:date_type], :any?
  end

  test "composes a date from the month, day and year fields" do
    node = Node.create!(
      topic: @topic, title: "Dated", latitude: 0, longitude: 0,
      occurred_month: "7", occurred_day: "4", occurred_year: "1776"
    )

    assert_equal Date.new(1776, 7, 4), node.occurred_on
  end

  test "accepts a year at either end of the supported range" do
    [ 1, 4000 ].each do |year|
      node = Node.new(
        topic: @topic, title: "Dated", latitude: 0, longitude: 0,
        occurred_month: "1", occurred_day: "1", occurred_year: year.to_s
      )

      assert node.valid?, "expected year #{year} to be accepted"
      assert_equal year, node.occurred_on.year
    end
  end

  test "rejects a year outside the supported range" do
    [ "0", "4001", "-5" ].each do |year|
      node = Node.new(
        topic: @topic, title: "Dated", latitude: 0, longitude: 0,
        occurred_month: "1", occurred_day: "1", occurred_year: year
      )

      assert_not node.valid?, "expected year #{year} to be rejected"
      assert_includes node.errors[:occurred_year], "must be between 1 and 4000"
    end
  end

  test "rejects a day that does not exist in the month" do
    node = Node.new(
      topic: @topic, title: "Dated", latitude: 0, longitude: 0,
      occurred_month: "2", occurred_day: "31", occurred_year: "1900"
    )

    assert_not node.valid?
    assert_includes node.errors[:occurred_on], "must be a real date"
  end

  test "rejects a partially filled date" do
    node = Node.new(
      topic: @topic, title: "Dated", latitude: 0, longitude: 0, occurred_year: "1900"
    )

    assert_not node.valid?
    assert_predicate node.errors[:occurred_on], :any?
  end

  test "leaves the date empty when no part is given" do
    node = Node.new(
      topic: @topic, title: "Undated", latitude: 0, longitude: 0,
      occurred_month: "", occurred_day: "", occurred_year: ""
    )

    assert node.valid?
    assert_nil node.occurred_on
  end

  test "parses an MM-DD-YYYY date from the form" do
    node = Node.create!(
      topic: @topic, title: "Dated", latitude: 0, longitude: 0, occurred_on: "07-04-1776"
    )

    assert_equal Date.new(1776, 7, 4), node.occurred_on
    assert_equal "07-04-1776", node.occurred_on_formatted
  end

  test "reads the date as month first, not day first" do
    node = Node.new(topic: @topic, title: "Dated", latitude: 0, longitude: 0, occurred_on: "03-04-1500")

    assert_equal 3, node.occurred_on.month
    assert_equal 4, node.occurred_on.day
  end

  test "rejects a date that is not MM-DD-YYYY" do
    node = Node.new(topic: @topic, title: "Dated", latitude: 0, longitude: 0, occurred_on: "1776-07-04")

    assert_not node.valid?
    assert_includes node.errors[:occurred_on], "must be formatted MM-DD-YYYY"
  end

  test "rejects a date that does not exist" do
    node = Node.new(topic: @topic, title: "Dated", latitude: 0, longitude: 0, occurred_on: "02-31-1900")

    assert_not node.valid?
    assert_predicate node.errors[:occurred_on], :any?
  end

  test "accepts a blank date" do
    node = Node.new(topic: @topic, title: "Undated", latitude: 0, longitude: 0, occurred_on: "")

    assert node.valid?
    assert_nil node.occurred_on
  end

  test "still accepts a Date object" do
    node = Node.new(topic: @topic, title: "Dated", latitude: 0, longitude: 0, occurred_on: Date.new(1500, 1, 2))

    assert node.valid?
    assert_equal Date.new(1500, 1, 2), node.occurred_on
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
