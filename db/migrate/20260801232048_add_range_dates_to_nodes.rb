# A span has two ends, and each end is known with its own certainty.
class AddRangeDatesToNodes < ActiveRecord::Migration[8.1]
  def change
    %w[starts ends].each do |edge|
      add_column :nodes, :"#{edge}_type", :string, null: false, default: "exact"
      add_column :nodes, :"#{edge}_year", :integer
      add_column :nodes, :"#{edge}_month", :integer
      add_column :nodes, :"#{edge}_day", :integer
      add_column :nodes, :"#{edge}_era", :string, null: false, default: "AD"
    end
  end
end
