require 'sinatra'
require 'json'
require 'sinatra/activerecord'
require './lib/crawler'
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

get '/hi' do
  "Hello World!!!"
end

#puts listing from the crawl in the browser
get '/getListings/:city_state' do
  crawler = CrawlerHelper.new
  # puts params['city_state']
  crawler.crawl(params['city_state'])
end

#same priniciple applies in the case of a post request
post '/getListings' do
  crawler = CrawlerHelper.new
  crawler.crawl(params[:location])
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
