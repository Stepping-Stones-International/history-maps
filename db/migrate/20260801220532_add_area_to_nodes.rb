# A layer can outline a region: a ring of [longitude, latitude] pairs.
class AddAreaToNodes < ActiveRecord::Migration[8.1]
  def change
    add_column :nodes, :area, :json
  end
end
