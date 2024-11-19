module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      token = request.params[:token]
      decoded_token = decode_token(token)

      if decoded_token
        self.current_user = find_user(decoded_token)
        logger.add_tags 'ActionCable', "User #{current_user.id}"
      else
        reject_unauthorized_connection
      end
    end

    private

    def decode_token(token)
      JWT.decode(token, Rails.application.credentials.devise_jwt_secret_key, true, { algorithm: 'HS256' }).first
    rescue StandardError => e
      logger.error "Token decode error: #{e.message}"
      nil
    end

    def find_user(decoded_token)
      User.find(decoded_token["sub"])
    rescue ActiveRecord::RecordNotFound
      nil
    end
  end
end
