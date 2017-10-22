var app = angular.module('social_network', ['ngRoute']);

app.config(function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'views/users.html',
			controller: 'users_ctrl'
		})
		.when('/user', {
			templateUrl: 'views/user.html',
			controller: 'user_ctrl'
		})
});


app.service('users_services', function($http, $q) {
	var deferred = $q.defer();
	$http.get('data.json')
		.then(function(res) {
			deferred.resolve(res.data);
		});
	this.getUsers = function() {
		return deferred.promise;
	}
});

app.controller('users_ctrl', function($scope, users_services){
	var userPromise = users_services.getUsers();
	userPromise.then(function(data) {
		$scope.users = data;
	});
});

app.controller('user_ctrl', function($scope, users_services, $location){

	var userPromise = users_services.getUsers();
	userPromise.then(function(data) {
		$scope.user = $scope.getUserData($location.search().id, data);
	});


	$scope.getUserData = function(id, users) {
		var user_index = users.map(function(u){return u.id}).indexOf(parseInt(id));
		var user = users[user_index];

		user.friendsList = [];
		for (i=0; i<user.friends.length; i++) {
			user_friend_index = users.map(function(u){return u.id}).indexOf(parseInt(user.friends[i]));
			user.friendsList.push(users[user_friend_index]);
		}

		user.friendsOfFriendsList = [];
		for (i=0; i<user.friendsList.length; i++) {

			for (j=0; j<user.friendsList[i].friends.length; j++) {

				// if friendOfFriend not current user, if friendOfFriend not friend of user add and if friendOfFriend is not add on list yet
				if ( 
					user.friendsList[i].friends[j] !== user.id && 
					user.friendsOfFriendsList.map(function(u){return u.id}).indexOf(user.friendsList[i].friends[j]) < 0 && 
					user.friendsList.map(function(u){return u.id}).indexOf(user.friendsList[i].friends[j]) < 0
					) {

					user_fof_index = users.map(function(u){return u.id}).indexOf(user.friendsList[i].friends[j]);
					fof = users[user_fof_index];

					friend_by=""
					user_fof_index = users.map(function(u){return u.id}).indexOf(user.friendsList[i].id);
					friend_by = users[user_fof_index].firstName + " " + users[user_fof_index].surname;
					fof.friendBy = friend_by;

					user.friendsOfFriendsList.push(angular.copy(fof))
				}
			}
		}

		user.suggestedFriendsList = [];

		for (i=0; i<users.length; i++) {

			common_friends = [];
			if (users[i].id !== user.id && !user.friends.includes(users[i].id)) {
				common_friends = user.friends.filter((n) => users[i].friends.includes(n));

				if (common_friends.length > 1) {
					// if (user.suggestedFriendsList.map(function(u){return u.id}).indexOf(users[user_sf_index].id) == -1) {
					sf = users[i];
					common_friends_string = "";
					for (j=0; j<common_friends.length; j++) {
						user_cf_index = users.map(function(u){return u.id}).indexOf(common_friends[j]);
						common_friends_string += users[user_cf_index].firstName + " " + users[user_cf_index].surname;
						if (j != common_friends.length-1)
							if ( j == common_friends.length-2)
								common_friends_string += " and ";
							else 
								common_friends_string += ", ";
					}
					sf.common_friends = common_friends_string;
					user.suggestedFriendsList.push(angular.copy(sf));	
				}
			}

		}

		return user;
	}

});