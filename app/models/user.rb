class User < ApplicationRecord
  has_secure_password
  has_many :sessions, dependent: :destroy
  has_many :topics, foreign_key: :author_id, inverse_of: :author, dependent: :destroy

  normalizes :email_address, with: ->(e) { e.strip.downcase }

  # The DB has a unique index; validate too so signup shows an error
  # instead of raising RecordNotUnique.
  validates :email_address, presence: true, uniqueness: true,
    format: { with: URI::MailTo::EMAIL_REGEXP, message: "is not a valid email address" }
end
