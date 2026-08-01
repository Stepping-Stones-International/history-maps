class AddAuthorToTopics < ActiveRecord::Migration[8.1]
  def change
    # Authors are users; the association is named for the role it plays.
    add_reference :topics, :author, null: false, foreign_key: { to_table: :users }
  end
end
