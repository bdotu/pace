require 'open-uri'
require 'nokogiri'

class CrawlerHelper
  BASE_URL = "http://www.zillow.com1"

  def crawl(city_state, listing_page)
    properties = Hash.new{|property,price| property[price] = []}

    home_url = "#{BASE_URL}/homes/for_rent/#{city_state}/#{listing_page}_p"
    apt_url = "#{BASE_URL}/#{city_state}/apartments/#{listing_page}_p"
    page_homes = Nokogiri::HTML(open(home_url))
    page_apts = Nokogiri::HTML(open(apt_url))
    home_prop = page_homes.xpath('//article')
    apt_prop = page_apts.xpath('//article')

    home_prop[1..-2].each do |row|
      property = row.css('dt.property-address').text
      price =  row.css('dt.price-large').text
      if(property != "" && price != "")
        housing_info = {"address" => property, "price" => price}
        properties[:homes] << housing_info
      end
      # properties[:homes] << property
      # properties[:homes] << price
    end

    apt_prop[1..-2].each do |row|
      property = row.css('dt.property-address').text
      price = row.css('dt.price-large').text
      if(property != "" && price != "")
        housing_info = {"address" => property, "price" => price}
        properties[:apartments] << housing_info
      end
      # properties[:apartments] << property
      # properties[:apartments] << price
    end
    JSON.pretty_generate(properties)
  end
end