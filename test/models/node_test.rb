require "test_helper"

class NodeTest < ActiveSupport::TestCase
  setup { @topic = topics(:one) }

  def build_node(**attributes)
    Node.new({ topic: @topic, latitude: 0, longitude: 0, date_type: "exact" }.merge(attributes))
  end

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

  test "sorts oldest first, counting BC years backwards" do
    Node.destroy_all

    undated = build_node(title: "Undated", date_type: "range")
    ad_late = build_node(title: "1054 AD", occurred_year: 1054, occurred_month: 7, occurred_day: 16)
    ad_early = build_node(title: "325 AD", occurred_year: 325, occurred_month: 5, occurred_day: 20)
    bc_near = build_node(title: "44 BC", occurred_year: 44, era: "BC", date_type: "approximate")
    bc_far = build_node(title: "500 BC", occurred_year: 500, era: "BC", date_type: "approximate")

    [ undated, ad_late, ad_early, bc_near, bc_far ].each(&:save!)

    assert_equal [ "500 BC", "44 BC", "325 AD", "1054 AD", "Undated" ],
      Node.all.sort_by(&:chronological_key).map(&:title)
  end

  test "sorts a bare year before the same year with a month" do
    Node.destroy_all

    with_month = build_node(title: "March", occurred_year: 325, occurred_month: 3, date_type: "approximate")
    year_only = build_node(title: "Year only", occurred_year: 325, date_type: "approximate")
    [ with_month, year_only ].each(&:save!)

    assert_equal [ "Year only", "March" ], Node.all.sort_by(&:chronological_key).map(&:title)
  end

  test "sorts months and days forwards within a BC year" do
    Node.destroy_all

    later = build_node(title: "May", occurred_year: 44, occurred_month: 5, occurred_day: 20, era: "BC")
    earlier = build_node(title: "March", occurred_year: 44, occurred_month: 3, occurred_day: 15, era: "BC")
    [ later, earlier ].each(&:save!)

    assert_equal [ "March", "May" ], Node.all.sort_by(&:chronological_key).map(&:title)
  end

  test "can be embedded under another node in the same topic" do
    parent = build_node(title: "Parent", occurred_year: 100, occurred_month: 1, occurred_day: 1)
    parent.save!
    child = build_node(title: "Child", occurred_year: 101, occurred_month: 1, occurred_day: 1, parent: parent)

    assert child.valid?
    child.save!
    assert_equal [ child ], parent.reload.children.to_a
  end

  test "rejects a parent from another topic" do
    other = topics(:two).nodes.create!(title: "Elsewhere", date_type: "range", latitude: 0, longitude: 0)
    child = build_node(title: "Child", date_type: "range", parent: other)

    assert_not child.valid?
    assert_includes child.errors[:parent], "must be part of the same topic"
  end

  test "rejects being embedded under itself" do
    node = build_node(title: "Loop", date_type: "range")
    node.save!
    node.parent = node

    assert_not node.valid?
    assert_predicate node.errors[:parent], :any?
  end

  test "rejects being embedded under its own descendant" do
    parent = build_node(title: "Parent", date_type: "range")
    parent.save!
    child = build_node(title: "Child", date_type: "range", parent: parent)
    child.save!

    parent.parent = child
    assert_not parent.valid?
    assert_predicate parent.errors[:parent], :any?
  end

  test "new siblings are placed after the ones already there" do
    parent = build_node(title: "Parent", date_type: "range")
    parent.save!
    first = build_node(title: "First", date_type: "range", parent: parent)
    first.save!
    second = build_node(title: "Second", date_type: "range", parent: parent)
    second.save!

    assert_equal 1, first.position
    assert_equal 2, second.position
    assert_equal [ "First", "Second" ], parent.reload.children.map(&:title)
  end

  test "children are listed in the order set for them" do
    parent = build_node(title: "Parent", date_type: "range")
    parent.save!
    first = build_node(title: "First", date_type: "range", parent: parent)
    first.save!
    second = build_node(title: "Second", date_type: "range", parent: parent)
    second.save!

    second.update!(position: 1)
    first.update!(position: 2)

    assert_equal [ "Second", "First" ], parent.reload.children.map(&:title)
  end

  test "embedded nodes go when their parent does" do
    parent = build_node(title: "Parent", date_type: "range")
    parent.save!
    build_node(title: "Child", date_type: "range", parent: parent).save!

    assert_difference -> { Node.count }, -2 do
      parent.destroy
    end
  end

  test "an embedded node needs no date, whatever its type" do
    parent = build_node(title: "Parent", date_type: "range")
    parent.save!
    child = build_node(title: "Child", date_type: "exact", parent: parent)

    assert child.valid?, child.errors.full_messages.to_sentence
    assert_not child.dated?
  end

  test "an embedded node still rejects a date that does not exist" do
    parent = build_node(title: "Parent", date_type: "range")
    parent.save!
    child = build_node(title: "Child", date_type: "exact", parent: parent,
      occurred_year: 1900, occurred_month: 2, occurred_day: 31)

    assert_not child.valid?
    assert_includes child.errors[:base], "That date does not exist"
  end

  test "a node of its own still needs its date" do
    node = build_node(title: "Standalone", date_type: "exact")

    assert_not node.valid?
    assert_includes node.errors[:occurred_year], "can't be blank"
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
