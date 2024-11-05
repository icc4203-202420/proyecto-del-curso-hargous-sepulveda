class API::V1::EventPicturesController < ApplicationController
  before_action :set_event, only: [:create, :index]
  before_action :set_event_picture, only: [:destroy]
# PATCH /api/v1/events/:event_id/event_pictures/:id
def update
  @event_picture = EventPicture.find_by(id: params[:id])

  if @event_picture.nil?
    return render json: { error: 'Event picture not found' }, status: :not_found
  end

  if @event_picture.update(event_picture_params)
    render json: { message: 'Event picture updated successfully', event_picture: @event_picture }, status: :ok
  else
    render json: { error: 'Error updating event picture' }, status: :unprocessable_entity
  end
end


# GET /api/v1/events/:event_id/event_pictures
def index
  @event_pictures = @event.event_pictures

  # Incluye las URLs de las imágenes en la respuesta
  event_pictures_with_urls = @event_pictures.map do |event_picture|
    {
      id: event_picture.id,
      event_id: event_picture.event_id,
      user_id: event_picture.user_id,
      description: event_picture.description,
      created_at: event_picture.created_at,
      updated_at: event_picture.updated_at,
      flyer_urls: event_picture.flyers.map { |flyer| url_for(flyer) } # Aquí se añaden las URLs
    }
  end

  render json: event_pictures_with_urls, status: :ok
end

  # POST /api/v1/events/:event_id/event_pictures
  def create
    @event_picture = @event.event_pictures.build(description: event_picture_params[:description], user_id: event_picture_params[:user_id])
  
    if params[:event_picture][:flyer_base64].present?
      begin
        decoded_flyer = decode_base64_image(params[:event_picture][:flyer_base64])
  
        if decoded_flyer
          @event_picture.flyers.attach(io: decoded_flyer[:io], filename: decoded_flyer[:filename], content_type: decoded_flyer[:content_type])
  
          if @event_picture.save && @event_picture.flyers.attached?
            flyer_url = url_for(@event_picture.flyers.last)
  

            tagged_usernames = @event_picture.description.scan(/@([\w.]+)/).flatten
            puts "Tagged usernames: #{tagged_usernames.inspect}"

            tagged_users = User.where(handle: tagged_usernames).where.not(push_token: [nil, ''])
            puts "Found #{tagged_users.count} tagged users with push tokens:"
            tagged_users.each { |user| puts "User: #{user.handle}, Push Token: #{user.push_token}" }
            
            tagged_users.each do |tagged|
              if tagged.push_token.present?
                PushNotificationService.send_notification(
                  to: tagged.push_token,
                  title: "Eres Famoso!!!",
                  body: "#{@event_picture.user.handle} te etiquetó en una foto del evento #{@event.name}",
                  data: {}
                )
              end
            end
  
            render json: { message: 'Flyer uploaded successfully', flyer_url: flyer_url, event_picture: @event_picture }, status: :created
          else
            render json: { error: 'Error saving EventPicture or attaching flyer' }, status: :unprocessable_entity
          end
        else
          render json: { error: 'Invalid base64 string' }, status: :unprocessable_entity
        end
      rescue => e
        render json: { error: "Error processing file: #{e.message}" }, status: :unprocessable_entity
      end
    else
      render json: { error: 'No file provided' }, status: :unprocessable_entity
    end
  end
  
  
  
  # DELETE /api/v1/event_pictures/:id
  def destroy
    @event_picture.destroy
    head :no_content
  end

  private

  def set_event
    @event = Event.find_by(id: params[:event_id])
    render json: { error: 'Event not found' }, status: :not_found unless @event
  end

  def set_event_picture
    @event_picture = EventPicture.find_by(id: params[:id])
    render json: { error: 'Event picture not found' }, status: :not_found unless @event_picture
  end

  def event_picture_params
    params.require(:event_picture).permit(:description, :user_id, :flyer_base64)
  end

  # Decode the base64 string and return a hash containing the image IO object and metadata
  def decode_base64_image(base64_string)
    return nil unless base64_string.present?

    begin
      # Validate if the string contains content type and base64
      if base64_string.match(%r{^data:(.*?);base64,(.*)$})
        content_type = Regexp.last_match(1) # Extract content type
        encoded_image = Regexp.last_match(2) # Extract base64 string

        # Decode the image
        decoded_image = Base64.decode64(encoded_image)
        extension = content_type.split('/')[1] # Get file extension

        io = StringIO.new(decoded_image)
        filename = "flyer.#{extension}"

        { io: io, filename: filename, content_type: content_type }
      else
        Rails.logger.error('Invalid base64 format')
        nil
      end
    rescue => e
      Rails.logger.error("Error decoding image: #{e.message}")
      nil
    end
  end
end
