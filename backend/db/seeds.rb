require 'factory_bot_rails'

# Initialize the review counter
ReviewCounter.find_or_create_by(count: 0)

if Rails.env.development?
  # Create custom countries
  countries = [FactoryBot.create(:country, name: "Chile")]

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
    FactoryBot.create(:bar, name: "Additional Bar #{Faker::Address.unique.street_name}", address: address, latitude: Faker::Address.latitude.to_s, longitude: Faker::Address.longitude.to_s)
  end

  all_bars = bars + additional_bars
  evento = FactoryBot.create( :event, name: "Raid casa Fuenza", description: "esta es una descripcion", date: Time.current, start_date: Time.current, end_date: Time.current + 6.minutes, bar: bars.third)
  # Create a set of beers
  beers = FactoryBot.create_list(:beer, 10)

  # Associate beers with bars and add reviews
  all_bars.each do |bar|
    bar.beers << beers.sample(rand(1..5))
    bar.beers.each { |beer| FactoryBot.create(:review, user: User.all.sample, beer: beer) }
  end

  # Create users with random addresses
  users = FactoryBot.create_list(:user, 10) do |user|
    user.address.update(country: countries.sample)
  end
  yo = FactoryBot.create(:user, email: "mmhargous@gmail.com", password: "123456", handle: "Sturmtiger", first_name: "Martin", last_name: "Hargous")
  # Create the admin user with friends
  admin = FactoryBot.create(:user, email: "admin@admin.com", password: "admin1", handle: "admin")
  admin_friends = users.sample(2)
  admin_friends.each { |friend| FactoryBot.create(:friendship, user: admin, friend: friend, bar: all_bars.sample) }

  # Create breweries with custom countries
  countries.each { |country| FactoryBot.create(:brewery_with_brands_with_beers, countries: [country]) }

  # Create events
  events = all_bars.map { |bar| FactoryBot.create(:event, bar: bar) }

  # Create friendships for all users
  users.each do |user|
    (users - [user]).each do |other_user|
      FactoryBot.create(:friendship, user: user, friend: other_user, bar: all_bars.sample)
    end
  end

  # Create attendances for users and events
  users.each do |user|
    events.sample(rand(1..3)).each do |event|
      FactoryBot.create(:attendance, user: user, event: event, checked_in: [true, false].sample)
    end
  end

  # Create reviews for users and beers
  users.each do |user|
    beers.sample(rand(1..3)).each { |beer| FactoryBot.create(:review, user: user, beer: beer) }
  end

  # Create a special short-duration event (3 minutes)
  short_event = FactoryBot.create(:event, bar: all_bars.sample)
  short_event.update(
    start_date: Time.current,
    end_date: Time.current + 3.minutes
  )
end

# Update all other events to start in the past and end in the future
Event.where.not(id: short_event.id).each do |event|
  event.update(
    start_date: Time.current - 1.day,
    end_date: Time.current + 1.days
  )
end