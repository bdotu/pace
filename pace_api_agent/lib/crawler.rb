require 'open-uri'
require 'nokogiri'

class CrawlerHelper
  BASE_URL = "http://www.zillow.com"

  def crawl
    properties = Hash.new{|property,price| property[price] = []}

    (1..5).each do |n|
      home_url = "#{BASE_URL}/homes/for_rent/nashville-tn/#{n}_p"
      apt_url = "#{BASE_URL}/nashville-tn/apartments/#{n}_p"
      page_homes = Nokogiri::HTML(open(home_url))
      page_apts = Nokogiri::HTML(open(apt_url))
      home_prop = page_homes.xpath('//article')
      apt_prop = page_apts.xpath('//article')

      home_prop[1..-2].each do |row|
        property = row.css('dt.property-address').text
        price =  row.css('dt.price-large').text
        properties[:homes] << property
        properties[:homes] << price
      end

      apt_prop[1..-2].each do |row|
        property = row.css('dt.property-address').text
        price = row.css('dt.price-large').text
        properties[:apartments] << property
        properties[:apartments] << price
      end

    end
    JSON.pretty_generate(properties)
  end
end
