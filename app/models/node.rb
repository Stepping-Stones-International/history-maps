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

  validates :title, presence: true
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

  def dated?
    occurred_year.present?
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
    def signed_year
      era == "BC" ? -occurred_year : occurred_year
    end

    def month_name
      Date::MONTHNAMES[occurred_month] if occurred_month
    end

    def required_date_parts_present
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
