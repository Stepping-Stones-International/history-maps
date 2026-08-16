class Node < ApplicationRecord
  # Stored value => label shown in the form.
  DATE_TYPES = {
    # Offered only to embedded nodes, which take their moment from their parent.
    "none" => "No Date",
    "exact" => "Exact Date (Point in Time)",
    "approximate" => "Approximate / Circa Date (Uncertain Point)",
    "range" => "Date Range / Span (Duration)",
    "disputed" => "Disputed / Alternate Dates (Contested History)"
  }.freeze

  # Date types that collect a date at all, and what they insist on.
  DATED_TYPES = %w[exact approximate].freeze
  FULL_DATE_TYPES = %w[exact].freeze

  ERAS = %w[AD BC].freeze

  # How each end of a span is known. Exact wants a whole date; the other two
  # settle for a year.
  RANGE_TYPES = {
    "exact" => "Exact",
    "approximate" => "Approximate",
    "disputed" => "Disputed"
  }.freeze

  RANGE_EDGES = %w[starts ends].freeze

  MIN_YEAR = 1
  MAX_YEAR = 4000

  # What the node draws on the map. The shape and colour are given here rather
  # than in the stylesheet, so the picker in the form and the marker on the map
  # can never disagree about what a kind of node looks like.
  MARKERS = {
    "waypoint" => { label: "Waypoint", shape: "triangle", color: "#8fb8e8" },
    "apostolic_see" => { label: "Apostolic See", shape: "circle", color: "#d0524e" }
  }.freeze

  DEFAULT_MARKER = "waypoint"
  DEFAULT_POLYGON_COLOR = "#8fb8e8"
  RICH_TEXT_TAGS = %w[
    p br strong b em i u s ul ol li blockquote a h3 h4
  ].freeze
  RICH_TEXT_ATTRIBUTES = %w[href].freeze

  belongs_to :topic
  belongs_to :parent, class_name: "Node", optional: true
  has_many :children, -> { order(:position) },
    class_name: "Node", foreign_key: :parent_id, inverse_of: :parent, dependent: :destroy

  scope :roots, -> { where(parent_id: nil) }

  # The form sends "" for "no parent". Left alone it would be written as an
  # empty string and break the foreign key, so it becomes NULL here.
  normalizes :parent_id, with: ->(value) { value.presence }

  before_validation :place_after_siblings, on: :create
  before_validation :default_position
  before_validation :default_marker
  before_validation :sanitize_description_html

  validates :title, presence: true
  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :date_type, inclusion: { in: DATE_TYPES.keys }
  validates :marker, inclusion: { in: MARKERS.keys }
  validates :era, inclusion: { in: ERAS }
  # A layer is not a place, so it is the one kind of node without coordinates.
  validates :latitude, presence: true,
    numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90 }, unless: :layer?
  validates :longitude, presence: true,
    numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 }, unless: :layer?

  validates :occurred_year,
    numericality: { only_integer: true, in: MIN_YEAR..MAX_YEAR }, allow_nil: true
  validates :occurred_month,
    numericality: { only_integer: true, in: 1..12 }, allow_nil: true
  validates :occurred_day,
    numericality: { only_integer: true, in: 1..31 }, allow_nil: true

  validate :required_date_parts_present
  validate :day_accompanied_by_month
  validate :date_exists
  validate :parent_belongs_to_same_topic
  validate :parent_is_not_itself_or_below
  validate :area_is_a_ring
  validate :range_ends_are_given
  validate :range_ends_exist
  validate :range_runs_forwards

  def dated?
    occurred_year.present?
  end

  def embedded?
    parent_id.present?
  end

  def placed?
    latitude.present? && longitude.present?
  end

  def area?
    area.present?
  end

  # The form edits the ring as text, so it survives a typo without losing what
  # was typed. Anything unparsable is remembered for the validation to report.
  def area_json=(value)
    @area_syntax_error = false
    return super_area(value) unless value.is_a?(String)

    trimmed = value.strip
    return super_area(nil) if trimmed.empty?

    begin
      super_area(JSON.parse(trimmed))
    rescue JSON::ParserError
      @area_syntax_error = true
      super_area(nil)
    end
  end

  def area_json
    area && JSON.generate(area)
  end

  # Self and everything embedded beneath, so a node cannot be filed under one
  # of its own descendants.
  def subtree_ids(seen = [])
    return seen if seen.include?(id)

    children.reduce(seen + [ id ]) { |ids, child| child.subtree_ids(ids) }
  end

  # Ascending chronological order. BC years count backwards, so their year is
  # negated; months and days still run forwards within a year. A node with only
  # a year comes before one that also names a month. A span takes its place
  # from the date it begins, so it sorts among the points rather than after
  # them. Undated nodes sort last, and created_at breaks ties so the order
  # never wobbles between requests.
  def chronological_key
    year, month, day = sort_parts

    [ year ? 0 : 1, year || 0, month || 0, day || 0, created_at || Time.current ]
  end

  # "March 5, 325 AD", "c. March 325 AD", "c. 325 AD" — month and day are
  # dropped when unknown, approximate dates are marked with c. and disputed
  # ones with a trailing question mark. A span reads as its two ends.
  def date_display
    return range_display if date_type == "range"
    return unless dated?

    written_date(occurred_year, occurred_month, occurred_day, era, date_type)
  end

  def range_display
    return unless starts_year.present? && ends_year.present?

    first = written_date(starts_year, starts_month, starts_day, starts_era, starts_type)
    last = written_date(ends_year, ends_month, ends_day, ends_era, ends_type)

    "#{first} – #{last}"
  end

  def sanitized_description_html
    self.class.sanitize_rich_text(description)
  end

  def self.sanitize_rich_text(value)
    return if value.blank?

    Rails::HTML5::SafeListSanitizer.new.sanitize(
      value.to_s,
      tags: RICH_TEXT_TAGS,
      attributes: RICH_TEXT_ATTRIBUTES
    ).presence
  end

  private
    def sanitize_description_html
      self.description = self.class.sanitize_rich_text(description)
    end

    def written_date(year, month, day, era_name, kind)
      day_and_year = [ day, year ].compact.join(", ")
      written = [ month && Date::MONTHNAMES[month], day_and_year ].compact.join(" ")

      case kind
      when "approximate" then "c. #{written} #{era_name}"
      when "disputed" then "#{written} #{era_name}?"
      else "#{written} #{era_name}"
      end
    end

    def range?
      date_type == "range"
    end

    def range_ends_are_given
      return unless range?

      RANGE_EDGES.each do |edge|
        year = public_send(:"#{edge}_year")
        errors.add(:"#{edge}_year", "can't be blank") if year.blank?

        next unless public_send(:"#{edge}_type") == "exact"

        errors.add(:"#{edge}_month", "can't be blank") if public_send(:"#{edge}_month").blank?
        errors.add(:"#{edge}_day", "can't be blank") if public_send(:"#{edge}_day").blank?
      end
    end

    def range_ends_exist
      return unless range?

      RANGE_EDGES.each do |edge|
        parts = [ :year, :month, :day ].map { |part| public_send(:"#{edge}_#{part}") }
        next if parts.any?(&:blank?)
        next if Date.valid_date?(*parts)

        errors.add(:base, "The #{edge == "starts" ? "start" : "end"} date does not exist")
      end
    end

    def range_runs_forwards
      return unless range?
      return if starts_year.blank? || ends_year.blank?
      return if (range_key("starts") <=> range_key("ends")) <= 0

      errors.add(:ends_year, "must not be before the start")
    end

    def range_key(edge)
      year = public_send(:"#{edge}_year")
      signed = public_send(:"#{edge}_era") == "BC" ? -year : year

      [ signed, public_send(:"#{edge}_month") || 0, public_send(:"#{edge}_day") || 0 ]
    end

    # Covers both a node that never named an icon and a form that sent "".
    def default_marker
      self.marker = DEFAULT_MARKER if marker.blank?
    end

    def super_area(value)
      self[:area] = value
    end

    # A ring of [longitude, latitude] pairs, and only on a layer.
    def area_is_a_ring
      return errors.add(:area, "must be valid JSON") if @area_syntax_error
      return if area.blank?
      return errors.add(:area, "can only be given to a layer") unless layer?

      unless area.is_a?(Array) && area.size >= 3
        return errors.add(:area, "needs at least three points")
      end

      return if area.all? { |point| coordinate_pair?(point) }

      errors.add(:area, "must be a list of [longitude, latitude] pairs")
    end

    def coordinate_pair?(point)
      point.is_a?(Array) && point.size == 2 &&
        point.all? { |number| number.is_a?(Numeric) } &&
        point[0].between?(-180, 180) && point[1].between?(-90, 90)
    end

    # Clearing the field should mean "first", not a missing number.
    def default_position
      self.position = 0 if position.nil?
    end

    # New nodes land at the end of their parent's list.
    def place_after_siblings
      return if position.present? && position.positive?

      siblings = self.class.where(topic_id: topic_id, parent_id: parent_id)
      siblings = siblings.where.not(id: id) if id.present?
      self.position = (siblings.maximum(:position) || 0) + 1
    end

    def parent_belongs_to_same_topic
      return if parent.nil? || parent.topic_id == topic_id

      errors.add(:parent, "must be part of the same topic")
    end

    def parent_is_not_itself_or_below
      return if parent.nil?
      return unless persisted?
      return unless subtree_ids.include?(parent_id)

      errors.add(:parent, "cannot be the node itself or one embedded under it")
    end

    # The date a node is filed under: where a span begins, otherwise its own
    # date. Nil for anything undated, which sorts to the end.
    def sort_parts
      if range? && starts_year.present?
        [ starts_era == "BC" ? -starts_year : starts_year, starts_month, starts_day ]
      elsif dated?
        [ signed_year, occurred_month, occurred_day ]
      end
    end

    def signed_year
      era == "BC" ? -occurred_year : occurred_year
    end

    def month_name
      Date::MONTHNAMES[occurred_month] if occurred_month
    end

    def required_date_parts_present
      # An embedded node inherits its moment from what it is filed under, so
      # its own date is optional whatever the type says.
      return if embedded?
      return unless DATED_TYPES.include?(date_type)

      errors.add(:occurred_year, "can't be blank") if occurred_year.blank?
      return unless FULL_DATE_TYPES.include?(date_type)

      errors.add(:occurred_month, "can't be blank") if occurred_month.blank?
      errors.add(:occurred_day, "can't be blank") if occurred_day.blank?
    end

    def day_accompanied_by_month
      return if occurred_day.blank? || occurred_month.present?

      errors.add(:occurred_month, "is needed when a day is given")
    end

    def date_exists
      return if [ occurred_year, occurred_month, occurred_day ].any?(&:blank?)
      return if Date.valid_date?(occurred_year, occurred_month, occurred_day)

      errors.add(:base, "That date does not exist")
    end
end
