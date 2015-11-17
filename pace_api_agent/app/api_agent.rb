require 'sinatra'
require 'json'
require './pace_api_agent/lib/crawler'


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
