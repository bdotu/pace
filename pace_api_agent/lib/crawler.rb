require 'open-uri'
require 'nokogiri'

class CrawlerHelper
  BASE_URL = "http://www.zillow.com"

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
          property_image_url = row.css('figure').attr('data-photourl').text;
          if (!property_image_url.end_with?(".jpg"))
            # verify retrieved text is a jpeg image
            property_image_url = "";
          end
          property_details_url = "http://www.zillow.com/" + row.css('dt.property-address a').attr('href').text
          housing_info = {"address" => property, "price" => price, "property_details_url" => property_details_url, "property_image_url" => property_image_url}
          properties[:homes] << housing_info
        end
        # properties[:homes] << property
        # properties[:homes] << price
        # properties[:apartments] << property_image_url
        # properties[:apartments] << property_details_url
      end

      apt_prop[1..-2].each do |row|
        property = row.css('dt.property-address').text
        price = row.css('dt.price-large').text

        if(property != "" && price != "")
          property_image_url = row.css('figure').attr('data-photourl').text;
          if (!property_image_url.end_with?(".jpg"))
            # verify retrieved text is a jpeg image
            property_image_url = "";
          end
          property_details_url = "http://www.zillow.com/" + row.css('dt.property-address a').attr('href').text
          housing_info = {"address" => property, "price" => price, "property_details_url" => property_details_url, "property_image_url" => property_image_url}
          properties[:apartments] << housing_info
        end
        # properties[:apartments] << property
        # properties[:apartments] << price
        # properties[:apartments] << property_image_url
        # properties[:apartments] << property_details_url
      end

      JSON.pretty_generate(properties)

  end
end