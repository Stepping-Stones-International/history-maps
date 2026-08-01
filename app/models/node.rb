class Node < ApplicationRecord
  # Stored value => label shown in the form.
  DATE_TYPES = {
    "exact" => "Exact Date (Point in Time)",
    "approximate" => "Approximate / Circa Date (Uncertain Point)",
    "range" => "Date Range / Span (Duration)",
    "disputed" => "Disputed / Alternate Dates (Contested History)"
  }.freeze

  # Date types that collect a date at all, and what they insist on.
  DATED_TYPES = %w[exact approximate].freeze
  FULL_DATE_TYPES = %w[exact].freeze

  ERAS = %w[AD BC].freeze

  MIN_YEAR = 1
  MAX_YEAR = 4000

  belongs_to :topic
  belongs_to :parent, class_name: "Node", optional: true
  has_many :children, -> { order(:position) },
    class_name: "Node", foreign_key: :parent_id, inverse_of: :parent, dependent: :destroy

  scope :roots, -> { where(parent_id: nil) }

  before_validation :place_after_siblings, on: :create

  validates :title, presence: true
  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :date_type, inclusion: { in: DATE_TYPES.keys }
  validates :era, inclusion: { in: ERAS }
  validates :latitude, presence: true,
    numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90 }
  validates :longitude, presence: true,
    numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 }

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

  def dated?
    occurred_year.present?
  end

  def embedded?
    parent_id.present?
  end

  # Self and everything embedded beneath, so a node cannot be filed under one
  # of its own descendants.
  def subtree_ids(seen = [])
    return seen if seen.include?(id)

    children.reduce(seen + [ id ]) { |ids, child| child.subtree_ids(ids) }
  end

  # Ascending chronological order. BC years count backwards, so their year is
  # negated; months and days still run forwards within a year. A node with only
  # a year comes before one that also names a month. Undated nodes sort last,
  # and created_at breaks ties so the order never wobbles between requests.
  def chronological_key
    [
      dated? ? 0 : 1,
      dated? ? signed_year : 0,
      occurred_month || 0,
      occurred_day || 0,
      created_at || Time.current
    ]
  end

  # "March 5, 325 AD", "c. March 325 AD", "c. 325 AD" — month and day are
  # dropped when unknown, and approximate dates are marked with c.
  def date_display
    return unless dated?

    day_and_year = [ occurred_day, occurred_year ].compact.join(", ")
    written = [ month_name, day_and_year ].compact.join(" ")
    prefix = date_type == "approximate" ? "c. " : ""

    "#{prefix}#{written} #{era}"
  end

  private
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
