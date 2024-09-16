require 'factory_bot_rails'

# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Initialize the review counter
ReviewCounter.create(count: 0)

if Rails.env.development?
  # Create custom countries
  countries = [
    FactoryBot.create(:country, name: "Chile"),
  ]

  # Create custom addresses
  addresses = [
    FactoryBot.create(:address, line1: "Francisco Bulnes Correa 1156", line2: "7610588 Las Condes", city: "Santiago", country: countries.first),
    FactoryBot.create(:address, line1: "Av. Pdte. Kennedy Lateral", line2: "7560009 Las Condes", city: "Santiago", country: countries.first),
    FactoryBot.create(:address, line1: "Camino de la Huerta 3848", line2: "7700944 Lo Barnechea", city: "Santiago", country: countries.first)
  ]
  
  # Create custom bars with predefined coordinates
  bars = [
    FactoryBot.create(:bar, name: "Sturmtiger's Bar", address: addresses.first, latitude: "-33.39132546864838", longitude: "-70.51527317976134"),
    FactoryBot.create(:bar, name: "Checho's Bar", address: addresses.second, latitude: "-33.39081201541005", longitude: "-70.5496134876965"),
    FactoryBot.create(:bar, name: "El Sacacorcho's Bar", address: addresses.third, latitude: "-33.346435892829774", longitude: "-70.55061262015269")
  ]

  # Create additional bars with random coordinates
  additional_bars_count = 5
  additional_bars = additional_bars_count.times.map do
    address = FactoryBot.create(:address, city: "Santiago", country: countries.first)
    FactoryBot.create(:bar, 
      name: "Additional Bar #{Faker::Address.unique.street_name}", 
      address: address,
      latitude: Faker::Address.latitude.to_s,
      longitude: Faker::Address.longitude.to_s
    )
  end

  # Combine custom and additional bars
  all_bars = bars + additional_bars

  # Create a set of beers
  beers = FactoryBot.create_list(:beer, 10)

  # Associate beers with bars and add reviews
  all_bars.each do |bar|
    # Add random beers to each bar
    bar.beers << beers.sample(rand(1..5))

    # Add reviews for each beer in this bar
    bar.beers.each do |beer|
      FactoryBot.create(:review, user: User.all.sample, beer: beer)
    end
  end

  # Create users with random addresses
  users = FactoryBot.create_list(:user, 10) do |user|
    user.address.update(country: countries.sample)
  end

  # Create breweries with custom countries
  countries.each do |country|
    FactoryBot.create(:brewery_with_brands_with_beers, countries: [country])
  end

  # Create events and friendships
  events = all_bars.map do |bar|
    FactoryBot.create(:event, bar: bar)
  end

  users.combination(2).to_a.sample(5).each do |user_pair|
    FactoryBot.create(:friendship, user: user_pair[0], friend: user_pair[1], bar: all_bars.sample)
  end

  users.each do |user|
    events.sample(rand(1..3)).each do |event|
      FactoryBot.create(:attendance, user: user, event: event, checked_in: [true, false].sample)
    end
  end

  users.each do |user|
    beers = Beer.all.sample(rand(1..3))
    beers.each do |beer|
      FactoryBot.create(:review, user: user, beer: beer)
    end
  end
end
