class CreateNodes < ActiveRecord::Migration[8.1]
  def change
    create_table :nodes, id: :string do |t|
      t.references :topic, null: false, foreign_key: true, type: :string
      t.string :title, null: false
      t.text :description
      t.float :latitude, null: false
      t.float :longitude, null: false

      t.timestamps
    end
  end
end
