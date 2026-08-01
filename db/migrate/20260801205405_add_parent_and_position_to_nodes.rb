# Nodes can embed other nodes, kept in a chosen order under their parent.
class AddParentAndPositionToNodes < ActiveRecord::Migration[8.1]
  def change
    add_reference :nodes, :parent, type: :string, foreign_key: { to_table: :nodes }
    add_column :nodes, :position, :integer, null: false, default: 0
    add_index :nodes, [ :parent_id, :position ]
  end
end
