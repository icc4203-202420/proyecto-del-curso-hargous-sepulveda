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
          @event = Event.find_by(id: params[:event_id])
          user = User.find_by(id: params[:user_id])
          if user.push_token.present?
            PushNotificationService.send_notification(
              to: user.push_token,
              title: "Confirmaste tu asistencia al evento!",
              body: "Te esperamos en #{@event.name}.",
              data: {}
            )
          end
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
  