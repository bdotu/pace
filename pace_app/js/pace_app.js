var app = angular.module('PACEApp', ['ngRoute', 'ui.bootstrap'])

.config(['$routeProvider', function($routeProvider){
	$routeProvider
		.when("/search", {
			templateUrl: "partials/search.html",
			controller: "searchController"
		})
		.when("/", {
			templateUrl: "partials/signUp.html",
			controller: "signUpController" 
		})
		.when("/notSignedIn", {
			templateUrl: "partials/notSignedIn.html"
		})
		.when("/messages", {
			templateUrl: "partials/message.html",
			controller: "messageController"
		})
		.when("/result", {
			templateUrl: "partials/result.html",
			controller: "resultController"
		})
		.otherwise({
			templateUrl: "partials/signUp.html",
			controller: "signUpController"
		})
}])

.config(function($httpProvider) {
  //Enable cross domain calls
  $httpProvider.defaults.useXDomain = true;

  //Remove the header used to identify ajax call  that would prevent CORS from working
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
})

.constant('API_INFO', {
	'url' : 'http://localhost:9393/getListings'
})

.directive('passwordMatch', function(){
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, elem, attr, controller){
			function checkPassword(){
				var pword1 = scope.$eval(attr.ngModel);
				var pword2 = scope.$eval(attr.passwordMatch);
				return pword1 === pword2;
			};
			scope.$watch(checkPassword, function(value){
				controller.$setValidity("unique", value)
			});
		}
	}
})

.directive('checkEmail', function(){
	return {
		restrict: 'A',
		require: ['checkEmail','ngModel'],
		scope: {
			checkEmail: '='
		},
		link: function(scope, elem, attr, controller){
			// checkEmail is the attribute name
			scope.$watch('checkEmail', function(newValue, oldValue){
				// control is the array specified the require
				// controller[0] is the inner controller::checkEmail
				// controller[1] is the ngModel controller:: ngModel
				controller[1].$setValidity("uniqueEmail", false);
				controller[0].verifyEmail(scope.checkEmail)
				.success(function(response){
					if (response === "unique")
						controller[1].$setValidity("uniqueEmail", true);
					else 
						controller[1].$setValidity("uniqueEmail", false);
				})
				.error(function(response){
					console.log("Email Validation Error");
				});
			});
		},
		controller: function($scope, $http){
			this.verifyEmail = function(email){
				// in place of passing email as an argument, we could also follow the approach below
				// var email = $scope.checkEmail;
				// console.log("Email: " + email);
				return $http.post('scripts/checkEmail.php', email)
			};
		}
	}
})

.factory('AddressFactory', ['$http', function($http){
	
	var factory = {};

	factory.getCityInformation = function(){
		return $http.get('scripts/cities.php')
	};

	return factory;
}])

.factory('ListingsFactory', ['$http', '$location', '$q', 'API_INFO', function($http, $location, $q, API_INFO){
	
	var factory = {};
	var listings = [];

	/*
	factory.setListings = function(term){	
	  console.time("Sync - listings retrieval time");
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
		  console.timeEnd("Sync - listings retrieval time");
		  $location.path('/result');
	  });
	};
	*/

	factory.setListings = function(term) {
		console.time("Async - listings retrieval time");
		var location = term.replace(/, /g, "-");
		location = location.toLowerCase().replace(/ /g, "");
		var listingsPromises = [];
		var numberOfListingsPage = 5;

		for (var i = 1; i <= numberOfListingsPage; i++){
			var deferred = $q.defer(); // Create new instance of deferred
			var address_information = {"location": location, "listing_page": i};
			listingsPromises.push($http.post(API_INFO.url, address_information));
		}

		$q.all(listingsPromises).then(function(results){
			console.log(results);
			for(var i = 0; i < results.length; i++) {
				//results[i] contatins data which contains information for apartments and homes.
				if (!!results[i]) {
					listings = listings.concat(results[i].data.homes);
				}
			}
			console.log(listings);
			console.timeEnd("Async - listings retrieval time");
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

.factory('userFactory', ['$q', '$window', function($q, $window){
	var factory = {};
	
	factory.setInformation = function(userInfo){
		$window.localStorage['userInformation'] = angular.toJson(userInfo);
	};
	factory.getInformation = function(){
		var deferred = $q.defer();
		deferred.resolve(angular.fromJson($window.localStorage['userInformation']));
		return deferred.promise;
	};
	factory.deleteInformation = function(){
		$window.localStorage['userInformation'] = null;
	};
	return factory;
}])

.controller('messageController', ['userFactory','$scope', '$http', '$location', '$modal', '$timeout', function(userFactory, $scope, $http, $location, $modal, $timeout) {
	$scope.userInfo;
	$scope.inbox;
	$scope.sentMail;
	$scope.inboxOrSentMail = {};

	$scope.sentInboxPromise = function() {
		return $http.post('scripts/getMessage.php', {'id' : $scope.userInfo.id, 'messageType' : 'inbox' }, {cache: true});
	};

	$scope.getSentMailPromise = function () {
		return $http.post('scripts/getMessage.php', {'id' : $scope.userInfo.id, 'messageType' : 'sentmail' }, {cache: true});
	};

	$scope.toggleMail = function(mailbox, initialization) {
		if (mailbox === 'inbox') {
			$scope.sentInboxPromise()
			.then(function(response){
				$scope.inbox = response.data;
				$scope.inboxOrSentMail['sentmail'] = false;
				$scope.inboxOrSentMail['inbox'] = true;
				if (!!initialization && initialization.new_instance) {
					$scope.getSentMailPromise().then(function (sentmailResponse) {
						if (sentmailResponse.data.length > 0) {
							$scope.sentMail = sentmailResponse.data;
						}
					}, function(response) {
						console.log("error: " + response);
					})
				}
			}, function(response){
				console.log("error: " + response);
			});
		}
		else if (mailbox === 'sentmail') {
			$scope.getSentMailPromise()
			.then(function(response){
				$scope.sentMail = response.data;
				$scope.inboxOrSentMail['sentmail'] = true;
				$scope.inboxOrSentMail['inbox'] = false;
			}, function(response){
				console.log("error: " + response);
			});
		}
	}

	$scope.init = function(){
		userFactory.getInformation()
		.then(function(userInfo){

			// Return an object e.g. {'inbox' : inboxArray, 'sentMail' : sentMail}
			$scope.userInfo = userInfo;
			$scope.inbox = []; 
			$scope.sentMail = [];
			if (!$scope.userInfo){
				$location.path('/notSignedIn');
			}
			$scope.toggleMail('inbox', /*initialization*/ {'new_instance' : true});		
		})
	};

	$scope.init();

	$scope.animationsEnabled = true;

	$scope.reply = function(message) {

		var replyInstance = $modal.open({
      	animation: $scope.animationsEnabled,
      	templateUrl: 'partials/replyMessage.html',
      	controller: 'ReplyInstanceCtrl',
      	resolve: {
      		messageToReplyTo: function() {
      			return message;
      			} 
      		}
    	});

    	replyInstance.result.then(function (response) {
	    	var message_info = {'user_id' : message.user_response_id, 'sender_id' : $scope.userInfo.id, 'subject' : message.subject, 'body' : response.body};
	    	message.messageSent = false;

	    	$http.post('scripts/composeMessage.php', message_info)
	    	.success(function(response){
	    		$timeout(function () { message.messageSent = true; }, 3000);  
	    		$timeout(function() {$scope.init(); }, 5000);
	    	})
	    	.error(function(response){
	    		console.log("error: " + response);
	    	});
	    }, function () {
	      		console.log('Modal dismissed at: ' + new Date());
	    });
	};

	$scope.delete = function(message) {
		var deleteInstance = $modal.open({
      	animation: $scope.animationsEnabled,
      	templateUrl: 'partials/deleteMessage.html',
      	controller: 'DeleteInstanceCtrl',
      	size: 'sm'
    	});

    	deleteInstance.result.then(function (response) {
    		var messageType;
    		if ($scope.inboxOrSentMail['inbox']){
    			messageType = 'inbox';
    		}
    		else {
    			messageType = 'sentmail';
    		}
	    	var message_info = {'message_id' : message.id, 'messageType' : messageType};
	    	
	    	message.messageDeleted = false;
	    	$http.post('scripts/deleteMessage.php', message_info)
	    	.success(function(response){
	    		$timeout(function () { message.messageDeleted = true; }, 3000);  
	    		$timeout(function() {$scope.init(); }, 5000);
	    	})
	    	.error(function(response){
	    		console.log("error: " + response);
	    	});
	    }, function () {
	      		console.log('Modal dismissed at: ' + new Date());
	    });

	};

}])

.controller('ReplyInstanceCtrl', function ($scope, $modalInstance, messageToReplyTo) {
	
	$scope.message;

	$scope.init = function() {
		$scope.message = {};
		$scope.message.subject = messageToReplyTo.subject;
	}
	$scope.init();
  	$scope.ok = function () {
    	$modalInstance.close($scope.message);
  	};

  	$scope.cancel = function () {
    	$modalInstance.dismiss('cancel');
  	};
})

.controller('DeleteInstanceCtrl', function ($scope, $modalInstance) {
	
	$scope.ok = function () {
    	$modalInstance.close();
  	};

  	$scope.cancel = function () {
    	$modalInstance.dismiss('cancel');
  	};
})

.controller('signUpController', ['userFactory','$rootScope','$scope', '$http', '$location', function(userFactory, $rootScope, $scope, $http, $location){
	$scope.signUpData = {};
	$scope.userInfo;
	$scope.init = function(){
		userFactory.getInformation()
		.then(function(userInfo){
			$scope.userInfo = userInfo;
			if(!!$scope.userInfo) {
				$location.path("/search");
			}
		})
		
	}
	$scope.init();
	$scope.submitForm = function(){
		//console.log($scope.signUpData);
		$http.post('scripts/signUp.php', $scope.signUpData)
		.success(function(response) {
			console.log(response);
			userFactory.setInformation({'firstname' : $scope.signUpData.fname, 'id' : response.id});
			$rootScope.$broadcast('signUpSuccessful');
 			$location.path("/search");
		})
		.error(function(response){
			console.log(response);
		});
	};
}])

.controller('searchController', ['$http', '$scope', 'ListingsFactory', 'AddressFactory', function($http, $scope, ListingsFactory, AddressFactory){
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
		$scope.gettingListings = true; // Display loading donut on submit
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

.controller('resultController', ['$scope', '$location', '$modal', 'ListingsFactory', function($scope, $location, $modal, ListingsFactory){
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
      templateUrl: 'partials/composeMessage.html',
      controller: 'ModalInstanceCtrl',
      size: size,
    });

	modalInstance.result.then(function (response) {
    	var message_info = {'user_id' : user.id, 'sender_id' : $scope.userInfo.id, 'subject' : response.subject, 'body' : response.body};
    	$http.post('scripts/composeMessage.php', message_info)
    	.success(function(response){
    		/*
	    		show loading message button, then sent button
	    		user.messageSent = false;
	    		$timeout(function () { user.messageSent = true; }, 3000);
	    		$timeout(function () { user.messageSent = undefined; }, 5000);  
	    		*/ 
    	})
    	.error(function(response){
    		console.log("error: " + response);
    	});
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
})

.controller('signInController', ['userFactory','$scope', '$http', '$location', '$interval', function(userFactory, $scope, $http, $location, $interval){
	$scope.signInData = {};
	$scope.userInfo;
	$scope.signInError;
	$scope.new_message = false;;

	$scope.init = function(){
		userFactory.getInformation()
		.then(function(userInfo){
			$scope.userInfo = userInfo;
			var path = $location.path();
			if (path.endsWith('home')) {
				$scope.isHomeActive = true;
				$scope.isMessageActive = false;
			}
			else if (path.endsWith('messages')) {
				console.log('messages');
				$scope.isMessageActive = true;
				$scope.isHomeActive = false;
			}
		})
	}
	$scope.init();

	$scope.$on('signUpSuccessful', function (event, args) {
		$scope.init();
	});

	$scope.goHome = function() {
		$scope.isMessageActive = false;
		$scope.isHomeActive = true;
		$location.path('/search');
	};

	$scope.getMessages = function() {
		$scope.isMessageActive = true;
		$scope.isHomeActive = false;
		$scope.new_message = false;
		$location.path('/messages');
	};

	$interval(function() {
		if (!!$scope.userInfo) {
		$http.post('scripts/checkNewMessage.php', $scope.userInfo.id)
        .success(function(response) {
        	if (response === "new_message_available") {
        		$scope.new_message = true;
        	}
        })
        .error(function(response) {
        	console.log(response);
        })
      }
  }, 10000);

	$scope.logout = function(){
		userFactory.deleteInformation();
		$scope.userInfo = null;
		$scope.signInError = false;
		$location.path("/")
	};

	$scope.submitForm = function(){
		$http.post('scripts/signIn.php', $scope.signInData)
		.success(function(response){
			if (response === "error") {
				console.log("error");
				$scope.signInError = true;
			}
			else {
				$scope.userInfo = response;
				userFactory.setInformation({'firstname' : response.firstname, 'id' : response.id});
				$location.path("/search");
			}
		})
		.error(function(response){
			console.log(response);
		})
	}
}]);
