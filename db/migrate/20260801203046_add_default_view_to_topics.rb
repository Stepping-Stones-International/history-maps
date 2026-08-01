# Where the map opens for this topic: centre and zoom, all or nothing.
class AddDefaultViewToTopics < ActiveRecord::Migration[8.1]
  def change
    add_column :topics, :center_latitude, :float
    add_column :topics, :center_longitude, :float
    add_column :topics, :zoom, :float
  end
end
