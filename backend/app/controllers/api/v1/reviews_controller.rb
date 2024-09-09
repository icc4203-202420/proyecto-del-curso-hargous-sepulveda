class API::V1::ReviewsController < ApplicationController
  respond_to :json
  before_action :set_beer, only: [:index, :create]
  before_action :set_review, only: [:show, :update, :destroy]

  def index
    @reviews = Review.where(beer: @beer)
    render json: { reviews: @reviews }, status: :ok
  rescue ActiveRecord::RecordNotFound => e
    render json: { error: e.message }, status: :not_found
  end

  def show
    if @review
      render json: { review: @review }, status: :ok
    else
      render json: { error: "Review not found" }, status: :not_found
    end
  end

  def create
    @review = @beer.reviews.build(review_params)
    if @review.save
      render json: @review, status: :created, location: api_v1_review_url(@review)
    else
      render json: @review.errors, status: :unprocessable_entity
    end
  end

  def update
    if @review.update(review_params)
      render json: @review, status: :ok
    else
      render json: @review.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @review.destroy
    head :no_content
  end

  private

  def set_review
    @review = Review.find_by(id: params[:id])
    render json: { error: "Review not found" }, status: :not_found unless @review
  end

  def set_beer
    @beer = Beer.find(params[:beer_id]) 
  end

  def review_params
    params.require(:review).permit(:id, :text, :rating, :beer_id)
  end
end

