class API::V1::EventsController < ApplicationController
  include ImageProcessing
  include Authenticable

  respond_to :json
  before_action :set_event, only: [:show, :update, :destroy]
  before_action :verify_jwt_token, only: [:create, :update, :destroy]

  # GET /api/v1/events
  def index
    @event = Event.all
    render json: { event: @event }, status: :ok
  end

  # GET /api/v1/events/:id
  def show
    if @event.image.attached?
      render json: @event.as_json.merge({ 
        image_url: url_for(@event.image), 
        thumbnail_url: url_for(@event.thumbnail)
      }), status: :ok
    else
      render json: { event: @event.as_json }, status: :ok
    end 
  end

  # POST /api/v1/events
  def create
    @event = event.new(event_params.except(:image_base64))
    handle_image_attachment if event_params[:image_base64]

    if @event.save
      render json: { event: @event, message: 'event created successfully.' }, status: :created
    else
      render json: @event.errors, status: :unprocessable_entity
    end
  end
  
  # PATCH/PUT /api/v1/events/:id
  def update
    handle_image_attachment if event_params[:image_base64]

    if @event.update(event_params.except(:image_base64))
      render json: { event: @event, message: 'event updated successfully.' }, status: :ok
    else
      render json: @event.errors, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/events/:id
  def destroy
    @event.destroy
    head :no_content
  end
  
  private

 
  def set_event
    @event = Event.find_by(id: params[:id])
    render json: { error: 'event not found' }, status: :not_found if @event.nil?
  end  
  

  def event_params
    params.require(:event).permit(:name, :event_type, 
      :style, :hop, :yeast, :malts, 
      :ibu, :alcohol, :blg, :brand_id, :avg_rating,
      :image_base64)
  end


  def handle_image_attachment
    decoded_image = decode_image(event_params[:image_base64])
    @event.image.attach(io: decoded_image[:io], 
      filename: decoded_image[:filename], 
      content_type: decoded_image[:content_type])
  end 
  
 
  def verify_jwt_token
    authenticate_user!
    head :unauthorized unless current_user
  end  
end
