# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_08_02_014158) do
  create_table "nodes", id: :string, force: :cascade do |t|
    t.json "area"
    t.datetime "created_at", null: false
    t.string "date_type", default: "exact", null: false
    t.text "description"
    t.integer "ends_day"
    t.string "ends_era", default: "AD", null: false
    t.integer "ends_month"
    t.string "ends_type", default: "exact", null: false
    t.integer "ends_year"
    t.string "era", default: "AD", null: false
    t.float "latitude"
    t.boolean "layer", default: false, null: false
    t.float "longitude"
    t.integer "occurred_day"
    t.integer "occurred_month"
    t.integer "occurred_year"
    t.string "parent_id"
    t.integer "position", default: 0, null: false
    t.integer "starts_day"
    t.string "starts_era", default: "AD", null: false
    t.integer "starts_month"
    t.string "starts_type", default: "exact", null: false
    t.integer "starts_year"
    t.string "title", null: false
    t.string "topic_id", null: false
    t.datetime "updated_at", null: false
    t.index ["parent_id", "position"], name: "index_nodes_on_parent_id_and_position"
    t.index ["parent_id"], name: "index_nodes_on_parent_id"
    t.index ["topic_id"], name: "index_nodes_on_topic_id"
  end

  create_table "sessions", id: :string, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "ip_address"
    t.datetime "updated_at", null: false
    t.string "user_agent"
    t.string "user_id", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "topics", id: :string, force: :cascade do |t|
    t.string "author_id", null: false
    t.float "center_latitude"
    t.float "center_longitude"
    t.datetime "created_at", null: false
    t.text "description"
    t.text "map_packs"
    t.string "title"
    t.datetime "updated_at", null: false
    t.float "zoom"
    t.index ["author_id"], name: "index_topics_on_author_id"
  end

  create_table "users", id: :string, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email_address", null: false
    t.string "password_digest", null: false
    t.datetime "updated_at", null: false
    t.index ["email_address"], name: "index_users_on_email_address", unique: true
  end

  add_foreign_key "nodes", "nodes", column: "parent_id"
  add_foreign_key "nodes", "topics"
  add_foreign_key "sessions", "users"
  add_foreign_key "topics", "users", column: "author_id"
end
