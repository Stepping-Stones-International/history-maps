class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class

  # Primary keys are UUIDs. SQLite has no uuid type or generator, so the value
  # is assigned here rather than by a column default.
  before_create do
    self.id = SecureRandom.uuid if has_attribute?(:id) && id.nil?
  end
end
