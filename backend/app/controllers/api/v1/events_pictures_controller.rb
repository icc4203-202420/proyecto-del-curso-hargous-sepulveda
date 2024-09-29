class API::V1::class EventPicturesController < ApplicationController
    before_action :set_event, only: [:create, :index]
    # before_action :verify_jwt_token, only: [:create, :destroy]  # Assuming JWT authentication is required
    before_action :set_event_picture, only: [:destroy]

    # GET /api/v1/events/:event_id/event_pictures
    def index
      @event_pictures = @event.event_pictures
      render json: @event_pictures, status: :ok
    end

    # POST /api/v1/events/:event_id/event_pictures
    def create
      @event_picture = @event.event_pictures.build(event_picture_params)
      @event_picture.user = current_user  # Assuming the current user is set by JWT

      if @event_picture.save
        render json: { message: 'Picture uploaded successfully.', event_picture: @event_picture }, status: :created
      else
        render json: { errors: @event_picture.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # DELETE /api/v1/event_pictures/:id
    def destroy
      if @event_picture.user == current_user  # Ensure only the uploader can delete their picture
        @event_picture.destroy
        head :no_content
      else
        render json: { error: 'Not authorized to delete this picture' }, status: :unauthorized
      end
    end

    private

    # Find the event using event_id from params
    def set_event
      @event = Event.find(params[:event_id])
      render json: { error: 'Event not found' }, status: :not_found unless @event
    end

    # Find the specific event picture by its ID
    def set_event_picture
      @event_picture = EventPicture.find(params[:id])
      render json: { error: 'Event picture not found' }, status: :not_found unless @event_picture
    end

    # Permit only the required parameters
    def event_picture_params
      params.require(:event_picture).permit(:image)  # Assuming :image is handled via ActiveStorage
    end

    # Verify JWT Token (assuming you use JWT for authentication)
    # def verify_jwt_token
    #   authenticate_user!
    #   head :unauthorized unless current_user
    # end
  end
end
end