class Event < ApplicationRecord
  belongs_to :bar
  has_many :attendances
  has_many :users, through: :attendances

  has_one_attached :flyer

  def thumbnail
 
    return nil unless flyer.attached?

    flyer.variant(resize_to_limit: [200, nil]).processed
  end
end
