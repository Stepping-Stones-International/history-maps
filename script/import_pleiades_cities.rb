# Adds the cities of a region to a topic as waypoints, from Pleiades.
#
# Pleiades is the gazetteer of the ancient world, CC BY:
#
#   https://pleiades.stoa.org/downloads   (pleiades-places-latest.csv.gz)
#
# Which places count as cities is the gazetteer's own judgement rather than
# ours. A place is taken when it is a settlement, is attested in a Roman
# period, carries a certain identification, and has been written up rather
# than left as a bare atlas citation:
#
#   featureTypes includes "settlement"
#   timePeriodsKeys includes "roman"
#   title without "?"
#   description is not "An ancient place, cited: BAtlas ..."
#
# Pleiades gives no founding date — its minDate is the earliest attestation at
# the site, which for Edessa is 2,600,000 BC. Founding years therefore come
# from Wikidata's inception property (P571, CC0), joined on the Pleiades id,
# and only about a fifth of places carry one. The rest are imported undated
# rather than given a date we made up. That table comes from:
#
#   SELECT ?item ?pleiades ?inception WHERE {
#     ?item wdt:P1584 ?pleiades ; wdt:P571 ?inception ;
#           p:P625/psv:P625 [ wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?lon ] .
#     FILTER(?lon >= 38.0 && ?lon <= 50.0 && ?lat >= 29.0 && ?lat <= 38.5)
#   }
#
# saved as a CSV of pleiades_id,inception_year,wikidata_item.
#
#   bin/rails runner script/import_pleiades_cities.rb TOPIC_ID places.csv \
#     inception.csv WEST,SOUTH,EAST,NORTH
#
# Running it twice adds nothing: a city already in the topic is left alone.

require "csv"

topic_id, places_path, inception_path, bounds = ARGV
west, south, east, north = (bounds || "38,29,50,38.5").split(",").map(&:to_f)

# The founding years, keyed by Pleiades id.
inception = {}
CSV.foreach(inception_path, headers: true) do |row|
  inception[row["pleiades_id"]] = [ Integer(row["inception_year"]), row["wikidata_item"] ]
end

topic = Topic.find(topic_id)
existing = topic.nodes.pluck(:title).to_set

added = dated = skipped = 0

CSV.foreach(places_path, headers: true, encoding: "bom|utf-8") do |row|
  next unless row["featureTypes"].to_s.include?("settlement")
  next unless row["timePeriodsKeys"].to_s.include?("roman")

  title = row["title"].to_s.strip
  next if title.empty? || title.include?("?")
  next if row["description"].to_s.start_with?("An ancient place, cited")

  latitude = Float(row["reprLat"]) rescue next
  longitude = Float(row["reprLong"]) rescue next
  next unless longitude.between?(west, east) && latitude.between?(south, north)

  if existing.include?(title)
    skipped += 1
    next
  end

  year, item = inception[row["id"]]
  # The model holds years 1..4000, so a date older than that cannot be written
  # down here. Those cities come in undated rather than clamped to a year they
  # were not founded in.
  beyond_reach = year && year.abs > Node::MAX_YEAR
  year = nil if beyond_reach

  founding = if year
    "Founded c. #{year.abs} #{year.negative? ? 'BC' : 'AD'}, per Wikidata #{item} (CC0)."
  elsif beyond_reach
    "Wikidata gives a founding date older than this map can hold, so it is " \
    "left undated here."
  else
    "No founding date is recorded for it in Wikidata, so it is left undated " \
    "rather than given a year we invented."
  end

  topic.nodes.create!(
    title: title,
    description: [
      row["description"].to_s.strip,
      founding,
      "Attested in the Roman period. Pleiades #{row['id']} " \
      "(https://pleiades.stoa.org/places/#{row['id']}), CC BY."
    ].reject(&:empty?).join(" "),
    marker: "waypoint",
    latitude: latitude,
    longitude: longitude,
    **(year ? {
      date_type: "approximate",
      occurred_year: year.abs,
      era: year.negative? ? "BC" : "AD"
    } : { date_type: "none" })
  )

  added += 1
  dated += 1 if year
end

puts "added #{added} cities (#{dated} with a founding date, #{added - dated} undated), " \
     "left #{skipped} already there"
