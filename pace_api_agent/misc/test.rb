#Testing out new gems

# require 'geocoder'
require 'open-uri'
require 'nokogiri'
require 'json'

class City

  def get_city_info(city_state)
    city_info = Geocoder.search(city_state)
    city_lat = city_info[0].latitude
    city_long = city_info[0].longitude
    puts "-----------------------"
    puts city_lat
    puts city_long
    puts "-----------------------"
    city_info.inspect
  end

  def get_details(city_state)
    properties = Hash.new{|property,price| property[price] = []}
    temp = []
    base_url = "http://www.zillow.com"
    home_url = "#{base_url}/homes/for_rent/#{city_state}"
    apt_url = "#{base_url}/#{city_state}/apartments"
    page_homes = Nokogiri::HTML(open(home_url))
    page_apts = Nokogiri::HTML(open(apt_url))
    home_prop = page_homes.xpath('//article')
    apt_prop = page_apts.xpath('//article')

    puts "Crawling..."
    home_prop[1..-2].each do |row|
      property = row.css('dt.property-address').text
      price =  row.css('dt.price-large').text
      if(property != "" && price != "")
        details = row.css('dt.property-address a').attr('href').text
        prop_dets = Nokogiri::HTML(open("http://www.zillow.com/#{details}"))
        # puts "Address: " + property
        # puts "Price: " + price
        # prop_dets.xpath('//img').each{ |img_link|  ary.push(img_link['href'])}
        prop_dets.xpath('//img').each do |img_link|
          if(img_link['href'] != nil)
            temp.push(img_link['href'])
          end
        end
        ary = temp.dup
        housing_info = {"address" => property, "price" => price, "image" => ary}
        temp.clear
        # puts housing_info
        properties[:homes] << housing_info
      end
      puts JSON.pretty_generate(properties)
    end
    # puts properties.to_json
  end
end

city = City.new
city.get_details("seattle-wa")
# puts city.get_city_info("Nashville_TN")


# Use geocoder to get latitude and longitude of any given city
# Use haversine to calculate the great circle
# Get nearby cities based on
