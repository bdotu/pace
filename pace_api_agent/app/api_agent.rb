require 'sinatra'
# require 'sinatra/base'
require 'json'
# require 'open-uri'
# require 'nokogiri'
require './lib/crawler'


before do
  headers "Content-Type" => "text/html; charset=utf-8"
end

get '/hi' do
  "Hello World!!!"
end

get '/getListings' do
  crawler = CrawlerHelper.new
  crawler.crawl
  # response = crawler.crawl
  # response.to_json
  # "Something"
end
