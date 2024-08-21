class API::V1::EventsController < ApplicationController
    before_action :set_event, only: [:show, :update, :destroy]
    before_action :authenticate_user!, only: [:create, :update, :destroy]
  
    def show
      render json: @event
    end
  
    def create
      @event = Event.new(event_params)
      if @event.save
        if params[:flyer]
          @event.picture.attach(params[:flyer])
        end
        render json: @event, status: :created
      else
        render json: @event.errors, status: :unprocessable_entity
      end
    end
  
    def update
      if @event.update(event_params)
        if params[:flyer]
          @event.picture.attach(params[:flyer])
        end
        render json: @event, status: :ok
      else
        render json: @event.errors, status: :unprocessable_entity
      end
    end
  
    def destroy
      @event.destroy
      head :no_content
    end
  
    private
  
    def set_event
      @event = Event.find(params[:id])
    end
  
    def event_params
      params.require(:event).permit(:name, :description, :date, :bar_id, :start_date, :end_date)
    end
  
    def authenticate_user!
      render json: { error: 'Not Authorized' }, status: :unauthorized unless current_user
    end
  
    def current_user
      @current_user ||= User.find_by(id: session[:user_id])
    end
  end
  