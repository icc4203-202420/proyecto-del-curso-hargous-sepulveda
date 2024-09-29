class EventPicture < ApplicationRecord
  belongs_to :event
  belongs_to :user
  has_many_attached :flyers
  def thumbnails
    return [] unless flyers.attached?

    flyers.map { |flyer| flyer.variant(resize_to_limit: [200, nil]).processed }
  end
end
