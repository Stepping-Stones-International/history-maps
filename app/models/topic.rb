class Topic < ApplicationRecord
  belongs_to :author, class_name: "User"
  has_many :nodes, dependent: :destroy

  validates :title, presence: true
  validates :center_latitude,
    numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90 }, allow_nil: true
  validates :center_longitude,
    numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 }, allow_nil: true
  validates :zoom, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 24 }, allow_nil: true

  validate :default_view_is_whole

  # Where the map should open, or nil to fall back to the region it was
  # designed around.
  def default_view
    return unless default_view?

    { latitude: center_latitude, longitude: center_longitude, zoom: zoom }
  end

  def default_view?
    [ center_latitude, center_longitude, zoom ].all?(&:present?)
  end

  private
    # A centre without a zoom, or half a coordinate, cannot open a map.
    def default_view_is_whole
      parts = [ center_latitude, center_longitude, zoom ]
      return if parts.all?(&:blank?) || parts.all?(&:present?)

      errors.add(:base, "A default view needs a centre and a zoom")
    end
end
