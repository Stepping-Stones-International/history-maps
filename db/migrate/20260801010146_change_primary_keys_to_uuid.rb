require "securerandom"

# SQLite cannot alter a primary key in place, so each table is rebuilt with a
# string primary key holding a UUID. Existing rows are carried over and their
# foreign keys remapped to the new identifiers.
class ChangePrimaryKeysToUuid < ActiveRecord::Migration[8.1]
  def up
    users = select_all("SELECT * FROM users").to_a
    sessions = select_all("SELECT * FROM sessions").to_a
    topics = select_all("SELECT * FROM topics").to_a

    user_uuids = users.to_h { |row| [ row["id"], SecureRandom.uuid ] }
    session_uuids = sessions.to_h { |row| [ row["id"], SecureRandom.uuid ] }
    topic_uuids = topics.to_h { |row| [ row["id"], SecureRandom.uuid ] }

    # Dependents first: both reference users.
    drop_table :sessions
    drop_table :topics
    drop_table :users

    create_table :users, id: :string do |t|
      t.string :email_address, null: false
      t.string :password_digest, null: false
      t.timestamps
    end
    add_index :users, :email_address, unique: true

    create_table :sessions, id: :string do |t|
      t.references :user, null: false, foreign_key: true, type: :string
      t.string :ip_address
      t.string :user_agent
      t.timestamps
    end

    create_table :topics, id: :string do |t|
      t.references :author, null: false, foreign_key: { to_table: :users }, type: :string
      t.string :title
      t.text :description
      t.timestamps
    end

    users.each do |row|
      insert_row :users, row.merge("id" => user_uuids.fetch(row["id"]))
    end

    sessions.each do |row|
      insert_row :sessions, row.merge(
        "id" => session_uuids.fetch(row["id"]),
        "user_id" => user_uuids.fetch(row["user_id"])
      )
    end

    topics.each do |row|
      insert_row :topics, row.merge(
        "id" => topic_uuids.fetch(row["id"]),
        "author_id" => user_uuids.fetch(row["author_id"])
      )
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration, "UUIDs cannot be mapped back to sequential ids"
  end

  private
    def insert_row(table, attributes)
      columns = attributes.keys.map { |name| quote_column_name(name) }.join(", ")
      values = attributes.values.map { |value| quote(value) }.join(", ")

      execute("INSERT INTO #{quote_table_name(table)} (#{columns}) VALUES (#{values})")
    end
end
