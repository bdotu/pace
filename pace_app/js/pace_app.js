var app = angular.module('PACEApp', ['ngRoute', 'ui.bootstrap'])

.config(['$routeProvider', function($routeProvider){
	$routeProvider.
		when('/', {
        	templateUrl: 'partials/search.html',
            controller: 'SearchController',
		}).
		when('/result', {
			templateUrl: 'partials/result.html',
			controller: 'ResultController'
		}).
		when('/signUp', {
			templateUrl: 'partials/signup.html',
			controller: 'SignUpController'
		}).
		otherwise({
        	templateUrl: 'partials/search.html',
            controller: 'SearchController'
		});
}])

  .config(function($httpProvider) {
      //Enable cross domain calls
      $httpProvider.defaults.useXDomain = true;

      //Remove the header used to identify ajax call  that would prevent CORS from working
      delete $httpProvider.defaults.headers.common['X-Requested-With'];
  })

.factory('AddressFactory', ['$http', function($http){
	
	var factory = {};

	factory.getCityInformation = function(){
		return $http.get('scripts/cities.php')
	};

	return factory;
}])

.factory('ListingsFactory', ['$http', '$location', function($http, $location){
	
	var factory = {};
	var listings = {};

	factory.setListings = function(term){	
	  var address = term.replace(/, /g, "-");
	  address = address.toLowerCase().replace(/ /g, "");
	  console.log("address: " + address);
	  var address = {"location": address};
	  console.log(address);
	  $http.post("http://localhost:4567/getListings", address)
	  .success(function(data){
	  	  // using mock data
	  	  console.log(data);
	  	  listings = data.homes;
		  console.log(listings);
		  $location.path('/result');
	  });
	};
	
	factory.getListings = function(){
		return listings;
	};

	factory.getMatchedUsers = function(){
		return [{"firstname" : "Samuel", "lastname" : "Adeogun", "interests" : "biking, hiking"},
				{"firstname" : "Bright", "lastname" : "Dotu", "interests" : "running, coding"}
				];
	}
	
	return factory;
}])

.directive("repeatPassword", function() {
    return {
        require: "ngModel",
        link: function(scope, elem, attrs, ctrl) {
            var otherInput = elem.inheritedData("$formController")[attrs.repeatPassword];

            ctrl.$parsers.push(function(value) {
                if(value === otherInput.$viewValue) {
                    ctrl.$setValidity("repeat", true);
                    return value;
                }
                ctrl.$setValidity("repeat", false);
            });

            otherInput.$parsers.push(function(value) {
                ctrl.$setValidity("repeat", value === ctrl.$viewValue);
                return value;
            });
        }
    };
})

.controller('SearchController', ['$http', '$scope', 'ListingsFactory', 'AddressFactory', function($http, $scope, ListingsFactory, AddressFactory){
	$scope.listings = {};
	$scope.states = [];
	$scope.cities = [];
	$scope.init = function(){
		$scope.listings;
		AddressFactory.getCityInformation().then(function(res){
			$scope.cities = res.data; ;       
        });
	}
	$scope.init();

	$scope.submitForm = function(){
		console.log($scope.listings.term);
		if(!isNaN(parseInt($scope.listings.term))) {
			// Zip Code Selection
			// Select City based on Zip Code
			var zipcodeObject = {zip : parseInt($scope.listings.term)};
			$http.post('scripts/zipcode.php', zipcodeObject).then(function(res){
				ListingsFactory.setListings(res.data.display_city);
			});
		}
		else {
			// City Selection
			ListingsFactory.setListings($scope.listings.term);
		}
	};
}])

.controller('SignUpController', ['$scope', function ($scope) {
	$scope.signUpFormData = {};

	$scope.signUp = function(){
		console.log($scope.signUpFormData);
	};

}])

.controller('ResultController', ['$scope', '$location', '$modal', 'ListingsFactory', function($scope, $location, $modal, ListingsFactory){
	$scope.listings = {};
	$scope.matchedUsers = {};
	$scope.checkedListing = {};	
	$scope.init = function(){
		$scope.listings = {};
		$scope.listings = ListingsFactory.getListings();
		if (Object.keys($scope.listings).length > 0) {
			$scope.listings.valid = true;
		}
		$scope.matchedUsers = ListingsFactory.getMatchedUsers();
	};

	$scope.init();
	if (Object.keys($scope.listings).length == 0) {
		$location.path('/');
	}

	$scope.notifyMatch = function(){
		console.log($scope.checkedListing);
	}

  	$scope.animationsEnabled = true;

	$scope.open = function (size) {

    var modalInstance = $modal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'partials/message.html',
      controller: 'ModalInstanceCtrl',
      size: size,
    });

    modalInstance.result.then(function (response) {
      console.log(response);
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });
  };

  $scope.toggleAnimation = function () {
    $scope.animationsEnabled = !$scope.animationsEnabled;
  };

}])

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

.controller('ModalInstanceCtrl', function ($scope, $modalInstance) {
  $scope.message = {};
  $scope.ok = function () {
    $modalInstance.close($scope.message);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});
