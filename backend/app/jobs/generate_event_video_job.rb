require 'open-uri'
require 'fileutils'

class GenerateEventVideoJob < ApplicationJob
  queue_as :default

  def perform(event)
    images_dir = Rails.root.join("public", "event_images", event.id.to_s)
    output_video = Rails.root.join("public", "event_videos", "event_#{event.id}.mp4")

    # Create necessary directories if they don't exist
    FileUtils.mkdir_p(images_dir)
    FileUtils.mkdir_p(output_video.dirname)

    Rails.logger.info("Starting video generation for Event #{event.id}")

    # Step 1: Download images related to the event
    image_urls = fetch_image_urls(event.id)
    if image_urls.empty?
      Rails.logger.error("No image URLs found for Event #{event.id}")
      return
    end

    download_images(image_urls, images_dir)

    # Step 2: Generate the video from the downloaded images
    generate_video_from_images(images_dir, output_video, event)
  end

  private

  def fetch_image_urls(event_id)
    base_url = ENV['API_ENDPOINT'] || "http://localhost:3001"
    url = "#{base_url}/api/v1/events/#{event_id}/event_pictures"
    response = URI.open(url).read
    data = JSON.parse(response)

    # Extract flyer URLs
    data.map { |picture| picture["flyer_urls"].first }
  rescue => e
    Rails.logger.error("Error fetching image URLs: #{e.message}")
    []
  end

  def download_images(image_urls, images_dir)
    image_urls.each_with_index do |url, index|
      filename = File.join(images_dir, "image_#{index + 1}.jpg")
      begin
        URI.open(url) do |image|
          File.open(filename, 'wb') { |file| file.write(image.read) }
        end
        Rails.logger.info("Downloaded image #{index + 1} for Event to #{images_dir}")
      rescue => e
        Rails.logger.error("Error downloading image from #{url}: #{e.message}")
      end
    end
  end

  def generate_video_from_images(images_dir, output_video, event)
    # Generate video with FFmpeg, using only .jpg images and overwrite if exists
    ffmpeg_command = "ffmpeg -y -framerate 1 -pattern_type glob -i '#{images_dir}/*.jpg' -c:v libx264 -pix_fmt yuv420p #{output_video}"
    system(ffmpeg_command)

    if File.exist?(output_video)
      video_url = "/event_videos/event_#{event.id}.mp4"
      Rails.logger.info("Video generated successfully for Event #{event.id}: #{video_url}")
      puts "Video URL: #{video_url}"  # Print to console for easy access
      event.update(video_url: video_url)
      notify_users(event)
    else
      Rails.logger.error("Error generating video for Event #{event.id}")
    end
  end

  def notify_users(event)
    if event.attendances
      event.attendances.each do |user|
        if user.push_token.present?
          PushNotificationService.send_notification(
            to: user.push_token,
            title: "Mamá salí en la tele!",
            body: "Ya esta el resumen de #{@event.name}",
            data: {}
          )
        end
      end
    else
      Rails.logger.error("Event #{event.id} does not have an 'attendees' association or method.")
    end
  rescue NameError => e
    Rails.logger.error("NotificationService not found: #{e.message}")
  end
  
end
