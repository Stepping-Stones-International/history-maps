class Node < ApplicationRecord
  # Stored value => label shown in the form.
  DATE_TYPES = {
    "exact" => "Exact Date (Point in Time)",
    "approximate" => "Approximate / Circa Date (Uncertain Point)",
    "range" => "Date Range / Span (Duration)",
    "disputed" => "Disputed / Alternate Dates (Contested History)"
  }.freeze

  # The form displays dates in this order.
  DATE_FORMAT = "%m-%d-%Y".freeze

  MIN_YEAR = 1
  MAX_YEAR = 4000

  ERAS = %w[AD BC].freeze

  # The form sends the date as three separate fields.
  attr_accessor :occurred_month, :occurred_day, :occurred_year

  belongs_to :topic

  before_validation :compose_occurred_on

  validates :title, presence: true
  validates :date_type, inclusion: { in: DATE_TYPES.keys }
  validates :era, inclusion: { in: ERAS }
  validates :latitude, presence: true,
    numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90 }
  validates :longitude, presence: true,
    numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 }
  validate :occurred_on_was_usable

  # Also accepts MM-DD-YYYY, plus the Date and ISO forms fixtures and the
  # console use. An unusable value is remembered so validation can report it
  # rather than raising.
  def occurred_on=(value)
    @date_error = nil

    if value.is_a?(String) && value.present?
      begin
        super(Date.strptime(value, DATE_FORMAT))
      rescue Date::Error
        @date_error = :format
        super(nil)
      end
    else
      super
    end
  end

  def occurred_on_formatted
    occurred_on&.strftime(DATE_FORMAT)
  end

  # The stored year is always positive, so the era has to travel with it.
  def occurred_on_with_era
    return if occurred_on.nil?

    "#{occurred_on_formatted} #{era}"
  end

  private
    def date_parts
      [ occurred_month, occurred_day, occurred_year ]
    end

    # Runs only when the three-field form was used, leaving occurred_on= alone.
    def compose_occurred_on
      return if date_parts.all? { |part| part.to_s.strip.empty? }

      month, day, year = date_parts.map { |part| Integer(part.to_s.strip, exception: false) }

      if year.nil? || !year.between?(MIN_YEAR, MAX_YEAR)
        return fail_date(:year)
      end

      self[:occurred_on] = Date.new(year, month, day)
      @date_error = nil
    rescue Date::Error, TypeError
      fail_date(:unreal)
    end

    def fail_date(reason)
      @date_error = reason
      self[:occurred_on] = nil
    end

    def occurred_on_was_usable
      case @date_error
      when :format then errors.add(:occurred_on, "must be formatted MM-DD-YYYY")
      when :year then errors.add(:occurred_year, "must be between #{MIN_YEAR} and #{MAX_YEAR}")
      when :unreal then errors.add(:occurred_on, "must be a real date")
      end
    end
end
