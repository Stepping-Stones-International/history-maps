class Node < ApplicationRecord
  # Stored value => label shown in the form.
  DATE_TYPES = {
    "exact" => "Exact Date (Point in Time)",
    "approximate" => "Approximate / Circa Date (Uncertain Point)",
    "range" => "Date Range / Span (Duration)",
    "disputed" => "Disputed / Alternate Dates (Contested History)"
  }.freeze

  belongs_to :topic

  validates :title, presence: true
  validates :date_type, inclusion: { in: DATE_TYPES.keys }
  validates :latitude, presence: true,
    numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90 }
  validates :longitude, presence: true,
    numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 }
end
