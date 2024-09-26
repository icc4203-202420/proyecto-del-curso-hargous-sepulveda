class API::V1::EventsController < ApplicationController
  include ImageProcessing
  include Authenticable

  respond_to :json
  before_action :set_event, only: [:show, :update, :destroy]
  before_action :verify_jwt_token, only: [:create, :update, :destroy]

  # GET /api/v1/events
  def index
    if params[:bar_id].present?
      events = Event.where(bar_id: params[:bar_id])  # Filtra eventos por bar_id
    else
      events = Event.all   
    end

    render json: { events: events }, status: :ok
  end
  # GET /api/v1/events/:id
  def search
    query = "%#{params[:q]}%"
    if params[:q]
      @events = Event.where("name LIKE ?", query)
    else
      @events = Event.all
    end

    render json: { events: @events }, status: :ok
  end
  def show
    
    event_data = @event.as_json.tap do |data|
      data[:flyer_url] = url_for(@event.flyer) if @event.flyer.attached?
      data[:thumbnail_url] = url_for(@event.thumbnail) if @event.thumbnail.attached?
    end
    
    render json: { event: event_data }, status: :ok
  end
  

  # POST /api/v1/events
  def create
    @event = Event.new(event_params.except(:flyer_base64))
    handle_flyer_attachment if event_params[:flyer_base64]

    if @event.save
      render json: { event: @event, message: 'Event created successfully.' }, status: :created
    else
      render json: { errors: @event.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/events/:id
  def update
    handle_flyer_attachment if event_params[:flyer_base64]

    if @event.update(event_params.except(:flyer_base64))
      render json: { event: @event, message: 'Event updated successfully.' }, status: :ok
    else
      render json: { errors: @event.errors.full_messages }, status: :unprocessable_entity
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
    render json: { error: 'Event not found' }, status: :not_found if @event.nil?
  end  

  def event_params
    params.require(:event).permit(:name, :description, :date, :bar_id, :start_date, :end_date, :flyer_base64)
  end

  def handle_flyer_attachment
    begin
      decoded_flyer = decode_image(event_params[:flyer_base64])
      @event.flyer.attach(io: decoded_flyer[:io], 
        filename: decoded_flyer[:filename], 
        content_type: decoded_flyer[:content_type])
    rescue StandardError => e
      render json: { error: "Failed to process flyer: #{e.message}" }, status: :unprocessable_entity
    end
  end 

  def verify_jwt_token
    authenticate_user!
    head :unauthorized unless current_user
  end  
end
