require 'open-uri'
require 'nokogiri'

class CrawlerHelper
  BASE_URL = "http://www.zillow.com"

  def crawl(city_state, listing_page)
    properties = Hash.new{|property,price| property[price] = []}
    tmp = [] # holds image links until dump

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
          property_details_url = row.css('dt.property-address a').attr('href').text
          property_details = Nokogiri::HTML(open("http://www.zillow.com/#{property_details_url}"))
          property_details.xpath('//img').each do |img_link|
            if(img_link['href'] != nil)
              tmp.push(img_link['href'])
            end
          end
          image_links = tmp.dup # deep copy
          housing_info = {"address" => property, "price" => price, "images" => image_links}
          # clear tmp array to avoid appending to existing entries
          tmp.clear
          properties[:homes] << housing_info
        end
        # properties[:homes] << property
        # properties[:homes] << price
      end

      apt_prop[1..-2].each do |row|
        property = row.css('dt.property-address').text
        price = row.css('dt.price-large').text
        if(property != "" && price != "")
          property_details_url = row.css('dt.property-address a').attr('href').text
          property_details = Nokogiri::HTML(open("http://www.zillow.com/#{property_details_url}"))
          property_details.xpath('//img').each do |img_link|
            if(img_link['href'] != nil)
              tmp.push(img_link['href'])
            end
          end
          image_links = tmp.dup
          housing_info = {"address" => property, "price" => price, "images" => image_links}
          tmp.clear
          properties[:apartments] << housing_info
        end
        # properties[:apartments] << property
        # properties[:apartments] << price
      end
      JSON.pretty_generate(properties)

  end
end