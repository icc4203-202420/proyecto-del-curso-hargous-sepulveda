class API::V1::UsersController < ApplicationController
  respond_to :json
  # autenticación
  before_action :verify_jwt_token, only: [:update]
  before_action :set_user, only: [:show, :update]
# friendship autentication by now erased
  def show
    user = User.find_by(id: params[:id])
    
    if user
 
      render json: { user: { id: user.id, name: "#{user.first_name} #{user.last_name}", email: user.email , handle: user.handle} }, status: :ok
    else
      render json: { error: "User not found" }, status: :not_found
    end
  end
  
  def search
    query = "%#{params[:q]}%"
    if params[:q]
      @users = User.where("handle LIKE ?", query)
    else
      @users = User.all
    end
  
    render json: { users: @users }, status: :ok
  end
  
  def create
    @user = User.new(user_params)
    if @user.save
      render json: @user, status: :ok
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  def update
    if @user.update(user_params)
      render :show, status: :ok, location: api_v1_users_path(@user)
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end
  # GET /api/v1/users/:id/friendships
  def friendships
    user = User.find(params[:id])
    friendships = user.friendships.includes(:friend)
    render json: friendships.map { |friendship| friendship.friend }, status: :ok
  end

  # POST /api/v1/users/:id/friendships
  def create_friendship
    user = User.find(params[:id])
    friend = User.find_by(id: params[:friend_id])

    return render json: { error: 'Friend not found' }, status: :not_found unless friend

    existing_friendship = user.friendships.find_by(friend_id: friend.id)
    if existing_friendship
      return render json: { error: 'Friendship already exists' }, status: :unprocessable_entity
    end

    bar = Bar.find_by(id: params[:bar_id]) if params[:bar_id]

    friendship = user.friendships.build(friend: friend, bar: bar)

    if friendship.save
      render json: friendship, status: :created
    else
      render json: friendship.errors, status: :unprocessable_entity
    end
  end

  private

  def set_user
    @user = User.find(params[:id])
  end

  def user_params
    params.fetch(:user, {}).permit(
      :id, :first_name, :last_name, :email, :age,
      { address_attributes: [:id, :line1, :line2, :city, :country, :country_id,
                            country_attributes: [:id, :name]],
        reviews_attributes: [:id, :text, :rating, :beer_id, :_destroy]
      }
    )
  end
# autenticación
  def verify_jwt_token
    authenticate_user!
    head :unauthorized unless current_user
  end


end
