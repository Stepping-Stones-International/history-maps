class AddEraToNodes < ActiveRecord::Migration[8.1]
  def change
    # Which side of the epoch the year counts from.
    add_column :nodes, :era, :string, null: false, default: "AD"
  end
end
