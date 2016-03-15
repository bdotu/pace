require 'sinatra'
require 'json'
require '../lib/crawler'
# require 'geocoder'
# require 'active_record'
require 'sinatra/activerecord'
require './lib/location'

set :database, {adapter: "sqlite3", database:"locations.sqlite3"}

register Sinatra::ActiveRecordExtension

before do
  content_type :json
  # headers "Content-Type" => "text/html; charset=utf-8"
  headers 'Access-Control-Allow-Origin' => '*',
          'Access-Control-Allow-Methods' => ['OPTIONS', 'GET', 'POST'],
          'Access-Control-Allow-Headers' => 'Content-Type'
end

options '/getListings' do
    200
end

get '/getListings' do
  crawler = CrawlerHelper.new
  crawler.crawl("nashville-tn", 1)
end

post '/getListings' do
  puts "call successful"
  begin
      params.merge! JSON.parse(request.env["rack.input"].read)
  rescue JSON::ParserError
      logger.error "Cannot parse request body."
  end
  puts params[:location]
  puts params[:listing_page]
  crawler = CrawlerHelper.new
  response = crawler.crawl(params[:location], params[:listing_page])
  print response.length
  #puts response
  return response
  #{result: params[:message]}.to_json

end

# get '/nearby/:city_state' do
#   location = Location.new
#   # location.connection
#   location.near("#{params['city_state']}", 10).inspect
#   # Geocoder.search("#{params['city_state']}").inspect
#   # Geocoder.search("Nashville TN").inspect
# end

get '/nearby' do
  # Geocoder.coordinates("Nashville, TN").inspect
  nearby_cities = Location.near("Nashville, TN", 25, :order => "distance")
  # nearby_cities.geocoded
  nearby_cities.inspect #Rake geocode:all not working
  # puts nearby_cities.blank?
end
