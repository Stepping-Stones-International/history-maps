class AddDateTypeToNodes < ActiveRecord::Migration[8.1]
  def change
    # How the node's date should be read: an exact point, an approximate one,
    # a span, or a contested set of candidates.
    add_column :nodes, :date_type, :string, null: false, default: "exact"
  end
end
