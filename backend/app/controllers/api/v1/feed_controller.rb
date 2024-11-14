class API::V1::FeedController < ApplicationController
    include ImageProcessing
    before_action :set_user, only: [:show]
  
    def show
      friend_ids = @user.friends.pluck(:id) + [@user.id]
  
      @reviews = Review.where(user_id: friend_ids)
  
      @event_pictures = EventPicture.where(user_id: friend_ids).map do |event_picture|
        {
          id: event_picture.id,
          event_id: event_picture.event_id,
          event_name: event_picture.event.name,
          user_id: event_picture.user_id,
          description: event_picture.description,
          created_at: event_picture.created_at,
          updated_at: event_picture.updated_at,
          flyer_urls: event_picture.flyers.map { |flyer| url_for(flyer) }
        }
      end
  
      render json: {
        reviews: @reviews,
        event_pictures: @event_pictures
      }, status: :ok
    end
  
    private
  
    def set_user
      @user = User.find_by(id: params[:id])
      render json: { error: 'User not found' }, status: :not_found if @user.nil?
    end
  end
  