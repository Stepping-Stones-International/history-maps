# A Date column cannot express a partial date, and approximate nodes may know
# only a year. The parts are stored separately instead, with month and day
# optional.
class StoreNodeDateParts < ActiveRecord::Migration[8.1]
  def up
    add_column :nodes, :occurred_year, :integer
    add_column :nodes, :occurred_month, :integer
    add_column :nodes, :occurred_day, :integer

    execute <<~SQL
      UPDATE nodes SET
        occurred_year  = CAST(strftime('%Y', occurred_on) AS INTEGER),
        occurred_month = CAST(strftime('%m', occurred_on) AS INTEGER),
        occurred_day   = CAST(strftime('%d', occurred_on) AS INTEGER)
      WHERE occurred_on IS NOT NULL
    SQL

    remove_column :nodes, :occurred_on
  end

  def down
    add_column :nodes, :occurred_on, :date

    execute <<~SQL
      UPDATE nodes SET occurred_on =
        printf('%04d-%02d-%02d', occurred_year, occurred_month, occurred_day)
      WHERE occurred_year IS NOT NULL
        AND occurred_month IS NOT NULL
        AND occurred_day IS NOT NULL
    SQL

    remove_column :nodes, :occurred_year
    remove_column :nodes, :occurred_month
    remove_column :nodes, :occurred_day
  end
end
