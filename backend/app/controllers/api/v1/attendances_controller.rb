class API::V1::AttendancesController < ApplicationController
    def index_by_event
      attendances = Attendance.where(event_id: params[:event_id])
      user_ids = attendances.pluck(:user_id)  
      
      render json: {
        event_id: params[:event_id],
        attendees: user_ids
      }, status: :ok
    end

    def create
        attendance = Attendance.new(attendance_params)
        
        if attendance.save
          render json: { message: 'Asistencia confirmada', attendance: attendance }, status: :created
        else
          render json: { errors: attendance.errors.full_messages }, status: :unprocessable_entity
        end
      end
    
      private
    
      def attendance_params
        params.require(:attendance).permit(:event_id, :user_id)
      end
  end
  