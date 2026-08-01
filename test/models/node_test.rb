require "test_helper"

class NodeTest < ActiveSupport::TestCase
  setup { @topic = topics(:one) }

  test "is valid with a title, topic and coordinates" do
    assert Node.new(topic: @topic, title: "Ephesus", latitude: 37.94, longitude: 27.34,
      date_type: "range").valid?
  end

  test "requires a title" do
    node = Node.new(topic: @topic, latitude: 0, longitude: 0, date_type: "range")
    assert_not node.valid?
    assert_includes node.errors[:title], "can't be blank"
  end

  test "requires a topic" do
    node = Node.new(title: "Orphan", latitude: 0, longitude: 0, date_type: "range")
    assert_not node.valid?
    assert_includes node.errors[:topic], "must exist"
  end

  test "requires coordinates" do
    node = Node.new(topic: @topic, title: "Nowhere", date_type: "range")
    assert_not node.valid?
    assert_includes node.errors[:latitude], "can't be blank"
    assert_includes node.errors[:longitude], "can't be blank"
  end

  test "rejects out of range coordinates" do
    node = Node.new(topic: @topic, title: "Off world", latitude: 91, longitude: 181, date_type: "range")
    assert_not node.valid?
    assert_predicate node.errors[:latitude], :any?
    assert_predicate node.errors[:longitude], :any?
  end

  test "defaults to an exact date type" do
    node = Node.create!(topic: @topic, title: "Dated", latitude: 0, longitude: 0,
      occurred_year: 325, occurred_month: 3, occurred_day: 5)

    assert_equal "exact", node.date_type
  end

  test "accepts every offered date type" do
    Node::DATE_TYPES.each_key do |value|
      node = Node.new(topic: @topic, title: "Dated", latitude: 0, longitude: 0, date_type: value,
        occurred_year: 100, occurred_month: 1, occurred_day: 1)
      assert node.valid?, "expected #{value} to be a valid date type"
    end
  end

  test "rejects an unknown date type" do
    node = Node.new(topic: @topic, title: "Dated", latitude: 0, longitude: 0, date_type: "someday")
    assert_not node.valid?
    assert_predicate node.errors[:date_type], :any?
  end

  test "composes nothing when no date is given" do
    node = Node.new(topic: @topic, title: "Undated", latitude: 0, longitude: 0, date_type: "range")

    assert node.valid?
    assert_not node.dated?
    assert_nil node.date_display
  end

  test "an exact date needs every part" do
    node = Node.new(topic: @topic, title: "Dated", latitude: 0, longitude: 0,
      date_type: "exact", occurred_year: 325)

    assert_not node.valid?
    assert_includes node.errors[:occurred_month], "can't be blank"
    assert_includes node.errors[:occurred_day], "can't be blank"
  end

  test "an approximate date needs only a year" do
    node = Node.new(topic: @topic, title: "Dated", latitude: 0, longitude: 0,
      date_type: "approximate", occurred_year: 325)

    assert node.valid?
    assert_equal "c. 325 AD", node.date_display
  end

  test "an approximate date still requires its year" do
    node = Node.new(topic: @topic, title: "Dated", latitude: 0, longitude: 0,
      date_type: "approximate")

    assert_not node.valid?
    assert_includes node.errors[:occurred_year], "can't be blank"
  end

  test "writes an exact date in full" do
    node = Node.new(topic: @topic, title: "Dated", latitude: 0, longitude: 0,
      date_type: "exact", occurred_year: 325, occurred_month: 3, occurred_day: 5)

    assert node.valid?
    assert_equal "March 5, 325 AD", node.date_display
  end

  test "writes an approximate date with a month but no day" do
    node = Node.new(topic: @topic, title: "Dated", latitude: 0, longitude: 0,
      date_type: "approximate", occurred_year: 325, occurred_month: 3)

    assert node.valid?
    assert_equal "c. March 325 AD", node.date_display
  end

  test "writes a BC date with its era" do
    node = Node.new(topic: @topic, title: "Dated", latitude: 0, longitude: 0,
      date_type: "approximate", occurred_year: 44, era: "BC")

    assert_equal "c. 44 BC", node.date_display
  end

  test "rejects a day without a month" do
    node = Node.new(topic: @topic, title: "Dated", latitude: 0, longitude: 0,
      date_type: "approximate", occurred_year: 325, occurred_day: 5)

    assert_not node.valid?
    assert_includes node.errors[:occurred_month], "is needed when a day is given"
  end

  test "rejects a date that does not exist" do
    node = Node.new(topic: @topic, title: "Dated", latitude: 0, longitude: 0,
      date_type: "exact", occurred_year: 1900, occurred_month: 2, occurred_day: 31)

    assert_not node.valid?
    assert_includes node.errors[:base], "That date does not exist"
  end

  test "accepts a year at either end of the supported range" do
    [ 1, 4000 ].each do |year|
      node = Node.new(topic: @topic, title: "Dated", latitude: 0, longitude: 0,
        date_type: "approximate", occurred_year: year)

      assert node.valid?, "expected year #{year} to be accepted"
    end
  end

  test "rejects a year outside the supported range" do
    [ 0, 4001, -5 ].each do |year|
      node = Node.new(topic: @topic, title: "Dated", latitude: 0, longitude: 0,
        date_type: "approximate", occurred_year: year)

      assert_not node.valid?, "expected year #{year} to be rejected"
      assert_predicate node.errors[:occurred_year], :any?
    end
  end

  test "rejects an impossible month or day" do
    node = Node.new(topic: @topic, title: "Dated", latitude: 0, longitude: 0,
      date_type: "exact", occurred_year: 325, occurred_month: 13, occurred_day: 40)

    assert_not node.valid?
    assert_predicate node.errors[:occurred_month], :any?
    assert_predicate node.errors[:occurred_day], :any?
  end

  test "is destroyed along with its topic" do
    assert_difference -> { Node.count }, -@topic.nodes.count do
      @topic.destroy
    end
  end

  test "is assigned a UUID primary key" do
    node = Node.create!(topic: @topic, title: "Identified", latitude: 0, longitude: 0, date_type: "range")
    assert_match(/\A\h{8}-\h{4}-4\h{3}-[89ab]\h{3}-\h{12}\z/, node.id)
  end
end
