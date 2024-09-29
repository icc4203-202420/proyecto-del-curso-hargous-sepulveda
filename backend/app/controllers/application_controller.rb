class ApplicationController < ActionController::API
  # Decode the JWT token from the Authorization header and set current_user
  def authenticate_with_jwt
    if request.headers['Authorization'].present?
      token = request.headers['Authorization'].split(' ').last
      begin
        jwt_payload = JWT.decode(
          token,
          Rails.application.credentials.devise_jwt_secret_key,
          true,
          { algorithm: 'HS256' }
        ).first
        @current_user = User.find(jwt_payload['sub'])
      rescue JWT::DecodeError, ActiveRecord::RecordNotFound => e
        render json: { status: 401, error: 'Invalid token or user not found.' }, status: :unauthorized
      end
    else
      render json: { status: 401, error: 'Authorization header missing.' }, status: :unauthorized
    end
  end

  # Expose current_user for other controllers
  def current_user
    @current_user
  end
end
