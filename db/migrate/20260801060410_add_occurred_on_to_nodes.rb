class AddOccurredOnToNodes < ActiveRecord::Migration[8.1]
  def change
    add_column :nodes, :occurred_on, :date
  end
end
