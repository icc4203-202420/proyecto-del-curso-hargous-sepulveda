class API::V1::UsersController < ApplicationController
  respond_to :json
  before_action :set_user, only: [:show, :update, :friendships, :create_friendship]
  before_action :authenticate_user!, only: [:friendships, :create_friendship]

  def index
    @users = User.includes(:reviews, :address).all   
    render json: @users
  end

  def show
    render json: @user
  end

  def create
    @user = User.new(user_params)
    if @user.save
      render json: @user, status: :created
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  def update
    # byebug
    if @user.update(user_params)
      render json: @user, status: :ok, location: api_v1_user_path(@user)
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  def friendships
    friends = User.joins(:friendships).where(friendships: { user_id: @user.id })
    render json: friends
  end

  def create_friendship
    friend = User.find_by(id: friendship_params[:friend_id])
    
    if friend.nil?
      render json: { error: 'Friend not found' }, status: :not_found
    elsif @user.id == friend.id
      render json: { error: 'Cannot be friends with yourself' }, status: :unprocessable_entity
    else
      friendship = Friendship.new(user: @user, friend: friend, bar_id: friendship_params[:bar_id])

      if friendship.save
        render json: { message: 'Friendship created' }, status: :created
      else
        render json: friendship.errors, status: :unprocessable_entity
      end
    end
  end

  private

  def set_user
    @user = User.find(params[:id])
  end

  def user_params
    params.fetch(:user, {}).
        permit(:first_name, :last_name, :email, :age,
            address_attributes: [:id, :line1, :line2, :city, :country, :country_id, 
              country_attributes: [:id, :name]],
            reviews_attributes: [:id, :text, :rating, :beer_id, :_destroy]
        )
  end

  def friendship_params
    params.require(:friendship).permit(:friend_id, :bar_id)
  end

  def authenticate_user!
    render json: { error: 'Not Authorized' }, status: :unauthorized unless current_user
  end

  def current_user
    @current_user ||= User.find_by(id: session[:user_id])
  end
end
