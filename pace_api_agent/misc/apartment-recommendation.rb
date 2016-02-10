#!/usr/bin/env ruby

class Apartment < Struct.new(:tag)

  def keywords
    @keywords ||= self.tag.gsub(/[a-zA-Z]{3,}/).map(&:downcase).uniq.sort
  end

end

class ApartmentRecommender

  def initialize apartment, apartments
    @apartment, @apartments = apartment, apartments
  end

  def recommendations
    @apartments.map! do |this_apartment|
      this_apartment.define_singleton_method(:jaccard_index) do @jaccard_index;  end

      this_apartment.define_singleton_method("jaccard_index=") do |index|
        @jaccard_index = index || 0.0
      end

      intersection = (@apartment.keywords & this_apartment.keywords).size
      union = (@apartment.keywords | this_apartment.keywords).size

      this_apartment.jaccard_index = (intersection.to_f / union.to_f) rescue 0.0
      this_apartment

    end.sort_by { |apartment| 1 - apartment.jaccard_index }

  end

end


# Load apartments from this file
# Create initial apartment
# Load recommender
# Find recommendations
# Show apartments that match the most
APARTMENTS = DATA.read.split("\n").map { |l| Apartment.new(l) }

this_apartment = Apartment.new("rent, apartment, two bedrooms, pool, balcony, elevator, one bathroom, gym, parking garage")

recommender = ApartmentRecommender.new(this_apartment, APARTMENTS)

recommended_apartments = recommender.recommendations

recommended_apartments.each do |apartment|
  puts "#{apartment.tag} (#{'%.2f' % apartment.jaccard_index})"
  puts "\n"
end

__END__
One bedroom apartment for sale
A house for rent
Apartment with three bedrooms, two bathrooms, and a pool
Five bedroom house for sale
Two bedrooms apartment for rent with a balcony, gym, and free parking
A mansion with an elevator
Apartment with two bedrooms and one bathroom
