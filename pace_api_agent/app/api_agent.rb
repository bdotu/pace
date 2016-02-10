require 'sinatra'
require 'json'
require '../lib/crawler'


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