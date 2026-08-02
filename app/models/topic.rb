class Topic < ApplicationRecord
  # Reference overlays drawn under the topic's own nodes. Each is a dataset
  # shipped with the app rather than anything the author writes.
  MAP_PACKS = {
    "roman_roads" => {
      label: "Roman roads (Itiner-e)",
      file: "roman-roads.geojson",
      note: "Itiner-e's reconstruction of the Roman Empire's road network.",
      covers: "Main and secondary roads from Italy and Sicily through Greece, " \
              "Asia Minor, the Levant and Egypt, stopping at the Euphrates — " \
              "7,244 segments of the wider empire-wide network.",
      years: "One snapshot of the network as it stood around AD 150. Individual " \
             "roads that carry a date range from 514 BC to AD 700, though two " \
             "thirds carry none at all."
    },
    "awmc_roads" => {
      label: "Roman roads (Barrington Atlas)",
      file: "awmc-roads.geojson",
      note: "The Ancient World Mapping Centre's independent reconstruction.",
      covers: "1,942 roads over the same ground, drawn at atlas scale, so far " \
              "coarser than Itiner-e — but it names 117 of the classical viae, " \
              "which Itiner-e does not.",
      years: "The Greek and Roman world of the Barrington Atlas, most densely the " \
             "Roman period. Roads are marked by era rather than by year."
    }
  }.freeze

  belongs_to :author, class_name: "User"
  has_many :nodes, dependent: :destroy

  serialize :map_packs, coder: JSON, type: Array

  # Checkboxes post an unchecked box as "", which is not a pack.
  normalizes :map_packs, with: ->(packs) { Array(packs).map(&:to_s).select(&:present?).uniq }

  validates :title, presence: true
  validate :map_packs_are_known
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

  def draws?(pack)
    map_packs.include?(pack)
  end

  private
    def map_packs_are_known
      unknown = map_packs - MAP_PACKS.keys
      return if unknown.empty?

      errors.add(:map_packs, "does not include #{unknown.to_sentence}")
    end

    # A centre without a zoom, or half a coordinate, cannot open a map.
    def default_view_is_whole
      parts = [ center_latitude, center_longitude, zoom ]
      return if parts.all?(&:blank?) || parts.all?(&:present?)

      errors.add(:base, "A default view needs a centre and a zoom")
    end
end
