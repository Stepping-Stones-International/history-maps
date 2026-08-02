class AddMapPacksToTopics < ActiveRecord::Migration[8.1]
  def change
    # Which reference overlays the topic draws, as a JSON array of pack keys.
    # Null rather than "[]": Rails serializes an empty array back to null.
    add_column :topics, :map_packs, :text
  end
end
