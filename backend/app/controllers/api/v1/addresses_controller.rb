class API::V1::AddressesController < ApplicationController
    def countrys
      @bar = Bar.find(params[:bar_id])
      @address = @bar.address
      @country = @address.country
      
      render json: { country: @country }, status: :ok
    end
  end