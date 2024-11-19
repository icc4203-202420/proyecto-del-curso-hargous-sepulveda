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
        
          if user.friends.present? 
            user.friends.each do |friend|
              if friend.push_token.present?
                PushNotificationService.send_notification(
                  to: friend.push_token,
                  title: "@#{user.handle} se raja con unas chelas!!",
                  body: "¡Tu amigo/a @#{user.handle} ha confirmado su asistencia al evento #{@event.name}.",
                  data: {}
                )
              end
            end
          end
        end
      end
    

      private
    
      def attendance_params
        params.require(:attendance).permit(:event_id, :user_id)
      end
  end
  