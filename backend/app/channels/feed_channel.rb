# app/channels/feed_channel.rb
class FeedChannel < ApplicationCable::Channel
  def subscribed
    stream_from "feed_channel_#{params[:user_id]}"
  end

  def unsubscribed
    stop_all_streams
  end

  def send_message(data)
    ActionCable.server.broadcast("feed_channel_#{params[:user_id]}", data)
  end
end
