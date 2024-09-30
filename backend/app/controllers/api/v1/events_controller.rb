class API::V1::EventsController < ApplicationController
  include ImageProcessing
  # include Authenticable

  respond_to :json
  before_action :set_event, only: [:show, :update, :destroy, :upload_flyer]

  # GET /api/v1/events
  def index
    events = params[:bar_id].present? ? Event.where(bar_id: params[:bar_id]) : Event.all
    render json: { events: events }, status: :ok
  end

  # GET /api/v1/events/:id
  def show
    event_data = @event.as_json.tap do |data|
      data[:flyer_url] = url_for(@event.flyer) if @event.flyer.attached?
      data[:thumbnail_url] = url_for(@event.thumbnail) if @event.thumbnail.attached?
    end
    render json: { event: event_data }, status: :ok
  end

  # POST /api/v1/events/:id/upload_flyer
  def upload_flyer
    if params[:event][:flyer].present?
      begin
        # Adjuntar el archivo flyer
        @event.flyer.attach(params[:event][:flyer])
  
        if @event.flyer.attached?
          render json: { message: 'Flyer subido exitosamente', flyer_url: url_for(@event.flyer) }, status: :ok
        else
          render json: { error: 'Error al adjuntar el flyer' }, status: :unprocessable_entity
        end
      rescue => e
        render json: { error: "Error procesando el archivo: #{e.message}" }, status: :unprocessable_entity
      end
    else
      render json: { error: 'No se proporcionó ningún archivo' }, status: :unprocessable_entity
    end
  end
  

  # PATCH/PUT /api/v1/events/:id
  def update
    handle_flyer_attachment if event_params[:flyer_base64]

    if @event.update(event_params.except(:flyer_base64))
      render json: { event: @event, message: 'Evento actualizado exitosamente.' }, status: :ok
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
    render json: { error: 'Evento no encontrado' }, status: :not_found if @event.nil?
  end

  def event_params
    params.require(:event).permit(:name, :description, :date, :bar_id, :start_date, :end_date, :flyer_base64,:flyer, :event_id)
  end

  def handle_flyer_attachment
    decoded_flyer = decode_base64_image(event_params[:flyer_base64])
    if decoded_flyer
      @event.flyer.attach(io: decoded_flyer[:io], filename: decoded_flyer[:filename], content_type: decoded_flyer[:content_type])
    else
      render json: { error: 'Error al procesar el flyer' }, status: :unprocessable_entity
    end
  end

  def decode_base64_image(base64_string)
    return nil unless base64_string.present?

    begin
      # Validar si el string contiene información sobre el tipo de contenido y el base64
      if base64_string.match(%r{^data:(.*?);base64,(.*)$})
        content_type = Regexp.last_match(1) # Extraer tipo de contenido
        encoded_image = Regexp.last_match(2) # Extraer la imagen en base64

        # Decodificar la imagen
        decoded_image = Base64.decode64(encoded_image)
        extension = content_type.split('/')[1] # Obtener la extensión del archivo

        io = StringIO.new(decoded_image)
        filename = "flyer.#{extension}"

        { io: io, filename: filename, content_type: content_type }
      else
        Rails.logger.error('Formato base64 no válido')
        nil
      end
    rescue => e
      Rails.logger.error("Error al decodificar la imagen: #{e.message}")
      nil
    end
  end
end
