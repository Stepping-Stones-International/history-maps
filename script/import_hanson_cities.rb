# Adds the major cities of the Roman world to a topic, as waypoints dated by
# the year each was begun.
#
# The source is Hanson's Cities Database, a catalogue of 1,388 sites with urban
# characteristics in the Roman Empire between 100 BC and AD 300:
#
#   Hanson, J. W. (2016). Cities Database, Version 1.0 (OxREP databases).
#   https://doi.org/10.5287/bodleian:eqapevAn8
#
# "Major" is the database's own Barrington Atlas rank rather than a judgement
# of ours: rank 1 is the handful of greatest cities, rank 2 the next tier.
# Ranks 3 and below run to hundreds of small towns.
#
#   bin/rails runner script/import_hanson_cities.rb TOPIC_ID cities.csv [ranks]
#
# Running it twice adds nothing: a city already in the topic is left alone.

require "csv"

topic_id, path, ranks = ARGV
ranks = (ranks || "1,2").split(",")

# OxREP publishes the file as Latin-1, which Ruby will not read as UTF-8.
text = File.read(path, encoding: "bom|utf-8")
text = File.read(path, encoding: "iso-8859-1:utf-8") unless text.valid_encoding?

topic = Topic.find(topic_id)
existing = topic.nodes.pluck(:title).to_set

added = skipped = 0

CSV.parse(text, headers: true).each do |row|
  next unless ranks.include?(row["Barrington Atlas Rank"])

  title = row["Ancient Toponym"].to_s.strip
  next if title.empty?

  if existing.include?(title)
    skipped += 1
    next
  end

  year = Integer(row["Start Date"])
  modern = row["Modern Toponym"].to_s.strip
  where = [ row["Province"], row["Country"] ].map(&:to_s).reject(&:empty?).join(", ")

  description = [
    modern.empty? || modern == "NULL" ? nil : "Modern #{modern}.",
    where.empty? ? nil : "#{where}.",
    "Barrington Atlas rank #{row['Barrington Atlas Rank']}.",
    "Begun c. #{year.abs} #{year.negative? ? 'BC' : 'AD'}, per Hanson 2016 Cities Database " \
    "(doi:10.5287/bodleian:eqapevAn8).",
    row["Select Bibliography"].to_s.strip.empty? ? nil : "Sources: #{row['Select Bibliography']}"
  ].compact.join(" ")

  topic.nodes.create!(
    title: title,
    description: description,
    marker: "waypoint",
    date_type: "approximate",
    occurred_year: year.abs,
    era: year.negative? ? "BC" : "AD",
    latitude: Float(row["Latitude (Y)"]),
    longitude: Float(row["Longitude (X)"])
  )
  added += 1
end

puts "added #{added} cities, left #{skipped} already there"
