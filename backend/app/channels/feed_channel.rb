# app/channels/feed_channel.rb
class FeedChannel < ApplicationCable::Channel
  def subscribed
    stream_from "feed_channel_#{current_user.id}"
  end

  def unsubscribed
    stop_all_streams
  end

  def send_message(data)
    ActionCable.server.broadcast("feed_channel_#{current_user.id}", data)
  end
end
