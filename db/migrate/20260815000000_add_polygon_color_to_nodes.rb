class AddPolygonColorToNodes < ActiveRecord::Migration[8.1]
  def change
    add_column :nodes, :polygon_color, :string, null: false, default: "#8fb8e8"
  end
end
