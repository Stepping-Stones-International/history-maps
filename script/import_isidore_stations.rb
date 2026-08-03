# Adds the stations of Isidore's Parthian Stations to a topic as waypoints.
#
# Reads the extract this repository already ships, so the nodes and the map
# pack say the same thing:
#
#   app/assets/data/isidore-stations.geojson
#
# built by script/extract_isidore_stations.py from AWMC's mapping (GPL-3.0) of
# Isidore of Charax, Mansiones Parthicae, first century AD.
#
#   bin/rails runner script/import_isidore_stations.rb TOPIC_ID [stations.geojson]
#
# The stations carry no date. Isidore names them in order and gives the
# distances between them, but neither he nor AWMC dates the founding of any
# one, so they are imported undated rather than dated by when he wrote.
#
# Running it twice adds nothing: a station already in the topic is left alone.

path = ARGV[1] || Rails.root.join("app/assets/data/isidore-stations.geojson").to_s
stations = JSON.parse(File.read(path))
provenance = stations["source"] || {}

topic = Topic.find(ARGV[0])
existing = topic.nodes.pluck(:title).to_set

added = doubted = skipped = 0

stations["features"].each do |station|
  properties = station["properties"]
  title = properties["title"]

  if existing.include?(title)
    skipped += 1
    next
  end

  longitude, latitude = station["geometry"]["coordinates"]
  apart = properties["id_disagrees_km"]

  description = [
    "A station on the Parthian road, named by Isidore of Charax in " \
    "Mansiones Parthicae (first century AD). He gives its place in the " \
    "itinerary and the distance to the next, but no date of its own, so this " \
    "node is undated.",
    properties["link"] && "Identified with #{properties['link']}.",
    apart && "That identification is doubtful: the Pleiades place cited lies " \
             "#{apart}km from where this station is mapped.",
    "Mapped by #{provenance['citation']} (#{provenance['licence']}), #{provenance['url']}."
  ].compact.join(" ")

  topic.nodes.create!(
    title: title,
    description: description,
    marker: "waypoint",
    date_type: "none",
    latitude: latitude,
    longitude: longitude
  )

  added += 1
  doubted += 1 if apart
end

puts "added #{added} stations (#{doubted} with a doubtful identification), " \
     "left #{skipped} already there"
