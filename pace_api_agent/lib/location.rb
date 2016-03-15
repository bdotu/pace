require 'geocoder'

class Location < ActiveRecord::Base
  extend Geocoder::Model::ActiveRecord

  attr_accessor :address, :latitude, :longitude
  geocoded_by :address
  geocoded_by :full_address
  # reverse_geocoded_by :latitude, :longitude
  after_validation :geocode, :if => :address_changed?

  # def location_params
  #   params.require(:location).permit("address, :latitude, :longitude")
  # end

  def full_address
    "#{address}, #{zipcode}, #{city}, #{country}"
  end
end
