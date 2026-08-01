class Topic < ApplicationRecord
  belongs_to :author, class_name: "User"
  has_many :nodes, dependent: :destroy

  validates :title, presence: true
end
