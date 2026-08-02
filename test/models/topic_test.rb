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

  test "draws no map packs to begin with" do
    topic = Topic.create!(title: "Bare", author: users(:one))

    assert_empty topic.map_packs
    assert_not topic.draws?("roman_roads")
  end

  test "remembers the map packs it draws" do
    topic = Topic.create!(title: "Roads", author: users(:one), map_packs: [ "roman_roads" ])

    assert topic.reload.draws?("roman_roads")
  end

  test "drops the blanks an unticked checkbox posts" do
    topic = Topic.create!(title: "Blanks", author: users(:one), map_packs: [ "", "roman_roads", "" ])

    assert_equal [ "roman_roads" ], topic.map_packs
  end

  test "keeps a pack once, however many times it is given" do
    topic = Topic.create!(title: "Twice", author: users(:one),
      map_packs: [ "roman_roads", "roman_roads" ])

    assert_equal [ "roman_roads" ], topic.map_packs
  end

  test "draws more than one pack at once" do
    topic = Topic.create!(title: "Both", author: users(:one),
      map_packs: [ "roman_roads", "awmc_roads" ])

    assert topic.reload.draws?("roman_roads")
    assert topic.draws?("awmc_roads")
  end

  test "every pack ships the file it draws from" do
    Topic::MAP_PACKS.each_value do |pack|
      assert Rails.root.join("app/assets/data", pack[:file]).exist?,
        "#{pack[:file]} is missing"
    end
  end

  test "rejects a map pack it does not ship" do
    topic = Topic.new(title: "Unknown", author: users(:one), map_packs: [ "moon_bases" ])

    assert_not topic.valid?
    assert_includes topic.errors[:map_packs], "does not include moon_bases"
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
