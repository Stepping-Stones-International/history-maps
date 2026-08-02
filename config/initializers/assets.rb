# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = "1.0"

# Add additional assets to the asset load path.
# Rails.application.config.assets.paths << Emoji.images_path

# Map overlays are fetched at runtime rather than bundled, so they are served
# as fingerprinted assets like any stylesheet.
Rails.application.config.assets.paths << Rails.root.join("app/assets/data")

# Propshaft names an asset by its extension, and Rails does not know GeoJSON.
Mime::Type.register "application/geo+json", :geojson unless Mime::Type.lookup_by_extension(:geojson)
