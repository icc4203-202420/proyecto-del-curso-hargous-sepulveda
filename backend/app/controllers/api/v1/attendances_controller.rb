class API::V1::AttendancesController < ApplicationController
    def index_by_event
      attendances = Attendance.where(event_id: params[:event_id])
      user_ids = attendances.pluck(:user_id)  
      
      render json: {
        event_id: params[:event_id],
        attendees: user_ids
      }, status: :ok
    end
  end
  