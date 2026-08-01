# A layer groups other nodes and sits nowhere in particular, so it carries no
# coordinates.
class AddLayerToNodes < ActiveRecord::Migration[8.1]
  def change
    add_column :nodes, :layer, :boolean, null: false, default: false
    change_column_null :nodes, :latitude, true
    change_column_null :nodes, :longitude, true
  end
end
