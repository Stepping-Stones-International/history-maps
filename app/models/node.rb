class Node < ApplicationRecord
  # Stored value => label shown in the form.
  DATE_TYPES = {
    "exact" => "Exact Date (Point in Time)",
    "approximate" => "Approximate / Circa Date (Uncertain Point)",
    "range" => "Date Range / Span (Duration)",
    "disputed" => "Disputed / Alternate Dates (Contested History)"
  }.freeze

  # The form sends and displays dates in this order.
  DATE_FORMAT = "%m-%d-%Y".freeze

  belongs_to :topic

  validates :title, presence: true
  validates :date_type, inclusion: { in: DATE_TYPES.keys }
  validates :latitude, presence: true,
    numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90 }
  validates :longitude, presence: true,
    numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 }
  validate :occurred_on_was_parsable

  # Accepts MM-DD-YYYY from the form, alongside the Date and ISO string forms
  # fixtures and the console use. An unparsable string is remembered so the
  # validation can report it rather than raising.
  def occurred_on=(value)
    @occurred_on_invalid = false

    if value.is_a?(String) && value.present?
      begin
        super(Date.strptime(value, DATE_FORMAT))
      rescue Date::Error
        @occurred_on_invalid = true
        super(nil)
      end
    else
      super
    end
  end

  def occurred_on_formatted
    occurred_on&.strftime(DATE_FORMAT)
  end

  private
    def occurred_on_was_parsable
      return unless @occurred_on_invalid

      errors.add(:occurred_on, "must be formatted MM-DD-YYYY")
    end
end
