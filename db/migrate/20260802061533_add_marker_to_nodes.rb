class AddMarkerToNodes < ActiveRecord::Migration[8.1]
  def up
    # Which icon the node draws on the map.
    add_column :nodes, :marker, :string, default: Node::DEFAULT_MARKER
    # Nodes that predate the picker are the ordinary waypoint they were drawn as.
    Node.update_all(marker: Node::DEFAULT_MARKER)
  end

  def down
    remove_column :nodes, :marker
  end
end
