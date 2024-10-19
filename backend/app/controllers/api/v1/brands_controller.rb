class API::V1::BrandsController < ApplicationController
    def show
      @brand = Brand.find(params[:id])
      render json: @brand
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Brand not found' }, status: :not_found
    end
  end
  