# Deletes the nodes of a topic that sit nowhere near a drawn route.
#
# A city with no road to it is a fair thing to map, but on a topic about roads
# it is a marker floating on bare terrain. This drops those, measuring against
# every route pack the app ships — roads, rivers and all.
#
#   bin/rails runner script/drop_nodes_off_the_network.rb TOPIC_ID [KM] [--dry-run]
#
# Nothing is lost that cannot be put back: each importer skips what a topic
# already has, so re-running one restores what it added.

require "json"

topic_id, *rest = ARGV
limit = (rest.find { |a| a !~ /^--/ } || 20).to_f
dry_run = rest.include?("--dry-run")

CELL = 0.25

grid = Hash.new { |h, k| h[k] = [] }
Dir[Rails.root.join("app/assets/data/*.geojson")].each do |path|
  JSON.parse(File.read(path))["features"].each do |feature|
    geometry = feature["geometry"]
    next unless geometry

    lines = case geometry["type"]
    when "LineString" then [ geometry["coordinates"] ]
    when "MultiLineString" then geometry["coordinates"]
    else []
    end

    lines.each do |line|
      line.each { |lo, la| grid[[ (lo / CELL).to_i, (la / CELL).to_i ]] << [ lo, la ] }
    end
  end
end

def kilometres_to_route(grid, longitude, latitude)
  closest = Float::INFINITY
  x, y = (longitude / CELL).to_i, (latitude / CELL).to_i

  (x - 3..x + 3).each do |i|
    (y - 3..y + 3).each do |j|
      grid[[ i, j ]].each do |other_x, other_y|
        span = Math.hypot(
          (other_x - longitude) * Math.cos(latitude * Math::PI / 180),
          other_y - latitude
        ) * 111.32
        closest = span if span < closest
      end
    end
  end

  closest
end

topic = Topic.find(topic_id)
adrift = topic.nodes.where.not(latitude: nil).reject do |node|
  kilometres_to_route(grid, node.longitude, node.latitude) <= limit
end

adrift.sort_by(&:longitude).each do |node|
  puts format("   %6.1fE  %s", node.longitude, node.title[0, 40])
end

if dry_run
  puts "\nwould drop #{adrift.size} of #{topic.nodes.count} nodes further than #{limit.to_i}km from a route"
else
  adrift.each(&:destroy)
  puts "\ndropped #{adrift.size} nodes further than #{limit.to_i}km from a route; #{topic.nodes.count} left"
end
